import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {ROOT} from '../scripts/lib/build.mjs';
import path from 'node:path';
function memory(seed={}){const values=new Map(Object.entries(seed));return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};}
function factory(legacy=memory()){
  const ctx=vm.createContext({TextEncoder});vm.runInContext(fs.readFileSync(path.join(ROOT,'src/platform/crazygames/storage.js'),'utf8'),ctx);
  const notices=[];return {provider:ctx.GumflowCGStorage.createStorage({legacy:()=>legacy,notify:s=>notices.push(s)}),notices};
}
test('reads and writes use SDK Data, not native localStorage',()=>{
  const native=memory(),data=memory({'gumflow-language':'es'}),{provider:p}=factory(native);p.initialize({data},'crazygames');
  assert.equal(p.getItem('gumflow-language'),'es');p.setItem('gumflow-language','en');
  assert.equal(data.getItem('gumflow-language'),'en');assert.equal(native.getItem('gumflow-language'),null);
  assert.equal(p.snapshot().mode,'sdk');
});
test('Data Module disabled refuses startup rather than making a false local/cloud fallback',()=>{
  const {provider:p}=factory();assert.throws(()=>p.initialize({data:{getItem(){throw {code:'dataModuleDisabled',message:'disabled'}},setItem(){},removeItem(){}}},'crazygames'),e=>e.code==='dataModuleDisabled');
  assert.equal(p.snapshot().mode,'uninitialized');assert.throws(()=>p.setItem('gumflow-language','es'),/Initialize/);
});
test('unreadable cloud is never overwritten with empty/default progress',()=>{
  let writes=0;const {provider:p}=factory(memory({'gumflow-v3':'{"version":3}'}));
  assert.throws(()=>p.initialize({data:{getItem(){throw new Error('cloud read failed')},setItem(){writes++},removeItem(){}}},'local'),/cloud read failed/);
  assert.equal(writes,0);
});
test('validated legacy saves migrate once only when SDK dataset is empty',()=>{
  const old=memory({'gumflow-v3':'{"version":3,"records":{"0":{"score":10}}}','gumflow-language':'es','unrelated-token':'secret'}),data=memory();
  const {provider:p}=factory(old);p.initialize({data},'crazygames');
  assert.equal(p.getItem('gumflow-v3'),old.getItem('gumflow-v3'));assert.equal(data.getItem('unrelated-token'),null);
  assert.equal(old.getItem('gumflow-cg-data-migrated-v1'),'1');
  const other=memory();factory(old).provider.initialize({data:other},'crazygames');assert.equal(other.getItem('gumflow-v3'),null);
});
test('existing cloud account data wins over a local profile without merging or rollback',()=>{
  const cloud='{"version":3,"session":{"level":5}}',local='{"version":3,"session":{"level":1}}';
  const {provider:p}=factory(memory({'gumflow-v3':local,'gumflow-language':'es'}));const data=memory({'gumflow-v3':cloud});p.initialize({data},'crazygames');
  assert.equal(p.getItem('gumflow-v3'),cloud);assert.equal(data.getItem('gumflow-language'),null);
});
test('invalid JSON, unknown language, oversized data are not migrated',()=>{
  for(const seed of [{'gumflow-v3':'broken','gumflow-language':'XXX'},{'gumflow-v3':JSON.stringify({large:'a'.repeat(800001)})}]){
    const data=memory();factory(memory(seed)).provider.initialize({data},'crazygames');assert.equal(data.getItem('gumflow-v3'),null);assert.equal(data.getItem('gumflow-language'),null);
  }
});
test('blocked native storage does not break a working SDK Data Module',()=>{
  const ctx=vm.createContext({TextEncoder});vm.runInContext(fs.readFileSync(path.join(ROOT,'src/platform/crazygames/storage.js'),'utf8'),ctx);
  const p=ctx.GumflowCGStorage.createStorage({legacy:()=>{throw new Error('blocked')}}),data=memory();
  p.initialize({data},'crazygames');p.setItem('gumflow-language','es');assert.equal(p.getItem('gumflow-language'),'es');
});
test('quota/write failures notify and never fall back to unsynced local data',()=>{
  const old=memory(),data=memory({'gumflow-language':'es'}),{provider:p,notices}=factory(old);p.initialize({data},'crazygames');
  data.setItem=()=>{throw {code:'dataLimitExcedeed',message:'quota'}};
  assert.throws(()=>p.setItem('gumflow-language','en'),e=>e.code==='dataLimitExcedeed');assert.equal(old.getItem('gumflow-language'),null);assert.equal(p.snapshot().error.code,'dataLimitExcedeed');assert.ok(notices.length>1);
});
test('duplicate writes are suppressed but new authoritative SDK values are always read',()=>{
  let writes=0;const data=memory({'gumflow-language':'es'}),original=data.setItem;data.setItem=(...a)=>{writes++;original(...a)};
  const {provider:p}=factory();p.initialize({data},'crazygames');p.setItem('gumflow-language','es');assert.equal(writes,0);
  data.values.set('gumflow-language','en');assert.equal(p.getItem('gumflow-language'),'en');p.setItem('gumflow-language','es');assert.equal(writes,1);
});
test('unregistered keys and full-store clear are not exposed to game code',()=>{
  const {provider:p}=factory();p.initialize({data:memory()},'crazygames');assert.throws(()=>p.getItem('token'),/Unregistered/);assert.equal(p.clear,undefined);
});
test('disabled/off-portal uses explicitly labelled local preview, never SDK Data',()=>{
  const native=memory(),{provider:p}=factory(native);p.initialize({get data(){throw new Error('must not use')}},'disabled');p.setItem('gumflow-language','en');assert.equal(native.getItem('gumflow-language'),'en');assert.equal(p.snapshot().mode,'local-preview');
});
test('account-change freeze prevents old in-memory session from overwriting account data',()=>{
  const data=memory({'gumflow-language':'es'}),{provider:p}=factory();p.initialize({data},'crazygames');p.freeze();assert.throws(()=>p.setItem('gumflow-language','en'),/Account changed/);assert.equal(data.getItem('gumflow-language'),'es');
});
