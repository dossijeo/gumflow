import { writeStandalone } from './lib/build.mjs';
try {
  const result = writeStandalone();
  console.log(`Standalone: ${result.output}\nBytes: ${result.bytes}\nSHA-256: ${result.sha256}`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
