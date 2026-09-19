#!/usr/bin/env python3
"""Real Chromium + synthetic controller and Tauri fixtures. Not hardware testing.
Uses the same in-memory resource/storage harness as browser_smoke.py.
"""
import argparse, asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
from browser_smoke import HARNESS, ROOT

FIXTURE = r"""
<script>
window.padFixture={index:0,id:'SYNTHETIC standard gamepad',connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array(17).fill(0)};
window.webPads=[];
Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>window.webPads});
window.testPad=function(buttons=[],x=0,y=0){padFixture.axes=[x,y,0,0];padFixture.buttons=Array(17).fill(0);for(const i of buttons)padFixture.buttons[i]=1;};
window.testTick=function(){__gumTest.gamepad.tick(performance.now());return __gumTest.gamepad.info();};
</script>
"""
NATIVE = r"""
<script>
window.nativePads=[];window.nativeFull=false;window.nativeInvokes=0;
window.__TAURI__={core:{invoke:async name=>{if(name!=='controller_snapshot')throw new Error('Unexpected command '+name);nativeInvokes++;return {ready:true,pads:structuredClone(nativePads),error:null};}},window:{getCurrentWindow:()=>({isFullscreen:async()=>nativeFull,setFullscreen:async value=>{nativeFull=value;}})}};
</script>
"""
async def run(browser,native=False):
    ctx=await browser.new_context(viewport={'width':1280,'height':720},locale='en-US')
    page=await ctx.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(ROOT/'dist/gumflow.html').read_text().replace('<head>','<head>'+HARNESS+FIXTURE+(NATIVE if native else ''),1)
    await page.set_content(html,wait_until='load')
    await page.wait_for_function('window.__gumTest?.gamepad')
    async def tick(): return await page.evaluate('testTick()')
    async def neutral():
        await page.evaluate('testPad();testTick()')
    async def press(button):
        await neutral();await page.evaluate('(i)=>{testPad([i]);testTick()}',button);await neutral()
    if not native:
        await page.evaluate('webPads=[padFixture]');await neutral()
        # Menus: confirm current button, and return through the game's real router.
        await page.focus('#gf5PlayMain');await press(0)
        assert await page.evaluate('__gumTest.snapshot().state')=='playhub'
        await press(1);assert await page.evaluate('__gumTest.snapshot().state')=='menu'
        await page.focus('#gf5OptionsMain');await press(0)
        await page.focus('#gf5OptControls');await press(0)
        assert await page.locator('#gfPadOptions').count()==1
        assert 'Gamepad' in await page.locator('#gfPadOptions').inner_text()
        # Range adjustments are handled by left/right instead of moving focus.
        await page.focus('#gfPadDeadzone');before=await page.locator('#gfPadDeadzone').input_value()
        await page.evaluate('testPad([],1,0);testTick()');await neutral()
        assert int(await page.locator('#gfPadDeadzone').input_value())==int(before)+1
        # Hold-to-charge, jump, start/pause, no repeated toggle while held.
        await page.evaluate('__gumTest.start(0)');await neutral()
        await page.evaluate('testPad([],1);testTick()')
        controls=await page.evaluate('__gumTest.gamepad.read()');assert controls['right']
        game=await page.evaluate('c=>__gumTest.step(240,c)',controls);assert game['x']>150
        await page.evaluate('testPad([0]);testTick()')
        assert (await page.evaluate('__gumTest.gamepad.read()'))['jump']
        await page.evaluate('__gumTest.start(0)');await neutral()
        await page.evaluate('testPad([1]);testTick()')
        controls=await page.evaluate('__gumTest.gamepad.read()');assert controls['elastic']
        game=await page.evaluate('c=>__gumTest.step(45,c)',controls);assert game['charge']>0
        await neutral();await press(9);assert await page.evaluate('__gumTest.snapshot().state')=='paused'
        await page.evaluate('testPad([9]);testTick();testTick();testTick()')
        # First edge resumes; subsequent held ticks must not pause again.
        assert await page.evaluate('__gumTest.snapshot().state')=='playing'
        await neutral()
        await page.evaluate('testPad([],1);testTick()')
        await page.evaluate('webPads=[];testTick()')
        assert await page.evaluate('__gumTest.snapshot().state')=='paused'
        assert not (await page.evaluate('__gumTest.gamepad.read()'))['right']
        # Unknown mappings / blocked iframe API must fail safely.
        await page.evaluate("padFixture.mapping='';webPads=[padFixture];testTick()")
        assert not (await page.evaluate('__gumTest.gamepad.read()'))['elastic']
        await page.evaluate("Object.defineProperty(navigator,'getGamepads',{value:()=>{throw new DOMException('Blocked','SecurityError')}});testTick()")
        assert (await tick())['webError']
    else:
        await page.evaluate('nativePads=[padFixture]')
        for _ in range(3): await tick();await page.wait_for_timeout(20)
        assert (await tick())['backend']=='native'
        await page.evaluate('__gumTest.start(0);testPad()')
        for _ in range(3): await tick();await page.wait_for_timeout(20)
        await page.evaluate('testPad([],1)')
        for _ in range(3): await tick();await page.wait_for_timeout(20)
        assert (await page.evaluate('__gumTest.gamepad.read()'))['right']
        await page.evaluate('__gumTest.menu()')
        await page.click('#gf6TitleFull')
        assert await page.evaluate('nativeFull') is True
        await page.click('#gf6TitleFull')
        assert await page.evaluate('nativeFull') is False
        assert await page.evaluate('nativeInvokes')>0
    assert not errors,errors
    result={'nativeFixture':native,'errors':errors,'status':await page.evaluate('__gumTest.gamepad.info()')}
    await ctx.close();return result

async def main(args):
    async with async_playwright() as p:
        kw={'headless':True}
        if args.browser:kw['executable_path']=args.browser
        browser=await p.chromium.launch(**kw)
        try:
            results=[]
            for native in [False,True]:
                results.append(await run(browser,native));print('PASS '+('native bridge fixture + fullscreen' if native else 'browser pad fixture + gameplay + menus + disconnect'))
        finally:await browser.close()
    out=ROOT/'test-results/gamepad.json';out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps({'harness':'Chromium with synthetic Gamepad / Tauri snapshots; NOT physical hardware', 'results':results},indent=2)+'\n')
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--browser');asyncio.run(main(parser.parse_args()))
