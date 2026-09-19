/** Small deterministic ZIP writer (DEFLATE, UTF-8); no npm dependency. */
import fs from 'node:fs';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

const crcTable = Array.from({ length: 256 }, (_, i) => {
  for (let n = 0; n < 8; n++) i = i & 1 ? 0xedb88320 ^ (i >>> 1) : i >>> 1;
  return i >>> 0;
});
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function zipBytes(entries) {
  if (entries.length > 65535) throw new Error('ZIP64 is not needed/supported by this release writer.');
  const chunks = [], central = [], names = new Set();
  let offset = 0;
  for (const { name, data } of [...entries].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    if (!name || name.startsWith('/') || name.includes('\\') || name.split('/').includes('..') || names.has(name)) {
      throw new Error('Invalid or duplicate archive entry: ' + name);
    }
    names.add(name);
    const filename = Buffer.from(name), raw = Buffer.from(data), compressed = deflateRawSync(raw, { level: 9 });
    if (raw.length > 0xffffffff || compressed.length > 0xffffffff || filename.length > 65535) throw new Error('ZIP entry too large');
    const crc = crc32(raw), header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(8, 8); header.writeUInt16LE(0, 10); header.writeUInt16LE(33, 12); // 1980-01-01, reproducible.
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(raw.length, 22);
    header.writeUInt16LE(filename.length, 26);
    chunks.push(header, filename, compressed);
    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0); dir.writeUInt16LE(20, 4); dir.writeUInt16LE(20, 6);
    dir.writeUInt16LE(0x800, 8); dir.writeUInt16LE(8, 10); dir.writeUInt16LE(33, 14);
    dir.writeUInt32LE(crc, 16); dir.writeUInt32LE(compressed.length, 20); dir.writeUInt32LE(raw.length, 24);
    dir.writeUInt16LE(filename.length, 28); dir.writeUInt32LE(offset, 42);
    central.push(dir, filename);
    offset += header.length + filename.length + compressed.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  if (offset + directory.length > 0xffffffff) throw new Error('Archive too large');
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, directory, end]);
}
export function zipDirectory(directory) {
  const entries = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const p = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error('No symlinks in release archives: ' + p);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile()) entries.push({ name: path.relative(directory, p).split(path.sep).join('/'), data: fs.readFileSync(p) });
    }
  }
  walk(directory);
  return zipBytes(entries);
}
