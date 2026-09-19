import fs from 'node:fs';
import path from 'node:path';
import { ROOT, PROJECT, writeStandalone, writeWeb, sha256 } from './lib/build.mjs';
import { zipBytes, zipDirectory } from './lib/zip.mjs';
try {
  const standalone = writeStandalone();
  const web = writeWeb();
  const itch = path.join(ROOT, PROJECT.output.itch);
  fs.writeFileSync(itch, zipBytes([{ name: 'index.html', data: fs.readFileSync(standalone.output) }]));
  const external = path.join(ROOT, 'dist/gumflow-web.zip');
  fs.writeFileSync(external, zipDirectory(web.output));
  const products = [standalone.output, itch, external];
  const checksums = products.map(p => `${sha256(fs.readFileSync(p))}  ${path.basename(p)}`).join('\n') + '\n';
  fs.writeFileSync(path.join(ROOT, 'dist/SHA256SUMS'), checksums);
  console.log('Release generated locally. Nothing uploaded.\n' + products.map(p => path.relative(ROOT, p)).join('\n'));
} catch (error) { console.error(error.message); process.exitCode = 1; }
