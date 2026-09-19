import { writeWeb } from './lib/build.mjs';
try {
  const result = writeWeb();
  console.log(`Web build: ${result.output}\nAssets: ${result.assets.length} (external files, unmodified)`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
