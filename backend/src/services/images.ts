import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import sharp from 'sharp';
import { HttpError } from '../errors.js';
export const MAX_BYTES = 8 * 1024 * 1024;
export const MAX_PIXELS = 16_000_000;
const root = resolve(process.env.STORAGE_DIR ?? 'storage/private');
export async function validateImage(buffer: Buffer, mime: string) {
  if (buffer.length > MAX_BYTES) throw new HttpError(413, 'IMAGE_TOO_LARGE', 'Images must be 8 MB or smaller.');
  const kind = buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png' : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255 ? 'jpeg' : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : null;
  if (!kind || mime !== `image/${kind}`) throw new HttpError(415, 'UNSUPPORTED_IMAGE', 'Upload a genuine JPG, PNG or WebP image.');
  try {
    const image = sharp(buffer, { limitInputPixels: MAX_PIXELS, animated: false });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_PIXELS || (metadata.pages ?? 1) > 1) throw new Error('dimensions');
    return await image.rotate().png().toBuffer(); // Strip metadata and store decoded image only.
  } catch { throw new HttpError(415, 'INVALID_IMAGE', 'The image is damaged or exceeds the 16 megapixel limit.'); }
}
function safePath(name: string) {
  if (!/^[a-f0-9-]{36}\.png$/.test(name)) throw new HttpError(404, 'NOT_FOUND', 'Image not found.');
  const path = resolve(root, name);
  if (dirname(path) !== root) throw new HttpError(404, 'NOT_FOUND', 'Image not found.');
  return path;
}
export async function storeImage(buffer: Buffer, mime: string) {
  const decoded = await validateImage(buffer, mime);
  await mkdir(root, { recursive: true });
  const name = `${randomUUID()}.png`;
  await writeFile(safePath(name), decoded, { flag: 'wx' });
  return { imagePath: name, fileSha256: createHash('sha256').update(buffer).digest('hex') };
}
export const readImage = (name: string) => readFile(safePath(name));
export async function deleteImage(name: string | null) { if (name) await unlink(safePath(name)).catch(err => { if (err.code !== 'ENOENT') throw err; }); }
