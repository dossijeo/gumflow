/** Update packaging metadata only; the approved game's on-screen version stays
 * 6.1 until a deliberate UI/content change. No network or dependency updates. */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT} from './lib/build.mjs';
export function validVersion(version) {
  // First release pipeline deliberately uses stable numeric versions, also
  // compatible with Windows installer version fields.
  return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)
    && version.split('.').every(part=>Number(part)<=65535);
}
export function rewriteCargoVersion(text,version,lock=false) {
  if(!validVersion(version))throw new Error('Use a stable version such as 6.1.2.');
  const pattern=lock
    ? /(\[\[package\]\]\s*\nname = "gumflow-desktop"\s*\nversion = ")[^"]+("\s*\n)/
    : /(\[package\][\s\S]*?\nversion\s*=\s*")[^"]+("\s*\n)/;
  if(!pattern.test(text))throw new Error('Cannot find GUMFLOW package version; no file was changed.');
  return text.replace(pattern,(_all,left,right)=>left+version+right);
}
export function setVersion(version) {
  if(!validVersion(version))throw new Error('Usage: npm run version:set -- 6.1.2 (stable numeric version, each part <= 65535)');
  const edits=[];
  for(const name of ['package.json','config/project.json','desktop/tauri/package.json','desktop/tauri/src-tauri/tauri.conf.json']) {
    const file=path.join(ROOT,name),data=JSON.parse(fs.readFileSync(file,'utf8'));
    data.version=version;edits.push([file,JSON.stringify(data,null,2)+'\n']);
  }
  const cargo=path.join(ROOT,'desktop/tauri/src-tauri/Cargo.toml');
  edits.push([cargo,rewriteCargoVersion(fs.readFileSync(cargo,'utf8'),version)]);
  const npmLock=path.join(ROOT,'desktop/tauri/package-lock.json');
  if(fs.existsSync(npmLock)) {
    const data=JSON.parse(fs.readFileSync(npmLock,'utf8'));data.version=version;
    if(data.packages?.[''])data.packages[''].version=version;
    edits.push([npmLock,JSON.stringify(data,null,2)+'\n']);
  }
  const cargoLock=path.join(ROOT,'desktop/tauri/src-tauri/Cargo.lock');
  if(fs.existsSync(cargoLock))edits.push([cargoLock,rewriteCargoVersion(fs.readFileSync(cargoLock,'utf8'),version,true)]);
  // Validate every input before making the first write.
  for(const [file,data] of edits)fs.writeFileSync(file,data);
  console.log(`Packaging version ${version}: updated ${edits.length} files. Review, test and commit before tagging v${version}.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {setVersion(process.argv[2]||'');}catch(e){console.error(e.message);process.exitCode=1;}
}
