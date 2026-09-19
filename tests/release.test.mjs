import test from 'node:test';
import assert from 'node:assert/strict';
import {findRelease} from '../scripts/release.mjs';

const response=(status,data)=>({status,ok:status>=200&&status<300,json:async()=>data});
const base='https://api.github.com/repos/example/game/releases';

test('published release lookup exposes its non-draft state to the publisher guard',async()=>{
  const release=await findRelease(base,{},'v6.1.1',async()=>response(200,{tag_name:'v6.1.1',draft:false}));
  assert.equal(release.draft,false);
});
test('an existing draft is found through release listings when tag lookup returns 404',async()=>{
  const calls=[];
  const release=await findRelease(base,{},'v6.1.1',async url=>{
    calls.push(url);
    return url.includes('/tags/')?response(404,{}):response(200,[{tag_name:'v6.1.1',draft:true,id:17}]);
  });
  assert.equal(release.id,17);assert.equal(release.draft,true);assert.equal(calls.length,2);
});
test('a draft on a later page is found instead of being created twice',async()=>{
  const release=await findRelease(base,{},'v6.1.1',async url=>{
    if(url.includes('/tags/'))return response(404,{});
    if(url.endsWith('page=1'))return response(200,Array.from({length:100},(_,i)=>({tag_name:'old-'+i,draft:false})));
    return response(200,[{tag_name:'v6.1.1',draft:true,id:18}]);
  });
  assert.equal(release.id,18);
});
test('missing releases are distinguished from forbidden or malformed responses',async()=>{
  assert.equal(await findRelease(base,{},'v6.1.1',async url=>response(url.includes('/tags/')?404:200,url.includes('/tags/')?{}:[])),null);
  await assert.rejects(findRelease(base,{},'v6.1.1',async()=>response(403,{})),/HTTP 403/);
  await assert.rejects(findRelease(base,{},'v6.1.1',async url=>response(url.includes('/tags/')?404:403,{})),/HTTP 403/);
  await assert.rejects(findRelease(base,{},'v6.1.1',async url=>response(url.includes('/tags/')?404:200,{})),/Unexpected/);
});
test('ambiguous duplicate drafts fail closed',async()=>{
  await assert.rejects(findRelease(base,{},'v6.1.1',async url=>response(url.includes('/tags/')?404:200,[{tag_name:'v6.1.1',draft:true},{tag_name:'v6.1.1',draft:true}])),/Multiple/);
});
