/** Verify the ONLY runtime delta from 6.1 is the explicitly marked additive layer. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, standalone, sha256, sourcePath } from './build.mjs';
export function verifyPreservedCore() {
  const {html}=standalone();
  const marker=/\/\* GUMFLOW_DESKTOP_ADDITIONS_BEGIN \*\/[\s\S]*?\/\* GUMFLOW_DESKTOP_ADDITIONS_END \*\/\n/g;
  if((html.match(marker)||[]).length!==1)throw new Error('Expected exactly one marked desktop/gamepad layer');
  const restored=html.replace(marker,'');
  const baseline=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures/baseline-v6.1.json'),'utf8'));
  if(sha256(restored)!==baseline.source.sha256||Buffer.byteLength(restored)!==baseline.source.bytes)
    throw new Error('The 6.1 game changed outside the approved desktop/gamepad addition');
  for(const asset of baseline.assets){
    const bytes=fs.readFileSync(sourcePath(asset.path));
    if(bytes.length!==asset.bytes||sha256(bytes)!==asset.sha256)throw new Error('Changed original asset: '+asset.path);
  }
  return {sha256:sha256(restored),bytes:Buffer.byteLength(restored),assets:baseline.assets.length};
}
