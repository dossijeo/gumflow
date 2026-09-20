/** Separate distribution; transformations below NEVER touch normal build inputs.
 * Guard every adapter anchor so future source changes fail loudly at build time. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, PROJECT, webBundle, sourcePath, sha256 } from './build.mjs';
import { zipDirectory } from './zip.mjs';

function replaceOnce(text, before, after, name) {
  if (text.split(before).length !== 2) throw new Error('CrazyGames adapter anchor changed: ' + name);
  return text.replace(before, after);
}
const read = file => fs.readFileSync(sourcePath(file), 'utf8');
export function crazygamesBundle() {
  const web = webBundle();
  let js = web.js;
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
  const loader = read('src/platform/crazygames/portal.js') + '\n' + read('src/platform/crazygames/loader.js');
  new vm.Script(loader, { filename: 'crazygames/crazygames.js' });
  const markup = '<div id="cgLoading" role="status" aria-live="polite"><h1>GUMFLOW</h1><p id="cgLoadingStatus">Loading / Cargando…</p><button id="cgRetry" hidden>Retry / Reintentar</button></div><script src="./crazygames.js"></script>';
  let html = replaceOnce(web.html, '<script src="./game.js"></script>', markup, 'SDK-first loader');
  html = replaceOnce(html, '<html lang="es">', '<html lang="en" class="cg-loading">', 'loading state');
  html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="GUMFLOW: a fast gum-powered platformer. CrazyGames edition.">');
  const css = web.css + '\n' + read('src/styles/crazygames.css');
  return { html, js, css, loader, assets: web.assets };
}
export function writeCrazyGames(output = path.join(ROOT, 'dist/crazygames')) {
  const result = crazygamesBundle();
  fs.mkdirSync(output, { recursive: true });
  for (const [name, content] of [['index.html',result.html],['game.js',result.js],['styles.css',result.css],['crazygames.js',result.loader]]) fs.writeFileSync(path.join(output,name), content);
  for (const asset of result.assets) {
    const target = path.join(output, asset.path);
    fs.mkdirSync(path.dirname(target), { recursive:true });
    fs.copyFileSync(sourcePath(asset.path), target);
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
  const report = { version:PROJECT.version, channel:'crazygames', sdkMajor:3,
    sdkUrl:'https://sdk.crazygames.com/crazygames-sdk-v3.js', externalSDK:true,
    archive:path.basename(zipPath), archiveBytes:fs.statSync(zipPath).size,
    archiveSha256:sha256(fs.readFileSync(zipPath)), totalBytes:entries.reduce((n,f)=>n+f.bytes,0),
    fileCount:entries.length, files:entries.sort((a,b)=>a.path.localeCompare(b.path)) };
  if (report.fileCount > 1500 || report.totalBytes > 20*1000*1000) throw new Error('CrazyGames build exceeded our 20 MB / 1500 file budget');
  fs.writeFileSync(path.join(ROOT,'dist/gumflow-crazygames-build.json'), JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(zipPath+'.sha256', report.archiveSha256+'  '+path.basename(zipPath)+'\n');
  return { ...report, output:result.output };
}
