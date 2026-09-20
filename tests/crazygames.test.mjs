import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { ROOT, webBundle, standalone, sha256 } from '../scripts/lib/build.mjs';
import { crazygamesBundle, writeCrazyGames } from '../scripts/lib/crazygames-build.mjs';

function factory() {
  const context=vm.createContext({ Float32Array, console });
  vm.runInContext(fs.readFileSync(path.join(ROOT,'src/platform/crazygames/portal.js'),'utf8'),context);
  return context.GumflowCG;
}
function fixture(environment='crazygames',locale='en-US',muteAudio=false) {
  const calls=[];let initialized=false;const listeners=new Set();
  const check=()=>{if(!initialized||!['crazygames','local'].includes(environment))throw new Error('SDK used in the wrong state');};
  const game=Object.fromEntries(['loadingStart','loadingStop','gameplayStart','gameplayStop'].map(key=>[key,()=>{check();calls.push(key);} ]));
  game.settings={muteAudio};
  game.addSettingsChangeListener=fn=>{check();listeners.add(fn)};
  game.removeSettingsChangeListener=fn=>{check();listeners.delete(fn)};
  const sdk={init:async()=>{calls.push('init');await Promise.resolve();initialized=true;},
    get environment(){if(!initialized)throw new Error('environment before init');return environment;},
    get game(){check();return game;},get user(){check();return {systemInfo:{locale}};}};
  return {sdk,calls,listeners,setMute(value){game.settings={muteAudio:value};for(const fn of listeners)fn(game.settings);}};
}

