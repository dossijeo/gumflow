import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {ROOT} from '../scripts/lib/build.mjs';
import {check} from '../scripts/release.mjs';
const core=vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/platform/pad-core.js'),'utf8')+';GFPadCore;');
const pad=()=>({index:0,id:'Synthetic standard controller',connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array(17).fill(0)});
const plain=v=>JSON.parse(JSON.stringify(v));
test('empty, disconnected and unknown-layout controllers do not inject actions',()=>{
  for(const p of [null,{}, {...pad(),connected:false},{...pad(),mapping:''}])assert.equal(core.active(core.read(p)),false);
});
test('A/Xbox or south/Cross triggers jump and menu confirmation',()=>{
  const p=pad();p.buttons[0]={pressed:true,value:1};const s=core.read(p);assert.equal(s.jump,true);assert.equal(s.accept,true);assert.equal(s.elastic,false);
});
test('B, X, RB and RT all provide the gum action',()=>{
  for(const i of [1,2,5,7]){const p=pad();p.buttons[i]=1;assert.equal(core.read(p).elastic,true);}
});
test('Start pauses and the north face button toggles fullscreen',()=>{
  const p=pad();p.buttons[9]=1;p.buttons[3]=1;const s=core.read(p);assert.equal(s.pause,true);assert.equal(s.fullscreen,true);
});
test('axis dead zone includes hysteresis, rejecting tiny neutral drift',()=>{
  const p=pad();p.axes[0]=.1;assert.equal(core.read(p).right,false);
  p.axes[0]=.26;const held=core.read(p);assert.equal(held.right,true);
  p.axes[0]=.20;assert.equal(core.read(p,.24,held).right,true);
  p.axes[0]=.10;assert.equal(core.read(p,.24,held).right,false);
});
test('D-pad works independently of the stick; opposite directions cancel',()=>{
  const p=pad();p.buttons[14]=1;assert.equal(core.read(p).left,true);p.buttons[15]=1;
  assert.equal(core.read(p).left,false);assert.equal(core.read(p).right,false);
});
test('invalid axis numbers cannot produce movement',()=>{
  const p=pad();p.axes=[NaN,Infinity];assert.equal(core.active(core.read(p)),false);
});
test('browser list holes and disconnected pads are safe; active current pad is retained',()=>{
  const p=pad(),p2={...pad(),index:2};assert.equal(core.choose([null,p,p2],'web:2','web'),p2);
  assert.equal(core.choose([null,{...p,connected:false}],null,'web'),null);
});
test('merging does not change keyboard/touch input without a controller',()=>{
  const b={left:false,right:true,jump:true,elastic:false};assert.deepEqual(plain(core.merge(b,core.empty())),b);
  assert.deepEqual(b,{left:false,right:true,jump:true,elastic:false});
});
test('keyboard and gamepad are combined without contradictory directions',()=>{
  const b={left:true,right:false,jump:false,elastic:false};
  assert.deepEqual(plain(core.merge(b,{...core.empty(),right:true,elastic:true})),{left:false,right:false,jump:false,elastic:true});
});
test('spatial menu navigation and wrapping are deterministic',()=>{
  const r=[{x:0,y:0,width:50,height:20},{x:100,y:0,width:50,height:20},{x:0,y:50,width:50,height:20}];
  assert.equal(core.neighbor(r,0,'right'),1);assert.equal(core.neighbor(r,0,'down'),2);assert.equal(core.neighbor(r,-1,'down'),0);
  assert.equal(core.neighbor([],0,'up'),-1);
});
test('native config points at generated web files, not a remote URL',()=>{
  const dir=path.join(ROOT,'desktop/tauri/src-tauri');const cfg=JSON.parse(fs.readFileSync(path.join(dir,'tauri.conf.json'),'utf8'));
  assert.equal(path.resolve(dir,cfg.build.frontendDist),path.join(ROOT,'dist/web'));
  assert.ok(cfg.app.security.csp.includes("script-src 'self'"));assert.ok(!cfg.app.security.csp.includes('unsafe-eval'));
  assert.equal(cfg.app.windows[0].useHttpsScheme,true);
  for(const icon of cfg.bundle.icon)assert.ok(fs.existsSync(path.join(dir,icon)),icon);
  assert.equal(cfg.bundle.linux.appimage.bundleMediaFramework,true);
});
test('all package versions agree and an old or injected release tag is refused',()=>{
  assert.equal(check('v6.1.1'),'6.1.1');for(const v of ['Release-web','v0.1.0','v6.1.1;echo hi'])assert.throws(()=>check(v),/Expected tag/);
});

test('version helper changes only GUMFLOW metadata, not dependency versions',async()=>{
  const {validVersion,rewriteCargoVersion}=await import('../scripts/set-version.mjs');
  assert.equal(validVersion('6.1.2'),true);
  for(const bad of ['6.1','v6.1.2','6.01.2','6.1.2; echo bad','6.1.2-beta','999999.1.1'])assert.equal(validVersion(bad),false);
  const manifest='[package]\nname = "gumflow-desktop"\nversion = "6.1.1"\n[dependencies]\ntauri = "2.11.5"\n';
  assert.equal(rewriteCargoVersion(manifest,'6.1.2'),manifest.replace('"6.1.1"','"6.1.2"'));
  const lock='version = 4\n[[package]]\nname = "other"\nversion = "6.1.1"\n\n[[package]]\nname = "gumflow-desktop"\nversion = "6.1.1"\n';
  assert.equal(rewriteCargoVersion(lock,'6.1.2',true),lock.replace('name = "gumflow-desktop"\nversion = "6.1.1"','name = "gumflow-desktop"\nversion = "6.1.2"'));
  assert.throws(()=>rewriteCargoVersion('broken','6.1.2'));
});
