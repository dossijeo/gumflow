/** Local/CI release helpers. Nothing is published except the explicit publish
 * subcommand, which refuses to change a public release or invent a new tag. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ROOT,sha256} from './lib/build.mjs';
const readJSON=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const output=path.join(ROOT,'release-artifacts');
export function check(tag) {
  const versions=[readJSON('package.json').version,readJSON('config/project.json').version,
    readJSON('desktop/tauri/package.json').version,readJSON('desktop/tauri/src-tauri/tauri.conf.json').version];
  const cargo=fs.readFileSync(path.join(ROOT,'desktop/tauri/src-tauri/Cargo.toml'),'utf8');
  versions.push(/^version\s*=\s*"([^"]+)"/m.exec(cargo)?.[1]);
  if(!versions[0]||!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(versions[0])||versions.some(v=>v!==versions[0]))
    throw new Error('Version mismatch. Synchronize package.json, config/project.json, desktop package/config/Cargo.');
  if(tag!==undefined&&tag!==`v${versions[0]}`)throw new Error(`Expected tag v${versions[0]}, not ${tag}`);
  return versions[0];
}
const copy=(source,name)=>{fs.mkdirSync(output,{recursive:true});fs.copyFileSync(source,path.join(output,name));};
const prefix=()=>`GUMFLOW-v${check()}`;
export function prepareWeb() {
  for(const [from,to] of [['gumflow.html','standalone.html'],['gumflow-itch.zip','itch.zip'],['gumflow-web.zip','web.zip']])
    copy(path.join(ROOT,'dist',from),`${prefix()}-${to}`);
}
function files(dir) {
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    if(e.isSymbolicLink())throw new Error('Unexpected symlink in release input: '+e.name);
    const p=path.join(dir,e.name);return e.isDirectory()?files(p):[p];
  });
}
export function collectNative(platform) {
  if(!['windows','linux'].includes(platform))throw new Error('Use windows or linux.');
  const dir=path.join(ROOT,'desktop/tauri/src-tauri/target/release/bundle');
  const expected=platform==='windows'?[['nsis','.exe','windows-x64-setup.exe']]:
    [['appimage','.AppImage','linux-x64.AppImage'],['deb','.deb','linux-amd64.deb']];
  for(const [folder,ext,name] of expected){
    const candidates=files(path.join(dir,folder)).filter(f=>f.endsWith(ext));
    if(candidates.length!==1)throw new Error(`Expected one ${folder} ${ext}, found ${candidates.length}`);
    copy(candidates[0],`${prefix()}-${name}`);
  }
}
export function checksums(dir=output) {
  const entries=files(dir).filter(p=>path.basename(p)!=='SHA256SUMS').sort();
  if(!entries.length)throw new Error('No release files.');
  const content=entries.map(p=>`${sha256(fs.readFileSync(p))}  ${path.relative(dir,p).split(path.sep).join('/')}`).join('\n')+'\n';
  fs.writeFileSync(path.join(dir,'SHA256SUMS'),content);return content;
}
/** The tag endpoint is documented for published releases. Authenticated list
 * pagination is needed as a fallback to find an existing draft on a rerun. */
export async function findRelease(base,headers,tag,request=fetch) {
  const direct=await request(`${base}/tags/${encodeURIComponent(tag)}`,{headers});
  if(direct.ok)return await direct.json();
  if(direct.status!==404)throw new Error(`Cannot inspect existing release: HTTP ${direct.status}`);
  for(let page=1;page<=100;page++){
    const response=await request(`${base}?per_page=100&page=${page}`,{headers});
    if(!response.ok)throw new Error(`Cannot inspect draft releases: HTTP ${response.status}`);
    const list=await response.json();
    if(!Array.isArray(list))throw new Error('Unexpected release list response');
    const matching=list.filter(r=>r.tag_name===tag);
    if(matching.length>1)throw new Error('Multiple releases use this tag; resolve the duplicate drafts manually.');
    if(matching.length)return matching[0];
    if(list.length<100)return null;
  }
  throw new Error('Release pagination limit reached; refusing to create a possibly duplicate draft.');
}
async function publish(tag) {
  const version=check(tag),repo=process.env.GITHUB_REPOSITORY,token=process.env.GH_TOKEN||process.env.GITHUB_TOKEN;
  if(!process.env.GITHUB_ACTIONS||!token||!/^[-\w.]+\/[-\w.]+$/.test(repo||''))throw new Error('Publish only runs in the trusted GitHub Actions release job.');
  const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
  const commit=git('rev-parse',`${tag}^{commit}`);
  if(commit!==git('rev-parse','HEAD'))throw new Error('Checkout does not match the release tag.');
  const required=['windows-x64-setup.exe','linux-x64.AppImage','linux-amd64.deb','standalone.html','itch.zip','web.zip'];
  for(const suffix of required)if(!fs.existsSync(path.join(output,`${prefix()}-${suffix}`)))throw new Error('Missing required artifact: '+suffix);
  copy(path.join(ROOT,'desktop/tauri/src-tauri/Cargo.lock'),`${prefix()}-Cargo.lock`);
  copy(path.join(ROOT,'desktop/tauri/package-lock.json'),`${prefix()}-desktop-package-lock.json`);
  fs.writeFileSync(path.join(output,`${prefix()}-build-info.json`),JSON.stringify({version,commit,tag,
    workflowRun:process.env.GITHUB_RUN_ID,baseGame:'6.1',nativeTargets:['windows-x64','linux-x64'],signed:false},null,2)+'\n');
  checksums();
  const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
  const base=`https://api.github.com/repos/${repo}/releases`;
  const existing=await findRelease(base,headers,tag);
  if(existing&&!existing.draft)throw new Error('This release is already public. Create a NEW version/tag; it will not be overwritten.');
  if(!existing){
    const text=fs.readFileSync(path.join(ROOT,'docs/RELEASE-NOTES-TEMPLATE.md'),'utf8').replaceAll('__VERSION__',version);
    const made=await fetch(base,{method:'POST',headers,body:JSON.stringify({tag_name:tag,target_commitish:commit,
      name:`GUMFLOW ${tag}`,body:text,draft:true,prerelease:version.includes('-')})});
    if(!made.ok)throw new Error(`Cannot create draft: HTTP ${made.status}`);
  }
  // GitHub CLI handles uploads/retries. --clobber is safe ONLY after the draft
  // check above; existing published releases are never changed by this script.
  const upload=files(output);
  execFileSync('gh',['release','upload',tag,...upload,'--clobber','--repo',repo],{
    cwd:ROOT,stdio:'inherit',env:{...process.env,GH_TOKEN:token}});
  console.log(`Draft ${tag} is ready for MANUAL testing and publication.`);
}
async function main() {
  const [cmd,...args]=process.argv.slice(2);
  if(cmd==='check')console.log(check(args[0]));
  else if(cmd==='web')prepareWeb();
  else if(cmd==='collect')collectNative(args[0]);
  else if(cmd==='checksums')checksums();
  else if(cmd==='publish')await publish(args[0]);
  else throw new Error('Usage: release.mjs check [vX.Y.Z] | web | collect windows|linux | checksums | publish vX.Y.Z');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