test('CrazyGames awaits SDK v3 initialization, then reads settings and environment',async()=>{
  const f=fixture(),p=factory().createPortal();
  const promise=p.initialize(f.sdk);
  assert.deepEqual(f.calls,['init']);
  await promise;assert.deepEqual(f.calls,['init','loadingStart']);assert.equal(p.snapshot().enabled,true);
  await p.initialize(f.sdk);assert.equal(f.calls.filter(c=>c==='init').length,1);
});
test('menus never emit gameplayStart; each true break gets exactly one stop/start',async()=>{
  const f=fixture(),p=factory().createPortal();await p.initialize(f.sdk);p.markReady();
  p.setGameplay(false);p.setGameplay(false);
  assert.deepEqual(f.calls,['init','loadingStart','loadingStop']);
  p.setGameplay(true);p.setGameplay(true);p.setGameplay(false);p.setGameplay(false);p.setGameplay(true);
  assert.deepEqual(f.calls.slice(3),['gameplayStart','gameplayStop','gameplayStart']);
});
test('a playable state before assets are ready waits, without replaying stale transitions',async()=>{
  const f=fixture(),p=factory().createPortal();await p.initialize(f.sdk);
  p.setGameplay(true);p.setGameplay(false);p.setGameplay(true);
  assert.equal(f.calls.includes('gameplayStart'),false);p.markReady();p.markReady();
  assert.deepEqual(f.calls,['init','loadingStart','loadingStop','gameplayStart']);
});
test('disabled SDK never accesses game/user APIs or emits fake events',async()=>{
  const f=fixture('disabled'),p=factory().createPortal();await p.initialize(f.sdk);p.markReady();p.setGameplay(true);p.dispose();
  assert.deepEqual(f.calls,['init']);assert.equal(p.language,'en');assert.equal(p.snapshot().enabled,false);
});
test('local environment supports event testing; unsupported environments remain disabled',async()=>{
  for(const env of ['local','something-new']){
    const f=fixture(env),p=factory().createPortal();await p.initialize(f.sdk);p.markReady();p.setGameplay(true);
    assert.equal(p.snapshot().enabled,env==='local');
  }
});
test('SDK locale supplies automatic Spanish or English fallback',async()=>{
  for(const [locale,expected] of [['es-ES','es'],['es_MX','es'],['es','es'],['ES-ar','es'],['en-GB','en'],['fr-FR','en'],[null,'en']]){
    const f=fixture('crazygames',locale),p=factory().createPortal();await p.initialize(f.sdk);assert.equal(p.language,expected);
  }
});
test('portal mute is present before any audio gate is created and updates independently',async()=>{
  const f=fixture('crazygames','es',true),p=factory().createPortal();let muteNotifications=[];
  p.onMute(v=>muteNotifications.push(v));await p.initialize(f.sdk);assert.equal(p.muted,true);
  f.setMute(false);assert.equal(p.muted,false);f.setMute(false);f.setMute(true);
  assert.deepEqual(muteNotifications,[true,false,true]);
});
test('SDK rejection is surfaced, not converted into pretend initialization or events',async()=>{
  const p=factory().createPortal();await assert.rejects(p.initialize({init:async()=>{throw new Error('network')}}),/network/);
  assert.equal(p.snapshot().initialized,false);assert.equal(p.snapshot().enabled,false);
});
test('disposal removes settings listener and emits no focus/leave gameplayStop',async()=>{
  const f=fixture(),p=factory().createPortal();await p.initialize(f.sdk);p.markReady();p.setGameplay(true);
  assert.equal(f.listeners.size,1);p.dispose();p.dispose();assert.equal(f.listeners.size,0);assert.equal(f.calls.includes('gameplayStop'),false);
});
test('all audio outputs share a final mute gate, including sources scheduled before muting',async()=>{
  const f=fixture(),p=factory().createPortal();await p.initialize(f.sdk);
  function param(){return {value:1,cancelScheduledValues(){},setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v}};}
  const nodes=[];const ac={state:'running',currentTime:1,destination:{},
    createGain(){const g={gain:param(),connect(to){this.to=to},disconnect(){}};nodes.push(g);return g},
    createAnalyser(){return {fftSize:0,connect(to){this.to=to},disconnect(){},getFloatTimeDomainData(arr){arr.fill(0)}}}};
  const gate=p.audioDestination(ac);assert.equal(p.audioDestination(ac),gate);assert.equal(nodes.length,1);
  f.setMute(true);assert.equal(gate.gain.value,0);f.setMute(false);assert.equal(gate.gain.value,1);
  assert.equal(p.audioSnapshot()[0].rms,0);
});
test('CrazyGames bundle is isolated, deterministic, and contains no native fullscreen request',()=>{
  const before=standalone().html,web=webBundle(),cg=crazygamesBundle();
  assert.equal(crazygamesBundle().js,cg.js);
  assert.doesNotThrow(()=>new vm.Script(cg.js));assert.doesNotThrow(()=>new vm.Script(cg.loader));
  assert.ok(cg.html.includes('src="./crazygames.js"'));assert.ok(!cg.html.includes('src="./game.js"'));
  assert.ok(cg.loader.includes('https://sdk.crazygames.com/crazygames-sdk-v3.js'));
  assert.ok(!cg.js.includes('requestFullscreen'));assert.ok(!cg.js.includes('webkitRequestFullscreen'));
  assert.equal((cg.js.match(/GumflowCrazyGames\.audioDestination\(audioCtx\)/g)||[]).length,5);
  assert.ok(!web.html.includes('crazygames'));assert.ok(!web.js.includes('GumflowCrazyGames'));
  assert.equal(standalone().html,before);
});
test('all 24 original assets are copied byte-identically into the CrazyGames build',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cg-build-'));
  try{
    const out=writeCrazyGames(dir);assert.equal(out.assets.length,24);
    for(const a of out.assets)assert.equal(sha256(fs.readFileSync(path.join(dir,a.path))),a.sha256);
    assert.equal(fs.readdirSync(dir).sort().join(','),'assets,crazygames.js,game.js,index.html,styles.css');
  } finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('loading failure is surfaced to loader rather than reported as ready',async()=>{
  const p=factory().createPortal(),f=fixture();await p.initialize(f.sdk);
  p.failGame(new Error('missing image'));await assert.rejects(p.whenReady(),/missing image/);
  assert.equal(p.ready,false);assert.equal(f.calls.includes('loadingStop'),false);
});

test('a rejected gameplay event is retried with backoff, not once every animation frame',async()=>{
  const f=fixture();let clock=0,attempts=0;
  const p=factory().createPortal({now:()=>clock});await p.initialize(f.sdk);p.markReady();
  const original=f.sdk.game.gameplayStart;
  f.sdk.game.gameplayStart=()=>{attempts++;if(attempts===1)throw new Error('temporarily unavailable');original();};
  for(let i=0;i<120;i++)p.setGameplay(true);
  assert.equal(attempts,1);assert.equal(p.snapshot().reportedPlaying,false);
  clock=1000;p.setGameplay(true);assert.equal(attempts,2);assert.equal(p.snapshot().reportedPlaying,true);
  assert.equal(f.calls.filter(c=>c==='gameplayStart').length,1);
});
