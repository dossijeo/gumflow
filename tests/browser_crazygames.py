#!/usr/bin/env python3
"""CrazyGames contract/integration tests. Uses an explicit SDK v3 fixture, not
CrazyGames servers or live player analytics. Tests the unmodified generated files
with real Chromium Canvas/Web Audio. Never included in the upload ZIP.
"""
import argparse
import asyncio
import json
import mimetypes
from pathlib import Path
from urllib.parse import urlparse, unquote
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
SDK_URL = 'https://sdk.crazygames.com/crazygames-sdk-v3.js'
# Test-only SDK fixture. Its methods throw when called before init or when disabled.
SDK = r"""
(() => {
 const cfg=window.__CG_TEST_CONFIG;const values=new Map(Object.entries(cfg.saved||{}));const calls=[];const listeners=new Set();let initialized=false;
 const assertReady=()=>{if(!initialized)throw Error('SDK call before init');if(cfg.environment==='disabled')throw Error('SDK disabled');};
 const game={settings:{muteAudio:cfg.mute},
  addSettingsChangeListener(fn){assertReady();listeners.add(fn)},
  removeSettingsChangeListener(fn){assertReady();listeners.delete(fn)}};
 for(const name of ['loadingStart','loadingStop','gameplayStart','gameplayStop'])game[name]=()=>{assertReady();calls.push(name)};
 window.CrazyGames={SDK:{async init(){calls.push('init');await new Promise(r=>setTimeout(r,cfg.delay||0));if(cfg.reject)throw Error('fixture init error');initialized=true;},
 data:{getItem:k=>{assertReady();return values.get(k)??null},setItem:(k,v)=>{assertReady();values.set(k,String(v))},removeItem:k=>values.delete(k)},
 get environment(){if(!initialized)throw Error('environment before init');return cfg.environment},
 get game(){assertReady();return game},get user(){assertReady();return {systemInfo:{locale:cfg.locale}}}}};
 window.__CG_TEST={calls,setMute(muteAudio){game.settings={muteAudio};for(const fn of listeners)fn(game.settings)},
 partial(){for(const fn of listeners)fn({disableChat:true})},listeners,values};
})();
"""
HARNESS = r"""
window.requestAnimationFrame = () => 1;
const values = new Map(Object.entries(window.__CG_TEST_CONFIG.saved || {}));
Object.defineProperty(window,'localStorage',{value:{getItem:k=>values.get(String(k))??null,
setItem:(k,v)=>values.set(String(k),String(v)),removeItem:k=>values.delete(String(k)),clear:()=>values.clear(),
key:i=>[...values.keys()][i]??null,get length(){return values.size}}});
window.__storageValues=values;
let isHidden=false;Object.defineProperty(document,'hidden',{get:()=>isHidden,configurable:true});
window.__setHidden=value=>{isHidden=value;document.dispatchEvent(new Event('visibilitychange'));};
window.__pad={index:0,id:'TEST standard gamepad',connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array(17).fill(0)};
window.__pads=[];Object.defineProperty(navigator,'getGamepads',{value:()=>__pads,configurable:true});
window.__pressPad=(buttons=[])=>{__pad.buttons=Array(17).fill(0);for(const i of buttons)__pad.buttons[i]=1;__gumTest.gamepad.tick(performance.now());};
window.__fullscreenCalls=0;document.documentElement.requestFullscreen=async()=>{window.__fullscreenCalls++};
let random=123456;Math.random=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296};
"""
async def new_game(browser, *, environment='crazygames', locale='en-US', mute=False, saved=None, reject=False, abort_sdk=False, delay=10, mobile=False):
    ctx = await browser.new_context(viewport={'width':800 if mobile else 1216,'height':450 if mobile else 684},
        locale='es-ES', has_touch=mobile, is_mobile=mobile)
    page=await ctx.new_page()
    errors=[];missing=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    async def sdk_route(route):
        requests.append(route.request.url)
        if abort_sdk: await route.abort()
        else: await route.fulfill(status=200,body=SDK,content_type='text/javascript')
    async def files(route):
        relative=unquote(urlparse(route.request.url).path).lstrip('/')
        base=ROOT/'dist/crazygames';p=(base/relative).resolve()
        if not p.is_relative_to(base.resolve()) or not p.is_file():
            missing.append(relative);await route.fulfill(status=404,body='Not found');return
        requests.append(relative)
        mime={'.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg','.webp':'image/webp'}.get(p.suffix) or mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
        await route.fulfill(status=200,body=p.read_bytes(),content_type=mime,headers={'Access-Control-Allow-Origin':'*'})
    await page.route('https://gumflow.test/**',files)
    await page.route(SDK_URL,sdk_route)
    cfg={'environment':environment,'locale':locale,'mute':mute,'saved':saved or {},'reject':reject,'delay':delay}
    html=(ROOT/'dist/crazygames/index.html').read_text()
    html=html.replace('<head>','<head><base href="https://gumflow.test/"><script>window.__CG_TEST_CONFIG='+json.dumps(cfg)+';'+HARNESS+'</script>',1)
    await page.set_content(html,wait_until='load')
    if reject or abort_sdk:
        await page.wait_for_selector('#cgRetry:not([hidden])')
    else:
        await page.wait_for_function('window.GumflowCrazyGames?.ready && document.getElementById("cgShell").hidden', polling=50)
    return ctx,page,errors,missing,requests

