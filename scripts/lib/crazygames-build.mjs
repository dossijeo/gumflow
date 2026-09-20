/** Separate distribution; transformations below NEVER touch normal build inputs.
 * Guard every adapter anchor so future source changes fail loudly at build time. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, PROJECT, webBundle, sourcePath, sha256 } from './build.mjs';
import { zipDirectory } from './zip.mjs';

function replaceOnce(text, before, after, name) {
  if (text.split(before).length !== 2) throw new Error('CrazyGames adapter anchor changed: ' + name);
  return text.replace(before, () => after);
}
const read = file => fs.readFileSync(sourcePath(file), 'utf8');
export function crazygamesBundle() {
  const web = webBundle();
  let js = web.js;
  // Shadow only the game's lexical identifier, NOT window.localStorage:
  // the SDK uses native localStorage internally for guest saves.
  js = replaceOnce(js, "'use strict';\n(()=>{", "'use strict';\n(()=>{\nconst localStorage=window.GumflowCrazyGames.storage;", 'cloud provider');
  js = replaceOnce(js, 'BG_SOURCES.map(src=>{const image=new Image();image.src=src;return image})',
    'BG_SOURCES.map(src=>window.GumflowCrazyGames.resources.image(src))', 'lazy campaign images');
  js = replaceOnce(js, 'EF_LAYER_SOURCES.map(src=>{const i=new Image();i.src=src;return i})',
    'EF_LAYER_SOURCES.map(src=>window.GumflowCrazyGames.resources.image(src))', 'lazy endless images');
  // A flat upload avoids losing nested asset directories in mobile file pickers.
  const assets=web.assets.map(a=>({...a,sourcePath:a.path,path:a.path.replace(/^assets\/(?:images|audio)\//,'').replaceAll('/','-')}));
  for(const asset of assets)js=js.replaceAll('./'+asset.sourcePath,'./'+asset.path);
  if(new Set(assets.map(a=>a.path)).size!==assets.length)throw new Error('Flat asset filename collision');
  const locale = "const browser=(navigator.languages?.[0]||navigator.language||'en').toLowerCase().startsWith('es')?'es':'en';";
  js = replaceOnce(js, locale, 'const browser=window.GumflowCrazyGames.language;', 'portal locale');
  // A single final gain node mutes music, ambience AND effects without rewriting
  // stored user preferences or disturbing the music director/crossfade clocks.
  const destinations = (js.match(/audioCtx\.destination/g) || []).length;
  if (destinations !== 5) throw new Error('Review all audio destinations before changing the CrazyGames mix adapter: ' + destinations);
  js = js.replaceAll('audioCtx.destination', 'window.GumflowCrazyGames.audioDestination(audioCtx)');
  const fullscreen = read('src/ui/title-controls.js').split('function hdTitleFullscreenState')[0];
  js = replaceOnce(js, fullscreen, 'async function hdFullscreen(){}\n', 'title fullscreen action');
  const oldHUD = read('src/core/events.js').split('\n').find(line => line.startsWith("$('full').onclick="));
  js = replaceOnce(js, oldHUD, "$('full').onclick=()=>{};", 'legacy HUD fullscreen');
  js = replaceOnce(js, 'if(!settings.gamepadEnabled||!focused||document.hidden)',
    'if(!window.GumflowCrazyGames.ready||!settings.gamepadEnabled||!focused||document.hidden)', 'gamepad loading gate');
  js = replaceOnce(js, '<button class="secondary" id="gf6TitleFull">⛶ PANTALLA COMPLETA</button>', '', 'title fullscreen markup');
  js = replaceOnce(js, "$('gf6TitleFull').onclick=hdFullscreen;", '', 'title fullscreen handler');
  const padHelp = " · Y / △: ${label('pantalla completa','fullscreen')}";
  js = replaceOnce(js, padHelp, '', 'gamepad fullscreen help');
  js = replaceOnce(js, '<div class="menu-footer">GUMFLOW · 6.1 · SIN CONEXIÓN</div>',
    '<div class="menu-footer">GUMFLOW · 6.1 · CRAZYGAMES</div>', 'portal title footer');
  const marker = '/* GUMFLOW_DESKTOP_ADDITIONS_END */';
  js = replaceOnce(js, marker, marker + '\n/* GUMFLOW_CRAZYGAMES_ADDITIONS_BEGIN */\n' + read('src/platform/crazygames/game-bridge.js') + '\n/* GUMFLOW_CRAZYGAMES_ADDITIONS_END */\n', 'game bridge');
  new vm.Script(js, { filename: 'crazygames/game.js' });
  const shell=read('src/platform/crazygames/shell.js').replace('/* @CG_GUM_RENDERER */',()=>read('src/rendering/gum.js'));
  const loader = ['storage.js','resources.js','portal.js'].map(f=>read('src/platform/crazygames/'+f)).join('\n') + '\n' + shell + '\n' + read('src/platform/crazygames/loader.js');
  new vm.Script(loader, { filename: 'crazygames/boot.js' });
  const criticalCSS=read('src/platform/crazygames/shell.css');
  let html=replaceOnce(web.html,'<link rel="stylesheet" href="./styles.css">','<style>'+criticalCSS+'</style>', 'critical shell CSS');
  // Static official SDK tag, deferred so the first-paint menu is not blocked by
  // the CDN. init() is still awaited before settings/saves/game code are used.
  html=replaceOnce(html,'</head>','<script id="cg-sdk" defer src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>\n</head>', 'official SDK tag');
  const markup=read('src/platform/crazygames/shell.html')+'<script>'+loader.replace(/<\/script/gi,'<\\/script')+'</script>';
  html=replaceOnce(html,'<script src="./game.js"></script>',markup,'minimal shell');
  html=replaceOnce(html,'<html lang="es">','<html lang="en" class="cg-loading">','loading state');
  const css=web.css+'\n'+read('src/styles/crazygames.css');
  return { html, js, css, loader, assets };
}

