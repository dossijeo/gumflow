import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {stageAudioPlugins} from '../scripts/prepare-linux-audio.mjs';
function fixture(fn){const root=fs.mkdtempSync(path.join(os.tmpdir(),'gf-audio-test-'));try{fs.mkdirSync(path.join(root,'source'));fn(root);}finally{fs.rmSync(root,{recursive:true,force:true});}}
const selection={schema:1,plugins:['coreelements','mpg123'],optionalPlugins:['alsa']};
const plugin=Buffer.from([0x7f,0x45,0x4c,0x46,1,2,3]);
test('audio staging copies only selected modules, not FFmpeg/video plugins',()=>fixture(root=>{
  for(const n of ['coreelements','mpg123','libav','x264'])fs.writeFileSync(path.join(root,'source',`libgst${n}.so`),plugin);
  const report=stageAudioPlugins(path.join(root,'source'),path.join(root,'out'),selection);
  assert.equal(report.plugins.length,2);assert.deepEqual(fs.readdirSync(path.join(root,'out')).sort(),['libgstcoreelements.so','libgstmpg123.so']);
  assert.equal(fs.readdirSync(path.join(root,'source')).length,4);
}));
test('missing required decoder fails before copying; optional ALSA is optional',()=>fixture(root=>{
  fs.writeFileSync(path.join(root,'source','libgstcoreelements.so'),plugin);
  assert.throws(()=>stageAudioPlugins(path.join(root,'source'),path.join(root,'out'),selection),/mpg123/);
  assert.equal(fs.existsSync(path.join(root,'out')),false);
}));
test('stale staging directories and malformed plugin names fail closed',()=>fixture(root=>{
  fs.mkdirSync(path.join(root,'out'));fs.writeFileSync(path.join(root,'out','old.so'),plugin);
  assert.throws(()=>stageAudioPlugins(path.join(root,'source'),path.join(root,'out'),selection),/must be empty/);
  assert.throws(()=>stageAudioPlugins(path.join(root,'source'),path.join(root,'new'),{schema:1,plugins:['../escape']}),/Unsafe/);
}));
test('fake non-ELF modules are rejected',()=>fixture(root=>{
  fs.writeFileSync(path.join(root,'source','libgstcoreelements.so'),'not a shared library');
  assert.throws(()=>stageAudioPlugins(path.join(root,'source'),path.join(root,'out'),selection),/Not an ELF/);
}));