async def main(browser_path=None):
    results=[]
    async with async_playwright() as p:
        options={'headless':True,'args':['--no-sandbox','--autoplay-policy=no-user-gesture-required']}
        if browser_path:options['executable_path']=browser_path
        browser=await p.chromium.launch(**options)
        ctx,page,errors,missing,requests=await new_game(browser,locale='es-MX',mute=True)
        assert await page.evaluate('__gumTest.hdInfo().language')=='es'
        assert await page.evaluate('__CG_TEST.calls')==['init','loadingStart','loadingStop']
        assert await page.locator('#full').is_visible() is False
        assert await page.locator('#gf6TitleFull').is_visible() is False
        assert await page.locator('#cgMuteNotice').is_visible()
        await page.evaluate('__gumTest.language("en")')
        assert 'Audio is muted' in await page.locator('#cgMuteNotice').inner_text()
        await page.evaluate('__gumTest.language("es")')
        assert 'silenciado' in await page.locator('#cgMuteNotice').inner_text()
        # Portal mutes already scheduled HD/classic/effects and all future outputs.
        await page.evaluate('__gumTest.hdLoadAll()')
        await page.evaluate('__gumTest.hdPreview("everyday")')
        await page.wait_for_timeout(550)
        assert await page.evaluate('__gumTest.crazygames.audio().every(x=>x.gain===0 && x.rms===0)')
        await page.evaluate('__CG_TEST.setMute(false)')
        await page.wait_for_timeout(700)
        assert await page.evaluate('__gumTest.crazygames.audio().some(x=>x.rms>0.00001)'), await page.evaluate('__gumTest.crazygames.audio()')
        await page.evaluate('__CG_TEST.setMute(true); __gumTest.previewTrack(1)')
        await page.wait_for_timeout(500)
        assert await page.evaluate('__gumTest.crazygames.audio().every(x=>x.rms===0)')
        # Toggling the game's settings cannot override muteAudio.
        await page.evaluate('__gumTest.menu()');await page.click('#gf5OptionsMain');await page.click('#gf5OptAudio')
        for _ in range(2): await page.click('#gf5ToggleSoundAudio')
        for _ in range(2): await page.click('#gf5MusicEnabled')
        await page.wait_for_timeout(250)
        assert await page.evaluate('__gumTest.crazygames.audio().every(x=>x.gain===0 && x.rms===0)')
        settings=await page.evaluate('JSON.parse(window.GumflowCrazyGames.storage.getItem("gumflow-v3")).settings')
        await page.evaluate('__CG_TEST.setMute(false)');await page.wait_for_timeout(100)
        assert settings==await page.evaluate('JSON.parse(window.GumflowCrazyGames.storage.getItem("gumflow-v3")).settings')
        results.append('Portal mute covers HD, ambience, classic and FX without changing user preferences')

        # All scene starts use normal game state, including captured menu/test hooks.
        before=await page.evaluate('__gumTest.crazygames.info().counts.gameplayStart')
        for i in range(7):
            await page.evaluate('__gumTest.menu()')
            await page.evaluate('i=>__gumTest.start(i)',i)
            await page.evaluate('__gumTest.crazygames.sceneReady()')
            snap=await page.evaluate('__gumTest.step(240,{right:true})')
            assert snap['state']=='playing' and snap['x']>150,snap
            assert await page.evaluate('__gumTest.crazygames.info().reportedPlaying')
            await page.evaluate('__gumTest.pause()')
            assert await page.evaluate('__gumTest.crazygames.info().reportedPlaying') is False
            await page.evaluate('__gumTest.pause(); __gumTest.step(1,{})')
            assert await page.evaluate('__gumTest.crazygames.info().reportedPlaying')
        assert await page.evaluate('__gumTest.crazygames.info().counts.gameplayStart')>=before+14
        results.append('All seven campaign worlds report start, pause/stop and resume without duplicate frame events')
        for i in range(7):
            await page.evaluate('__gumTest.menu()')
            await page.evaluate('i=>__gumTest.bossTrial(i)',i)
            await page.evaluate('__gumTest.crazygames.sceneReady()')
            await page.evaluate('__gumTest.step(20,{right:true})')
            assert await page.evaluate('__gumTest.crazygames.info().reportedPlaying')
        for relax in (False,True):
            await page.evaluate('r=>__gumTest.endless(r,"CG-REGRESSION")',relax)
            await page.evaluate('__gumTest.crazygames.sceneReady()')
            await page.evaluate('__gumTest.step(360,{right:true})')
            assert await page.evaluate('__gumTest.crazygames.info().reportedPlaying')
            await page.evaluate('__gumTest.endlessFinish("Test")')
            assert not await page.evaluate('__gumTest.crazygames.info().reportedPlaying')
        results.append('Seven boss arenas, Endless normal/Relax and results send correct events')

        # Losing focus is handled by CG. Preserve auto-pause but do not send fake stop.
        await page.evaluate('__gumTest.start(0)');await page.evaluate('__gumTest.crazygames.sceneReady()');await page.evaluate('__gumTest.step(1,{})')
        counts=await page.evaluate('__gumTest.crazygames.info().counts')
        await page.evaluate('window.dispatchEvent(new Event("blur")); __gumTest.crazygames.sync()')
        assert await page.evaluate('__gumTest.snapshot().state')=='paused'
        assert counts==await page.evaluate('__gumTest.crazygames.info().counts')
        await page.evaluate('window.dispatchEvent(new Event("focus")); __gumTest.pause(); __gumTest.crazygames.sync()')
        assert counts==await page.evaluate('__gumTest.crazygames.info().counts')
        await page.evaluate('__setHidden(true);__gumTest.crazygames.sync()')
        assert counts==await page.evaluate('__gumTest.crazygames.info().counts')
        await page.evaluate('__setHidden(false);__gumTest.menu()')
        assert await page.evaluate('__gumTest.crazygames.info().counts.gameplayStop')==counts['gameplayStop']+1
        results.append('Focus/background auto-pause preserved without reporting focus as gameplay stop')
        # Death/respawn are actual breaks, unlike a mere window blur.
        await page.evaluate('__gumTest.start(0)');await page.evaluate('__gumTest.crazygames.sceneReady()');await page.evaluate('__gumTest.step(1,{});__gumTest.assist(true)')
        counts=await page.evaluate('__gumTest.crazygames.info().counts')
        await page.keyboard.press('r');await page.evaluate('__gumTest.step(1,{})')
        assert await page.evaluate('__gumTest.snapshot().state')=='dying'
        assert await page.evaluate('__gumTest.crazygames.info().counts.gameplayStop')==counts['gameplayStop']+1
        await page.evaluate('__gumTest.step(160,{})')
        assert await page.evaluate('__gumTest.crazygames.info().counts.gameplayStart')==counts['gameplayStart']+1
        await page.evaluate('__gumTest.menu();__pads=[__pad];__pressPad()')
        await page.focus('#gf5PlayMain');await page.evaluate('__pressPad([0]);__pressPad()')
        assert await page.evaluate('__gumTest.snapshot().state')=='playhub'
        await page.evaluate('__pressPad([1]);__pressPad()')
        assert await page.evaluate('__gumTest.snapshot().state')=='menu'
        await page.evaluate('__pressPad([3]);__pressPad();__gumTest.crazygames.fullscreen()')
        assert await page.evaluate('__fullscreenCalls')==0
        results.append('Actual death/respawn states and synthetic controller navigation/Y fullscreen suppression')
        assert not errors,(errors,missing)
        assert not missing,missing
        await page.evaluate('__gumTest.render()');await page.wait_for_timeout(500)
        await page.screenshot(path=str(ROOT/'test-results/crazygames-title.png'))
        await ctx.close()

        # SDK authoritative locale, with stored explicit language override.
        for sdk_locale,expected,saved in [('en-US','en',{}),(None,'en',{}),('fr-FR','en',{}),('en-US','es',{'gumflow-language':'es'})]:
            ctx,page,errors,missing,_=await new_game(browser,locale=sdk_locale,saved=saved)
            assert await page.evaluate('__gumTest.hdInfo().language')==expected
            assert not errors and not missing,(errors,missing)
            await ctx.close()
        results.append('SDK locale overrides browser locale only in Auto; unsupported/missing falls back to English')
        ctx,page,errors,missing,_=await new_game(browser,environment='disabled')
        assert await page.evaluate('__CG_TEST.calls')==['init']
        await page.evaluate('__gumTest.start(0)');await page.evaluate('__gumTest.crazygames.sceneReady()');await page.evaluate('__gumTest.step(10,{right:true})')
        assert not errors and not missing,(errors,missing)
        assert await page.evaluate('__CG_TEST.calls')==['init']
        await ctx.close()
        ctx,page,errors,missing,_=await new_game(browser,environment='local',mobile=True,locale='es-ES')
        await page.click('#gf5PlayMain');await page.click('#gf5FreePlay');await page.locator('[data-gf5-play="0"]').click();await page.evaluate('__gumTest.crazygames.sceneReady()')
        await page.evaluate('__gumTest.step(1,{})')
        assert await page.evaluate('__gumTest.crazygames.info().reportedPlaying')
        assert await page.locator('[data-action="jump"]').is_visible()
        assert not await page.locator('#full').is_visible()
        assert not errors and not missing,(errors,missing)
        await page.screenshot(path=str(ROOT/'test-results/crazygames-mobile.png'))
        await ctx.close()
        results.append('Disabled SDK stays silent; local mode and 800×450 touch UI work')
        for opts in [{'reject':True},{'abort_sdk':True}]:
            ctx,page,errors,missing,_=await new_game(browser,**opts)
            assert await page.evaluate('typeof window.__gumTest')=='undefined'
            assert await page.locator('#cgRetry').is_visible()
            assert not errors,errors
            await ctx.close()
        results.append('SDK network failure/rejected init show retry, without booting an untracked game')
        await browser.close()
    report={'suite':'CrazyGames SDK v3 fixture, Chromium Web Audio','checks':results,
            'livePortalTested':False,'realControllerTested':False,'notes':'No request sent to CrazyGames; all SDK methods were mocked.'}
    (ROOT/'test-results/crazygames-browser.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps(report,indent=2,ensure_ascii=False))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--browser');args=parser.parse_args()
    (ROOT/'test-results').mkdir(exist_ok=True)
    asyncio.run(main(args.browser))
