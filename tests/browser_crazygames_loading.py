#!/usr/bin/env python3
"""Real HTTP/Chromium loading and cloud-provider regression tests.
Only the remote SDK is mocked; game scripts, rendering, audio decoding and file
requests run normally. Two isolated contexts emulate separate devices sharing a
SDK save. This does NOT claim actual CrazyGames server-side cloud validation.
"""
import argparse
import asyncio
import json
import mimetypes
import threading
import time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote
from playwright.async_api import async_playwright
from browser_crazygames import SDK as BASE_SDK, SDK_URL
ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/'dist/crazygames'
SDK=BASE_SDK.replace('getItem:k=>{assertReady();return values.get(k)??null}',
    'getItem:k=>{assertReady();if(cfg.dataDisabled)throw {code:"dataModuleDisabled",message:"Data Module disabled"};return values.get(k)??null}')
SDK=SDK.replace('setItem:(k,v)=>{assertReady();values.set(k,String(v))}',
    'setItem:(k,v)=>{assertReady();if(window.__CG_WRITE_FAIL)throw {code:"dataLimitExcedeed",message:"SDK quota test"};values.set(k,String(v))}')

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass
    def do_GET(self):
        relative=unquote(urlsplit(self.path).path).lstrip('/') or 'index.html'
        path=(BUILD/relative).resolve()
        if not path.is_relative_to(BUILD.resolve()) or not path.is_file():
            self.send_error(404);return
        data=path.read_bytes()
        self.send_response(200)
        mime={'.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg','.webp':'image/webp','.html':'text/html'}.get(path.suffix,'application/octet-stream')
        self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(data)))
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.end_headers()
        self.wfile.write(data)

