import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {ROOT} from '../scripts/lib/build.mjs';
const code=fs.readFileSync(path.join(ROOT,'src/platform/audio-startup.js'),'utf8');
function setup(settings={},hidden=false) {
  const callbacks=[],events={};let starts=0;
  const c={profile:{settings:{...settings}},soundEnabled:false,document:{hidden},HD:{unlocked:false},audioCtx:null,
    queueMicrotask:f=>callbacks.push(f),addEventListener:(name,f)=>events[name]=f,audioStart:()=>starts++};
  vm.runInNewContext(code,c);return {c,events,run:()=>callbacks.shift()?.(),starts:()=>starts};
}
test('fresh profile starts music only after bootstrap can initialize the title',()=>{
  const x=setup();assert.equal(x.starts(),0);x.run();assert.equal(x.starts(),1);
  assert.equal(x.c.profile.settings.sound,true);assert.equal(x.c.profile.settings.musicOn,true);assert.equal(x.c.soundEnabled,true);
});
test('saved global mute, music toggle and chosen volume are preserved',()=>{
  for(const s of [{sound:false},{musicOn:false},{sound:false,musicOn:false}]){
    const x=setup({...s,musicVolume:0});x.run();x.events.pageshow();assert.equal(x.starts(),0);
    for(const [key,value] of Object.entries(s))assert.equal(x.c.profile.settings[key],value);
    assert.equal(x.c.profile.settings.musicVolume,0);
  }
});
test('hidden tab waits; showing it retries but a running context is not restarted',()=>{
  const x=setup({},true);x.run();assert.equal(x.starts(),0);x.c.document.hidden=false;x.events.visibilitychange();assert.equal(x.starts(),1);
  x.c.HD.unlocked=true;x.c.audioCtx={state:'running'};x.events.pageshow();assert.equal(x.starts(),1);
  x.c.audioCtx.state='suspended';x.events.visibilitychange();assert.equal(x.starts(),2);
});
test('blocked autoplay never changes the preference to mute',()=>{
  const x=setup();x.run();x.events.pageshow();assert.equal(x.starts(),2);assert.equal(x.c.profile.settings.sound,true);
});
test('Windows autoplay policy is scoped to the local WebView, not machine settings',()=>{
  const cfg=JSON.parse(fs.readFileSync(path.join(ROOT,'desktop/tauri/src-tauri/tauri.conf.json'),'utf8'));
  assert.equal(cfg.app.windows[0].additionalBrowserArgs,'--autoplay-policy=no-user-gesture-required');
  assert.ok(!cfg.app.windows[0].additionalBrowserArgs.includes('disable-web-security'));
  assert.ok(cfg.app.security.csp.includes("connect-src 'self'"));
});
