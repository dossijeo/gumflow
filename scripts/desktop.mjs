/** Launch the pinned Tauri CLI without Windows shell quoting or global installs. */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT } from './lib/build.mjs';
const dir=path.join(ROOT,'desktop/tauri');
const cli=path.join(dir,'node_modules/@tauri-apps/cli/tauri.js');
if(!fs.existsSync(cli)){
  console.error('Install the desktop-only tool first: npm run desktop:install');process.exit(1);
}
const args=process.argv.slice(2);
if(!args.length){console.error('Use desktop:dev or desktop:build.');process.exit(1);}
// Rust caches may contain a prior version's installer. Keep compilation caches,
// but never upload a stale bundle alongside the current release.
if(args[0]==='build')fs.rmSync(path.join(dir,'src-tauri/target/release/bundle'),{recursive:true,force:true});
const child=spawn(process.execPath,[cli,...args],{cwd:dir,stdio:'inherit',env:process.env});
child.on('error',e=>{console.error(e.message);process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
