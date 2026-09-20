/** Select the GStreamer modules needed by MP3 + Web Audio before linuxdeploy.
 * Uses linuxdeploy-plugin-gstreamer's supported GSTREAMER_PLUGINS_DIR variable.
 * Does NOT disable bundleMediaFramework or delete arbitrary bundled libraries.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ROOT,sha256} from './lib/build.mjs';
const profile=JSON.parse(fs.readFileSync(path.join(ROOT,'config/linux-audio-plugins.json'),'utf8'));
export function stageAudioPlugins(source,destination,selection=profile) {
  if(selection.schema!==1 || !Array.isArray(selection.plugins) || !selection.plugins.length)
    throw new Error('Invalid Linux audio profile');
  const names=[...selection.plugins,...(selection.optionalPlugins||[])];
  if(new Set(names).size!==names.length || names.some(n=>!/^[-a-z0-9]+$/.test(n)))
    throw new Error('Unsafe or duplicate plugin name');
  if(fs.existsSync(destination) && fs.readdirSync(destination).length)
    throw new Error('Plugin destination must be empty (no stale multimedia modules)');
  // Validate ALL required files before copying any of them.
  const found=[];
  for(const name of names) {
    const filename=`libgst${name}.so`,file=path.join(source,filename);
    if(!fs.existsSync(file)) {
      if(selection.plugins.includes(name))throw new Error(`Missing required audio plugin: ${filename}. Install the GStreamer packages first.`);
      continue;
    }
    const bytes=fs.readFileSync(file);
    if(bytes.subarray(0,4).toString('hex')!=='7f454c46')throw new Error(`Not an ELF plugin: ${filename}`);
    found.push({filename,file,bytes});
  }
  fs.mkdirSync(destination,{recursive:true});
  for(const item of found)fs.copyFileSync(item.file,path.join(destination,item.filename));
  return {profile:'audio-only',plugins:found.map(f=>({name:f.filename,bytes:f.bytes.length,sha256:sha256(f.bytes)}))};
}
function main() {
  if(process.platform!=='linux')throw new Error('This preparation step is Linux-only.');
  const source=process.env.GUMFLOW_GSTREAMER_SOURCE || execFileSync('pkg-config',
    ['--variable=pluginsdir','gstreamer-1.0'],{encoding:'utf8'}).trim();
  if(!source || !fs.statSync(source).isDirectory())throw new Error('GStreamer plugin directory is unavailable.');
  const destination=fs.mkdtempSync(path.join(os.tmpdir(),'gumflow-gstreamer-'));
  const report=stageAudioPlugins(source,destination);
  // Rust caches can contain a previous full AppDir. Only remove this known,
  // generated bundle directory, never the SDK or source plugin directory.
  fs.rmSync(path.join(ROOT,'desktop/tauri/src-tauri/target/release/bundle/appimage'),{recursive:true,force:true});
  const reports=path.join(ROOT,'test-results');fs.mkdirSync(reports,{recursive:true});
  fs.writeFileSync(path.join(reports,'linux-audio-profile.json'),JSON.stringify(report,null,2)+'\n');
  if(process.env.GITHUB_ENV)fs.appendFileSync(process.env.GITHUB_ENV,`GSTREAMER_PLUGINS_DIR=${destination}\n`);
  console.log(`Selected ${report.plugins.length} audio plugins. Video/FFmpeg encoders are not included.`);
  console.log(`GSTREAMER_PLUGINS_DIR=${destination}`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  try{main();}catch(e){console.error(e.message);process.exitCode=1;}
}