export function writeCrazyGames(output = path.join(ROOT, 'dist/crazygames')) {
  const result = crazygamesBundle();
  fs.mkdirSync(output, { recursive: true });
  for (const [name, content] of [['index.html',result.html],['game.js',result.js],['styles.css',result.css]]) fs.writeFileSync(path.join(output,name), content);
  for (const asset of result.assets) {
    const target = path.join(output, asset.path);
    fs.mkdirSync(path.dirname(target), { recursive:true });
    fs.copyFileSync(sourcePath(asset.sourcePath), target);
  }
  return { output, ...result };
}
export function packageCrazyGames() {
  const directory = path.join(ROOT, 'dist/crazygames');
  // Dedicated generated directory only. Never package stale ZIPs or test mocks.
  fs.rmSync(directory, { recursive:true, force:true });
  const result = writeCrazyGames(directory);
  const zipPath = path.join(ROOT, 'dist/gumflow-crazygames.zip');
  fs.writeFileSync(zipPath, zipDirectory(directory));
  const entries = [];
  const walk = dir => { for(const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);
    else entries.push({ path:path.relative(directory,file).split(path.sep).join('/'), bytes:fs.statSync(file).size, sha256:sha256(fs.readFileSync(file)) });
  }};
  walk(directory);
  const critical=entries.filter(e=>e.path==='index.html'||e.path==='hd-menu-interlude.mp3');
  const report = { version:PROJECT.version, channel:'crazygames', channelRevision:2, sdkMajor:3, saveProvider:'CrazyGames SDK Data Module', flatUpload:true,
    initialMenuBytes:critical.reduce((n,e)=>n+e.bytes,0), initialMenuFiles:critical.map(e=>e.path),
    gameModuleBytes:entries.find(e=>e.path==='game.js').bytes, sdkExcludedFromByteCounts:true,
    sdkUrl:'https://sdk.crazygames.com/crazygames-sdk-v3.js', externalSDK:true,
    archive:path.basename(zipPath), archiveBytes:fs.statSync(zipPath).size,
    archiveSha256:sha256(fs.readFileSync(zipPath)), totalBytes:entries.reduce((n,f)=>n+f.bytes,0),
    fileCount:entries.length, files:entries.sort((a,b)=>a.path.localeCompare(b.path)) };
  if(report.initialMenuBytes>512000)throw new Error('Initial menu + music exceeded 512 KB budget');
  if (report.fileCount > 1500 || report.totalBytes > 20*1000*1000) throw new Error('CrazyGames build exceeded our 20 MB / 1500 file budget');
  fs.writeFileSync(path.join(ROOT,'dist/gumflow-crazygames-build.json'), JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(zipPath+'.sha256', report.archiveSha256+'  '+path.basename(zipPath)+'\n');
  return { ...report, output:result.output };
}