async def main(browser_path=None, document_harness=False):
    results=[];measurements={}
    server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    origin='http://127.0.0.1:'+str(server.server_port)
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path=browser_path,headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        async def open_game(*,cloud=None,legacy=None,delay=10,data_disabled=False,missing=None,core_error=False,mobile=False):
            ctx=await browser.new_context(viewport={'width':412 if mobile else 1200,'height':850 if mobile else 700},is_mobile=mobile,has_touch=mobile,locale='es-ES')
            page=await ctx.new_page();requests=[];errors=[]
            page.on('request',lambda request:requests.append(urlsplit(request.url).path.lstrip('/')))
            page.on('pageerror',lambda e:errors.append(str(e)))
            cfg={'environment':'crazygames','locale':'en-US','mute':False,'delay':delay,'saved':cloud or {},'dataDisabled':data_disabled}
            await ctx.add_init_script('window.__CG_TEST_CONFIG='+json.dumps(cfg)+';'+('try{for(const [k,v] of Object.entries('+json.dumps(legacy or {})+'))localStorage.setItem(k,v)}catch(_){}'))
            await page.route(SDK_URL,lambda route:route.fulfill(status=200,body=SDK,content_type='text/javascript'))
            if missing:
                await page.route('**/'+missing,lambda route:route.fulfill(status=404,body='missing'))
            if core_error:
                await page.route('**/game.js',lambda route:route.fulfill(status=200,body="throw new Error('Intentional core runtime error');",content_type='text/javascript'))
            if document_harness:
                # Explicit fallback for restricted CI workspaces that disallow
                # top-level navigation. Default workflow uses real loopback HTTP.
                async def files(route):
                    relative=unquote(urlsplit(route.request.url).path).lstrip('/')
                    file=BUILD/relative
                    if not file.is_file(): await route.fulfill(status=404,body='missing');return
                    await route.fulfill(status=200,body=file.read_bytes(),content_type={'.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg','.webp':'image/webp'}.get(file.suffix,'application/octet-stream'))
                await page.route(origin+'/**',files)
                if missing: await page.route('**/'+missing,lambda route:route.fulfill(status=404,body='missing'))
                if core_error: await page.route('**/game.js',lambda route:route.fulfill(status=200,body="throw new Error('Intentional core runtime error');",content_type='text/javascript'))
                harness='window.__CG_TEST_CONFIG='+json.dumps(cfg)+';const memory=new Map(Object.entries('+json.dumps(legacy or {})+'));Object.defineProperty(window,"localStorage",{value:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)},configurable:true});'
                html=(BUILD/'index.html').read_text().replace('<head>','<head><base href="'+origin+'/"><script>'+harness+'</script>',1)
                await page.set_content(html,wait_until='domcontentloaded')
            else:
                await page.goto(origin+'/index.html',wait_until='domcontentloaded')
            return ctx,page,requests,errors
        async def ready(page):
            await page.wait_for_function('window.GumflowCrazyGames?.ready && document.getElementById("cgShell").hidden',timeout=15000)
        ctx,page,requests,errors=await open_game(delay=1500,mobile=True)
        await page.wait_for_function('window.GumflowCrazyGames?.shell.timings.firstPaint!=null')
        assert await page.locator('[data-cg-action="play"]').is_visible()
        assert 'game.js' not in requests,requests
        assert not any(x.endswith('.webp') or x.endswith('everyday.mp3') for x in requests),requests
        assert await page.evaluate('window.GumflowCrazyGames.snapshot().counts.gameplayStart')==0
        await page.screenshot(path=str(ROOT/'test-results/crazygames-light-shell.png'))
        await ready(page)
        await page.wait_for_function('__gumTest.hdInfo().cache.includes("menu")')
        await page.wait_for_timeout(200)
        assert not any(x.endswith('.webp') for x in requests),requests
        assert not any(x in requests for x in ['hd-everyday.mp3','hd-epic.mp3','hd-claustrophobic.mp3']),requests
        assert await page.evaluate('__CG_TEST.calls.filter(x=>x==="gameplayStart").length')==0
        assert await page.evaluate('__gumTest.crazygames.audio().some(x=>x.rms>0.000001)')
        measurements['beforePlayRequests']=list(requests)
        measurements['loadingTimings']=await page.evaluate('__gumTest.crazygames.timings()')
        results.append('First visible title before delayed SDK and game.js; only menu MP3 fetched while in menu; real audio signal')
        # Story is not gameplay. First chosen world must load before start.
        await page.click('#gf5PlayMain');await page.click('#gf5StoryNew')
        await page.evaluate('__gumTest.crazygames.sceneReady()')
        assert await page.evaluate('__gumTest.snapshot().state')=='story'
        assert await page.evaluate('__gumTest.crazygames.info().counts.gameplayStart')==0
        assert [r for r in requests if r.endswith('.webp')]==['campaign-01-gum-works.webp'],requests
        assert 'hd-everyday.mp3' not in requests,requests
        await page.click('#storyGo')
        await page.wait_for_function('__gumTest.crazygames.info().counts.gameplayStart===1')
        measurements['firstGameplayTimings']=await page.evaluate('__gumTest.crazygames.timings()')
        await page.wait_for_function('__gumTest.hdInfo().cache.includes("epic")',timeout=20000)
        assert not errors,errors
        results.append('Selected world only before real first gameplayStart; remaining mixes load afterwards; no fake gameplay events')
        # Store session and language, reopen in another empty browser context.
        await page.evaluate('__gumTest.save();__gumTest.language("es")')
        cloud=await page.evaluate('Object.fromEntries(__CG_TEST.values)')
        assert json.loads(cloud['gumflow-v3'])['session']['level']==0
        assert await page.evaluate('localStorage.getItem("gumflow-v3")') is None
        assert cloud['gumflow-language']=='es'
        await ctx.close()
        ctx,page,requests,errors=await open_game(cloud=cloud,legacy={'gumflow-v3':'{"version":3,"session":{"level":6}}'})
        await ready(page)
        assert await page.evaluate('__gumTest.profile().session.level')==0
        assert await page.evaluate('__gumTest.hdInfo().language')=='es'
        await page.evaluate('__gumTest.restore()');await page.evaluate('__gumTest.crazygames.sceneReady()')
        assert await page.evaluate('__gumTest.snapshot().state')=='playing'
        assert await page.evaluate('__gumTest.snapshot().level')==0
        assert not errors,errors
        results.append('Second isolated browser context restores SDK session and language, ignoring conflicting local progress')
        await page.evaluate('window.__CG_WRITE_FAIL=true;__gumTest.save()')
        assert await page.locator('#cgSaveWarning').is_visible()
        assert await page.evaluate('__gumTest.crazygames.info().storage.error.code')=='dataLimitExcedeed'
        await page.evaluate('window.__CG_WRITE_FAIL=false;__gumTest.save()')
        assert not await page.locator('#cgSaveWarning').is_visible()
        results.append('SDK write failure appears visibly; recovery clears warning without unsynced local fallback')
        await ctx.close()
        # Wrong portal form choice: fail before any game save or module execution.
        ctx,page,requests,errors=await open_game(data_disabled=True)
        await page.wait_for_selector('#cgRetry:not([hidden])')
        assert 'dataModuleDisabled' in await page.locator('#cgDetail').inner_text()
        assert 'Data Module' in await page.locator('#cgDetail').inner_text()
        assert 'game.js' not in requests,requests
        results.append('Missing Data Module selection gives actionable form instruction instead of generic connection error')
        await ctx.close()
        # Missing stage file / incomplete mobile upload is diagnosed and retryable.
        ctx,page,requests,errors=await open_game(missing='campaign-01-gum-works.webp')
        await ready(page);await page.click('#gf5PlayMain');await page.click('#gf5StoryNew')
        await page.wait_for_selector('#cgRetry:not([hidden])')
        assert 'campaign-01-gum-works.webp' in await page.locator('#cgDetail').inner_text()
        assert await page.evaluate('__gumTest.crazygames.info().counts.gameplayStart')==0
        await page.unroute('**/campaign-01-gum-works.webp')
        await page.click('#cgRetry');await page.evaluate('__gumTest.crazygames.sceneReady()')
        assert await page.locator('#cgShell').is_hidden()
        assert await page.evaluate('__gumTest.snapshot().state')=='story'
        results.append('Missing uploaded image names the file; Retry succeeds without restarting/resetting progress')
        await ctx.close()
        for opts,expected in [({'missing':'game.js'},'game.js'),({'core_error':True},'game.js' if document_harness else 'Intentional core runtime error')]:
            ctx,page,requests,errors=await open_game(**opts)
            await page.wait_for_selector('#cgRetry:not([hidden])',timeout=15000)
            assert expected in await page.locator('#cgDetail').inner_text()
            await ctx.close()
        results.append('Missing script and exceptions inside game.js fail promptly with technical detail')
        # Early Play click is queued and takes over into the original mode menu.
        ctx,page,requests,errors=await open_game(delay=1000)
        await page.locator('[data-cg-action="play"]').click();await ready(page)
        assert await page.evaluate('__gumTest.snapshot().state')=='playhub'
        assert requests.count('game.js')==1,requests
        assert not errors,errors
        results.append('Play before SDK/core ready is queued once, not lost or launched twice')
        await page.screenshot(path=str(ROOT/'test-results/crazygames-cloud-modes.png'))
        await ctx.close();await browser.close()
    server.shutdown();server.server_close()
    report={'suite':'CrazyGames Chromium staged loading + SDK Data fixture','transport':'document-harness + resource routes' if document_harness else 'loopback HTTP','checks':results,'measurements':measurements,
      'liveSDKTested':False,'cloudServerTested':False,'notes':'Only SDK simulated. Byte/request/paint/audio measurements come from actual generated files and Chromium.'}
    (ROOT/'test-results/crazygames-loading.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps(report,indent=2,ensure_ascii=False))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--browser');parser.add_argument('--document-harness',action='store_true');args=parser.parse_args()
    (ROOT/'test-results').mkdir(exist_ok=True)
    asyncio.run(main(args.browser,args.document_harness))
