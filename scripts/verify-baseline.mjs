import { verifyBaseline } from './lib/build.mjs';
try {
  const result = verifyBaseline();
  console.log(`PASS: byte-identical to GUMFLOW 6.1\n${result.bytes} bytes\n${result.sha256}\n${result.assets} assets unchanged`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
