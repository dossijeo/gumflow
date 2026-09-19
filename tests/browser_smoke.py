#!/usr/bin/env python3
"""Optional browser regression suite (Python + Playwright, not a build dependency).

All resources are fulfilled from dist/ in memory. No internet/server is used.
The harness freezes animation frames, seeds randomness, and supplies an in-memory
localStorage because about:blank does not have a persistent web origin.
Neither the shipped HTML nor its scripts are modified on disk.
"""
import argparse
import asyncio
import hashlib
import json
import mimetypes
from pathlib import Path
from urllib.parse import unquote, urlparse

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
HARNESS = """<script>
window.requestAnimationFrame = () => 1;
let seed=123456;
Math.random = () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
Date.now=()=>1790000000000;
const values=new Map();
Object.defineProperty(window,'localStorage',{value:{
 getItem:k=>values.has(String(k))?values.get(String(k)):null,
 setItem:(k,v)=>values.set(String(k),String(v)),removeItem:k=>values.delete(String(k)),
 clear:()=>values.clear(),key:i=>[...values.keys()][i]??null,get length(){return values.size}
}});
</script>"""

async def run_target(browser, target, locale):
    context = await browser.new_context(viewport={"width": 1280, "height": 720}, locale=locale)
    page = await context.new_page()
    errors, requests, missing = [], [], []
    page.on("pageerror", lambda error: errors.append(str(error)))

    async def fulfill(route):
        relative = unquote(urlparse(route.request.url).path).lstrip("/")
        f = (ROOT / "dist/web" / relative).resolve()
        if not f.is_relative_to((ROOT / "dist/web").resolve()) or not f.is_file():
            missing.append(relative)
            await route.fulfill(status=404, body="Not found")
            return
        requests.append(relative)
        content_type = {".js":"text/javascript", ".css":"text/css", ".mp3":"audio/mpeg", ".webp":"image/webp"}.get(f.suffix) or mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        await route.fulfill(status=200, body=f.read_bytes(), content_type=content_type,
                            headers={"Access-Control-Allow-Origin":"*"})

    await page.route("https://gumflow.test/**", fulfill)
    path = ROOT / "dist" / ("gumflow.html" if target == "standalone" else "web/index.html")
    html = path.read_text(encoding="utf8")
    html = html.replace("<head>", '<head><base href="https://gumflow.test/">' + HARNESS, 1)
    await page.set_content(html, wait_until="load")
    await page.wait_for_function("window.__gumTest && __gumTest.images().every(x=>x.ok) && __gumTest.endlessImages().every(x=>x.loaded)")
    initial = await page.evaluate("__gumTest.uiInfo()")
    assert initial["version"] == "6.1"
    lang = await page.evaluate("__gumTest.hdInfo().language")
    assert lang == ("es" if locale.startswith("es") else "en"), (target, lang)
    await page.click("#gf5PlayMain")
    await page.click("#gf5FreePlay")
    assert await page.locator("[data-gf5-play]").count() == 7
    assert await page.locator("[data-gf5-boss]").count() == 7
    await page.evaluate("__gumTest.menu()")

    snapshots = []
    for i in range(7):
        await page.evaluate("i=>__gumTest.start(i)", i)
        s = await page.evaluate("__gumTest.step(240,{right:true})")
        snapshots.append({k:s.get(k) for k in ['level','x','y','vx','vy','mode','flow','sugar','lives','time']})
        assert s["state"] == "playing", s
        assert s["x"] > 150, s
        await page.evaluate("i=>__gumTest.bossTrial(i)", i)
        boss = await page.evaluate("__gumTest.step(20,{right:true})")
        assert boss["boss"]["maxHp"] in (3,4)
    for relax in (False,True):
        await page.evaluate("r=>__gumTest.endless(r,'REFACTOR-REGRESSION')", relax)
        s = await page.evaluate("__gumTest.step(360,{right:true})")
        ef = await page.evaluate("__gumTest.endlessSnapshot()")
        assert ef["endless"]["distance"] > 0
        assert ef["endless"]["relax"] == relax
        await page.evaluate("__gumTest.endlessFinish('Regression')")
        store = await page.evaluate("__gumTest.endlessStore()")
        assert store['relax' if relax else 'normal']['runs'] >= 1
    await page.evaluate("__gumTest.menu()")
    await page.click("#gf5OptionsMain")
    await page.locator("#gf6Language").select_option("en" if lang=='es' else "es")
    chosen = await page.evaluate("__gumTest.hdInfo().language")
    assert chosen != lang
    await page.locator("#gf6Language").select_option("auto")
    assert await page.evaluate("__gumTest.hdInfo().language") == lang
    await page.evaluate("__gumTest.menu()")
    await page.click("#gf6AudioUnlock")
    decoded = await page.evaluate("__gumTest.hdLoadAll()")
    assert decoded['error'] is None, decoded
    assert set(decoded['cache']) == {'menu','everyday','epic','tension'}
    await page.evaluate("__gumTest.hdPreview('everyday')")
    await page.wait_for_timeout(400)
    hd = await page.evaluate("__gumTest.hdInfo()")
    assert hd['current']['key'] == 'everyday', hd
    await page.evaluate("__gumTest.hdStopPreview()")
    await page.evaluate("__gumTest.hdStyle('classic')")
    assert await page.evaluate("__gumTest.hdInfo().style") == 'classic'
    await page.evaluate("__gumTest.hdStyle('adaptive')")
    await page.evaluate("__gumTest.menu()")
    await page.evaluate("__gumTest.render()")
    assert not errors, errors
    assert not missing, missing
    if target == 'web':
        for name in ['game.js','styles.css','assets/audio/hd/everyday.mp3','assets/audio/hd/claustrophobic.mp3','assets/audio/hd/epic.mp3','assets/audio/hd/menu-interlude.mp3']:
            assert name in requests, (name, requests)
    result = {'target':target, 'locale':locale,'title':initial['title'], 'snapshots':snapshots,
              'decoded':sorted(decoded['cache']), 'requests':len(requests), 'pageErrors':errors,'missingAssets':missing}
    await context.close()
    return result

async def main(args):
    async with async_playwright() as p:
        launch = {'headless':True}
        if args.browser: launch['executable_path'] = args.browser
        browser = await p.chromium.launch(**launch)
        results=[]
        try:
            for locale in ['es-ES','en-US']:
                for target in ['standalone','web']:
                    result = await run_target(browser,target,locale)
                    results.append(result)
                    print(f"PASS {target} {locale}: seven levels, seven boss entries, two endless modes, UI, language, audio",flush=True)
                assert results[-2]['snapshots']==results[-1]['snapshots'], 'Gameplay snapshots differ between packaging targets'
        finally:
            await browser.close()
    report=ROOT/'test-results/browser-smoke.json';report.parent.mkdir(parents=True,exist_ok=True)
    report.write_text(json.dumps({'harness':'in-memory resources + deterministic input + simulated localStorage','results':results},indent=2,ensure_ascii=False)+'\n',encoding='utf8')
    print('PASS identical simulation snapshots for both builds. Report: '+str(report))

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser',help='Optional Chromium executable (e.g. /usr/bin/chromium)')
    asyncio.run(main(parser.parse_args()))
