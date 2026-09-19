import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { inflateRawSync } from 'node:zlib';
import { ROOT, assemble, compactJSON, standalone, webBundle, sourcePath, verifyBaseline, sha256 } from '../scripts/lib/build.mjs';
import { verifyPreservedCore } from '../scripts/lib/preserved-core.mjs';
import { crc32, zipBytes } from '../scripts/lib/zip.mjs';

const source = standalone();
const web = webBundle();
const assets = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/assets.json'), 'utf8')).assets;

test('removing only the additive desktop layer restores exact 6.1 bytes', () => {
  assert.equal(verifyPreservedCore().assets, 24);
});
test('standalone is deterministic and has no build directives', () => {
  assert.equal(standalone().html, source.html);
  assert.ok(!source.html.includes('/* @include "'));
  assert.ok(!source.html.includes('__GUM_BASE64__('));
});
test('bundled JavaScript parses without executing browser code', () => {
  const code = /<script>([\s\S]*)<\/script>/.exec(source.html)[1];
  assert.doesNotThrow(() => new vm.Script(code));
  assert.doesNotThrow(() => new vm.Script(web.js));
});
test('compactJSON preserves Unicode, escapes and number lexemes', () => {
  assert.equal(compactJSON('{\n "n": 0.0, "s": "a \\"b\\"", "é": "n\\nn" }'), '{"n":0.0,"s":"a \\"b\\"","é":"n\\nn"}');
  assert.throws(() => compactJSON('{bad}'));
});
test('unregistered asset, path escape and circular includes fail closed', () => {
  assert.throws(() => sourcePath('../outside'));
  assert.throws(() => sourcePath('/tmp/anywhere'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gumflow-test-'));
  try {
    fs.writeFileSync(path.join(tmp,'cycle.js'), '/* @include "cycle.js" */\n');
    assert.throws(() => assemble('cycle.js',{root:tmp}), /Circular include/);
    fs.writeFileSync(path.join(tmp,'bad.js'), '__GUM_BASE64__("assets/missing.mp3")');
    assert.throws(() => assemble('bad.js',{root:tmp}), /Unregistered asset/);
  } finally { fs.rmSync(tmp, {recursive:true, force:true}); }
});
test('all 20 pictures and 4 music clips are losslessly extracted', () => {
  assert.equal(assets.filter(a => a.mime==='image/webp').length,20);
  assert.equal(assets.filter(a => a.mime==='audio/mpeg').length,4);
  for (const asset of assets) {
    const bytes = fs.readFileSync(sourcePath(asset.path));
    assert.equal(sha256(bytes), asset.sha256, asset.path);
    assert.ok(source.html.includes(bytes.toString('base64')), asset.path);
    assert.ok(web.js.includes('./'+asset.path), asset.path);
  }
});
test('Spanish/English catalog and musical timing metadata retain their entries', () => {
  const dictionary=JSON.parse(fs.readFileSync(path.join(ROOT,'src/i18n/en.json'),'utf8'));
  const segments=JSON.parse(fs.readFileSync(path.join(ROOT,'src/audio/hd/segments.json'),'utf8'));
  assert.ok(Object.keys(dictionary).length>500);
  assert.deepEqual(Object.keys(segments), ['everyday','epic','tension','menu']);
  for(const m of Object.values(segments)) { assert.ok(m.duration>0); assert.ok(m.beats.length>10); }
});
test('external web target changes only transport (assets, CSS and script tags)', () => {
  assert.equal((web.html.match(/<script/g)||[]).length,1);
  assert.ok(web.html.includes('src="./game.js"'));
  assert.ok(!web.js.includes('data:image/webp;base64,'));
  assert.ok(!web.js.includes('atob(HD_ASSETS[key])'));
  assert.ok(web.js.includes('await fetch(HD_ASSETS[key])'));
  assert.ok(!web.html.includes('https://'));
  let restored=web.js;
  for(const a of assets) {
    const encoded=fs.readFileSync(sourcePath(a.path)).toString('base64');
    const original=a.symbol==='HD_ASSETS'?encoded:`data:${a.mime};base64,${encoded}`;
    restored=restored.replaceAll(JSON.stringify('./'+a.path), JSON.stringify(original));
  }
  restored=restored.replace("const response=await fetch(HD_ASSETS[key]);if(!response.ok)throw new Error('Audio HTTP '+response.status);const bytes=new Uint8Array(await response.arrayBuffer());",'const bin=atob(HD_ASSETS[key]),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);');
  assert.equal(restored, /<script>([\s\S]*)<\/script>/.exec(source.html)[1]);
});
test('ZIP encoding is deterministic, compressed, CRC-correct and uses a root index.html', () => {
  const entries=[{name:'index.html',data:source.html}];
  const zip=zipBytes(entries);
  assert.deepEqual(zipBytes(entries),zip);
  assert.equal(zip.readUInt32LE(0),0x04034b50);
  const nameLength=zip.readUInt16LE(26),compressed=zip.readUInt32LE(18);
  assert.equal(zip.subarray(30,30+nameLength).toString(),'index.html');
  const raw=inflateRawSync(zip.subarray(30+nameLength,30+nameLength+compressed));
  assert.equal(raw.toString('utf8'),source.html);
  assert.equal(zip.readUInt32LE(14),crc32(raw));
  assert.equal(crc32(Buffer.from('123456789')),0xcbf43926);
});
test('archive entries reject duplicates and traversal', () => {
  assert.throws(()=>zipBytes([{name:'../oops',data:'x'}]),/Invalid/);
  assert.throws(()=>zipBytes([{name:'a',data:'x'},{name:'a',data:'y'}]),/duplicate/);
});
