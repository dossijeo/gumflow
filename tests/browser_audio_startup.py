#!/usr/bin/env python3
"""Autoplay and saved-mute regression checks. Chromium, not a physical WebView2.
Uses a labelled in-memory storage fixture and a simulated autoplay-denial case.
The underlying AudioContext/MP3 decoder remain real. about:blank + set_content
can itself receive activation in automation, so denial is modelled explicitly.
"""
import argparse
import asyncio
import json
from pathlib import Path
from urllib.parse import urlparse,unquote
from playwright.async_api import async_playwright
from browser_smoke import ROOT,HARNESS

async def case(browser,target,saved=None,gesture_required=False):
    context=await browser.new_context(viewport={'width':1280,'height':720},locale='en-US')
    page=await context.new_page();errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    async def serve(route):
        root=(ROOT/'dist/web').resolve();f=(root/unquote(urlparse(route.request.url).path).lstrip('/')).resolve()
        if not f.is_relative_to(root) or not f.is_file():await route.fulfill(status=404,body='Not found');return
        mime={'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.mp3':'audio/mpeg'}.get(f.suffix,'text/html')
        await route.fulfill(body=f.read_bytes(),content_type=mime,headers={'Access-Control-Allow-Origin':'*'})
    await page.route('https://gumflow.test/**',serve)
    extra='' if saved is None else '<script>localStorage.setItem("gumflow-v3",'+json.dumps(json.dumps({'version':3,'settings':saved}))+');</script>'
    if gesture_required:
        # Explicit test double for autoplay blocking; never inserted in builds.
        extra+='''<script>
        const RealAudioContext=window.AudioContext;
        window.__gfTrustedGesture=false;
        addEventListener('pointerdown',e=>{if(e.isTrusted)window.__gfTrustedGesture=true;},true);
        window.AudioContext=class extends RealAudioContext {
          constructor(...args){super(...args);super.suspend();}
          get state(){return window.__gfTrustedGesture?super.state:'suspended';}
          resume(){return window.__gfTrustedGesture?super.resume():Promise.reject(new DOMException('Simulated autoplay denial','NotAllowedError'));}
        };
        </script>'''
    html=(ROOT/'dist'/('gumflow.html' if target=='standalone' else 'web/index.html')).read_text()
    html=html.replace('<head>','<head><base href="https://gumflow.test/">'+HARNESS+extra,1)
    await page.set_content(html,wait_until='load')
    await page.wait_for_function('window.__gumTest && document.getElementById("gf5PlayMain")')
    muted=bool(saved and (saved.get('sound') is False or saved.get('musicOn') is False))
    if muted:
        await page.wait_for_timeout(350)
        info=await page.evaluate('__gumTest.hdInfo()')
        assert info['current'] is None,info
        settings=await page.evaluate('__gumTest.profile().settings')
        for k,v in saved.items():assert settings[k]==v,(k,settings)
    else:
        if gesture_required:
            await page.wait_for_timeout(350)
            info=await page.evaluate('__gumTest.hdInfo()')
            assert not info['unlocked'],info
            await page.click('#gf5PlayMain')
        await page.wait_for_function('__gumTest.hdInfo().current && __gumTest.hdAudioLevel()?.rms > .0001',timeout=20000,polling=100)
        assert not (await page.evaluate('__gumTest.hdInfo()'))['error']
        if not gesture_required:
            await page.click('#gf6AudioUnlock')
            await page.wait_for_timeout(350)
            assert (await page.evaluate('__gumTest.profile().settings.sound')) is False
            await page.evaluate('window.dispatchEvent(new Event("pageshow"))')
            await page.wait_for_timeout(100)
            assert (await page.evaluate('__gumTest.profile().settings.sound')) is False
    assert not errors,errors
    await context.close()
    return {'target':target,'saved':saved,'simulatedAutoplayDenial':gesture_required,'passed':True}

async def main():
    parser=argparse.ArgumentParser();parser.add_argument('--browser');args=parser.parse_args()
    results=[]
    async with async_playwright() as p:
        opts={'headless':True}
        if args.browser:opts['executable_path']=args.browser
        browser=await p.chromium.launch(**opts,args=['--autoplay-policy=no-user-gesture-required'])
        for target in ['standalone','web']:
            results.append(await case(browser,target))
            for saved in [{'sound':False,'musicVolume':.31},{'musicOn':False,'sound':True}]:results.append(await case(browser,target,saved))
        await browser.close()
        browser=await p.chromium.launch(**opts,args=['--autoplay-policy=document-user-activation-required'])
        for target in ['standalone','web']:results.append(await case(browser,target,gesture_required=True))
        await browser.close()
    out=ROOT/'test-results';out.mkdir(exist_ok=True);(out/'audio-startup.json').write_text(json.dumps(results,indent=2)+'\n')
    print('PASS: '+str(len(results))+' browser autoplay / mute / first-gesture cases.')
if __name__=='__main__':asyncio.run(main())
