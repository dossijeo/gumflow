/* CrazyGames-only persistence. The SDK is authoritative for both guests and
 * signed-in players. Never replace window.localStorage (the SDK uses it too).
 * https://docs.crazygames.com/sdk/data/ */
(function (root) {
  'use strict';
  const keys = ['gumflow-v3','gumflow-v2','gumflow-best-v1','gumflow-endless-v1','gumflow-language'];
  const allowed = new Set(keys);
  const marker = 'gumflow-cg-data-migrated-v1';
  function createStorage({ legacy = () => root.localStorage, notify = () => {} } = {}) {
    let api = null, mode = 'uninitialized', error = null, readOnly = false;
    const transient = new Map();
    function fail(e) {
      error = { code:String(e?.code || 'saveError'), message:String(e?.message || e) };
      notify(snapshot());
      return Object.assign(new Error(error.message), {code:error.code});
    }
    function validateKey(key) {
      if (!allowed.has(key)) throw new Error('Unregistered GUMFLOW save key: '+key);
      if (!api) throw new Error('Initialize the save provider before reading game data');
    }
    function initialize(sdk, environment) {
      if (api) return snapshot();
      if (['local','crazygames'].includes(environment)) {
        const data = sdk.data;
        if (!data || !['getItem','setItem','removeItem'].every(m=>typeof data[m]==='function'))
          throw Object.assign(new Error('Select "Yes, using the Data Module from the CrazyGames SDK" in Upload / Progress Save.'),{code:'dataModuleDisabled'});
        // Test READS first; never overwrite an unreadable cloud save with defaults.
        let values;
        try { values = keys.map(key => data.getItem(key)); }
        catch (e) { throw fail(e); }
        if (values.some(v=>v!==null && v!==undefined && typeof v!=='string'))
          throw new Error('Unexpected SDK Data value type; refusing to overwrite saved progress');
        api=data;mode='sdk';
        // Conservative one-time migration on THIS origin. Never merge an old
        // local profile into an account which already contains any game data.
        try {
          const old=legacy();
          if (old && !old.getItem(marker)) {
            if (values.every(v=>v==null)) {
              const candidates=keys.map(k=>[k,old.getItem(k)]).filter(([,v])=>v!==null);
              let bytes=0;
              const valid=candidates.filter(([key,value])=>{
                bytes+=new TextEncoder().encode(value).length;
                if (key==='gumflow-language') return ['auto','en','es'].includes(value);
                try { const obj=JSON.parse(value);return !!obj && typeof obj==='object' && !Array.isArray(obj); } catch (_) { return false; }
              });
              if (bytes<800000) for (const [key,value] of valid) data.setItem(key,value);
            }
            old.setItem(marker,'1');
          }
        } catch (e) {
          // Migration is optional (storage may be blocked). Cloud reads remain
          // authoritative; do not turn a SDK write failure into local saving.
          if (e?.code) fail(e);
        }
      } else {
        // Off-portal preview only; never the fallback for a broken Data Module.
        try { api=legacy();api.getItem('gumflow-v3');mode='local-preview'; }
        catch (_) { api={getItem:k=>transient.get(k)??null,setItem:(k,v)=>transient.set(k,v),removeItem:k=>transient.delete(k)};mode='memory-preview'; }
      }
      notify(snapshot());return snapshot();
    }
    function getItem(key) {
      validateKey(key);
      try { return api.getItem(key)??null; } catch(e) { throw fail(e); }
    }
    function setItem(key,value) {
      validateKey(key);
      if (readOnly) throw fail(new Error('Account changed. Reload before saving.'));
      value=String(value);
      try {
        // Read-through, not a stale local mirror. Reduces repeated identical writes.
        if (api.getItem(key)!==value) api.setItem(key,value);
        if(error){error=null;notify(snapshot());}
      } catch(e) { throw fail(e); }
    }
    function removeItem(key) { validateKey(key);if(readOnly)throw fail(new Error('Reload before saving'));try{api.removeItem(key);}catch(e){throw fail(e);} }
    function snapshot(){return {mode,error:error&&{...error},readOnly};}
    return {initialize,getItem,setItem,removeItem,snapshot,keys:[...keys],freeze(){readOnly=true;notify(snapshot());}};
  }
  root.GumflowCGStorage={createStorage,keys:[...keys]};
})(globalThis);
