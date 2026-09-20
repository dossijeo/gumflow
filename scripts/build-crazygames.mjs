import { packageCrazyGames } from './lib/crazygames-build.mjs';
try {
  const report = packageCrazyGames();
  console.log(`CrazyGames: ${report.fileCount} local files, ${(report.totalBytes/1e6).toFixed(2)} MB (uncompressed).`);
  console.log(`ZIP: dist/${report.archive} (${(report.archiveBytes/1e6).toFixed(2)} MB). SDK v3 loads from CrazyGames, not embedded.`);
  console.log('No upload performed. Validate this ZIP in the CrazyGames Preview Tool before submission.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
