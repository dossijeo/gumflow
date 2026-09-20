/** Stage only the CrazyGames upload, separately from the native CI artifacts. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, PROJECT, sha256 } from './lib/build.mjs';
const dir=path.join(ROOT,'dist/crazygames-artifacts');
try {
  fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const name=`GUMFLOW-v${PROJECT.version}-crazygames.zip`;
  const zip=fs.readFileSync(path.join(ROOT,'dist/gumflow-crazygames.zip'));
  const report=JSON.parse(fs.readFileSync(path.join(ROOT,'dist/gumflow-crazygames-build.json'),'utf8'));
  if(report.archiveSha256!==sha256(zip))throw new Error('CrazyGames ZIP does not match its build report');
  fs.writeFileSync(path.join(dir,name),zip);
  fs.writeFileSync(path.join(dir,name+'.sha256'),sha256(zip)+'  '+name+'\n');
  report.archive=name;
  fs.writeFileSync(path.join(dir,`GUMFLOW-v${PROJECT.version}-crazygames-build.json`),JSON.stringify(report,null,2)+'\n');
  if(process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `## CrazyGames — cloud / staged loading\n\n| Item | Size |\n|---|---:|\n| Initial menu + menu MP3 | ${(report.initialMenuBytes/1e6).toFixed(3)} MB |\n| Deferred game.js | ${(report.gameModuleBytes/1e6).toFixed(3)} MB |\n| Upload ZIP | ${(zip.length/1e6).toFixed(2)} MB |\n\n${report.fileCount} flat files. SDK transfer not included. Select **SDK Data Module** in Progress Save.\n`);
  console.log(`Staged ${name}: ${(zip.length/1e6).toFixed(2)} MB. Nothing uploaded.`);
} catch(e) { console.error(e.message);process.exitCode=1; }
