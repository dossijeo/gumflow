/** Deterministic, dependency-free source assembler. No gameplay transformations. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const sha256 = data => createHash('sha256').update(data).digest('hex');
const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/project.json'), 'utf8'));
export const PROJECT = project;
const ASSETS = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/assets.json'), 'utf8')).assets;

/** Root-relative paths only; reject traversal and symlinks outside the checkout. */
export function sourcePath(relative, root = ROOT) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || path.isAbsolute(relative)) {
    throw new Error(`Invalid project path: ${relative}`);
  }
  const result = path.resolve(root, relative);
  const base = fs.realpathSync(root);
  const resolved = fs.realpathSync(result);
  if (!resolved.startsWith(base + path.sep)) throw new Error(`Path outside the project: ${relative}`);
  return resolved;
}

/** Remove JSON whitespace without rewriting number lexemes (e.g. 0.0). */
export function compactJSON(source) {
  JSON.parse(source); // Validate before producing JavaScript.
  let quoted = false, escaped = false, out = '';
  for (const ch of source) {
    if (quoted) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') quoted = false;
    } else if (ch === '"') { quoted = true; out += ch; }
    else if (!/\s/.test(ch)) out += ch;
  }
  return out;
}

export function assemble(entry, { root = ROOT, mode = 'standalone', dependencies = new Set() } = {}) {
  if (!['standalone', 'web'].includes(mode)) throw new Error(`Unknown build mode: ${mode}`);
  const seen = [];
  const assetMap = new Map(ASSETS.map(a => [a.path, a]));
  const read = (name, binary = false) => {
    dependencies.add(name);
    return fs.readFileSync(sourcePath(name, root), binary ? undefined : 'utf8');
  };
  const visit = name => {
    if (seen.includes(name)) throw new Error(`Circular include: ${[...seen, name].join(' -> ')}`);
    seen.push(name);
    let text = read(name);
    // A directive on its own line contributes no extra whitespace. This makes
    // the manifests readable while keeping the distributed HTML byte-exact.
    const includePattern = /^[\t ]*\/\* @include "([^"\n]+)" \*\/[\t ]*(?:\r?\n|$)|\/\* @include "([^"\n]+)" \*\//gm;
    text = text.replace(includePattern, (_all, wholeLine, inline) => visit(wholeLine || inline));
    text = text.replace(/__GUM_(DATA_URI|BASE64|JSON)__\("([^"\n]+)"\)/g, (_all, type, target) => {
      if (type === 'JSON') return compactJSON(read(target));
      const asset = assetMap.get(target);
      if (!asset) throw new Error(`Unregistered asset: ${target}`);
      const bytes = read(target, true);
      if (mode === 'web') return JSON.stringify('./' + target);
      const base64 = bytes.toString('base64');
      return JSON.stringify(type === 'BASE64' ? base64 : `data:${asset.mime};base64,${base64}`);
    });
    seen.pop();
    return text;
  };
  const result = visit(entry);
  if (/__GUM_(DATA_URI|BASE64|JSON)__\(|\/\* @include "/.test(result)) {
    throw new Error('Unresolved build directives in ' + entry);
  }
  return result;
}

export function standalone() {
  const dependencies = new Set();
  const html = assemble(project.htmlEntry, { dependencies });
  const match = /<script>([\s\S]*)<\/script>/.exec(html);
  if (!match) throw new Error('Missing runtime script');
  new vm.Script(match[1], { filename: 'gumflow.js' });
  return { html, dependencies: [...dependencies].sort() };
}

/** A two-line I/O adapter used ONLY for external-file web builds.
 *  Scheduling, decoding and every other game function remain unchanged. */
export function externalAudioLoader(script) {
  const base64Loader = 'const bin=atob(HD_ASSETS[key]),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);';
  const adapter = "const response=await fetch(HD_ASSETS[key]);if(!response.ok)throw new Error('Audio HTTP '+response.status);const bytes=new Uint8Array(await response.arrayBuffer());";
  if (script.split(base64Loader).length !== 2) throw new Error('Audio loader changed; review the web adapter before building.');
  return script.replace(base64Loader, adapter);
}

export function webBundle() {
  const dependencies = new Set();
  let html = assemble(project.htmlEntry, { mode: 'web', dependencies });
  const styles = /<style>([\s\S]*?)<\/style>/.exec(html);
  const runtime = /<script>([\s\S]*)<\/script>/.exec(html);
  if (!styles || !runtime) throw new Error('Missing script or stylesheet in web entry');
  const js = externalAudioLoader(runtime[1]);
  new vm.Script(js, { filename: 'game.js' });
  html = html.replace(styles[0], '<link rel="stylesheet" href="./styles.css">')
    .replace(runtime[0], '<script src="./game.js"></script>');
  return { html, js, css: styles[1], assets: ASSETS, dependencies: [...dependencies].sort() };
}

export function writeStandalone(output = path.join(ROOT, project.output.standalone)) {
  const { html, dependencies } = standalone();
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html, 'utf8');
  return { output, bytes: Buffer.byteLength(html), sha256: sha256(html), dependencies };
}

export function writeWeb(output = path.join(ROOT, project.output.web)) {
  const result = webBundle();
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'index.html'), result.html);
  fs.writeFileSync(path.join(output, 'game.js'), result.js);
  fs.writeFileSync(path.join(output, 'styles.css'), result.css);
  for (const asset of result.assets) {
    const destination = path.join(output, asset.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(sourcePath(asset.path), destination);
  }
  return { output, ...result };
}

export function verifyBaseline() {
  const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/fixtures/baseline-v6.1.json'), 'utf8'));
  const { html } = standalone();
  const actual = sha256(html);
  if (actual !== baseline.source.sha256 || Buffer.byteLength(html) !== baseline.source.bytes) {
    throw new Error(`This source differs from the frozen 6.1 release.\nExpected: ${baseline.source.sha256}\nActual:   ${actual}\nIntentional edits are allowed: use build instead of verify:baseline to build a new version.`);
  }
  for (const asset of baseline.assets) {
    const raw = fs.readFileSync(sourcePath(asset.path));
    if (raw.length !== asset.bytes || sha256(raw) !== asset.sha256) throw new Error(`Changed baseline asset: ${asset.path}`);
  }
  return { sha256: actual, bytes: Buffer.byteLength(html), assets: baseline.assets.length };
}
