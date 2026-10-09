import { expect, test } from 'vitest';
import sharp from 'sharp';
import { validateImage, MAX_BYTES, readImage } from './services/images.js';
test('image validation checks content, MIME, byte limits and traversal', async () => {
  const png = await sharp({ create: { width: 50, height: 50, channels: 3, background: '#fff' } }).png().toBuffer();
  expect((await validateImage(png, 'image/png')).length).toBeGreaterThan(0);
  await expect(validateImage(png, 'image/jpeg')).rejects.toThrow();
  await expect(validateImage(Buffer.from('not an image'), 'image/png')).rejects.toThrow();
  await expect(validateImage(Buffer.alloc(MAX_BYTES + 1), 'image/png')).rejects.toThrow();
  expect(() => readImage('../outside.png')).toThrow();
});
