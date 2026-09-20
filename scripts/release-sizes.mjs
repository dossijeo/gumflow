import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from './lib/build.mjs';
const dir=path.join(ROOT,'release-artifacts');
const rows=fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.isFile()).map(e=>{
  const bytes=fs.statSync(path.join(dir,e.name)).size;
  return `| ${e.name} | ${(bytes/1e6).toFixed(2)} MB | ${(bytes/1048576).toFixed(2)} MiB |`;
});
const summary='## Final packages (not the surrounding Actions artifact ZIP)\n\n| File | MB | MiB |\n|---|---:|---:|\n'+rows.join('\n')+'\n';
console.log(summary);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
