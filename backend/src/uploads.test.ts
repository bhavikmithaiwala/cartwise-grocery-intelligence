import { afterAll, expect, test } from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import { app } from './app.js';
import { db } from './db.js';
import { deleteImage } from './services/images.js';
afterAll(() => db.$disconnect());
test('uploads create private processing records and enforce ownership on details, image and status', async () => {
  const email = `upload-${Date.now()}@example.test`;
  const agent = request.agent(app);
  await agent.post('/api/auth/register').set('X-CartWise-Request', '1').send({ email, password: 'fictional-password-123' });
  try {
    const png = await sharp({ create: { width: 100, height: 100, channels: 3, background: '#fff' } }).png().toBuffer();
    const response = await agent.post('/api/receipts/upload').set('X-CartWise-Request', '1').attach('image', png, { filename: '../../bad.png', contentType: 'image/png' });
    expect(response.status).toBe(202);
    const detail = await agent.get(`/api/receipts/${response.body.id}`);
    expect(detail.body.status).toBe('processing');
    expect(detail.body.imagePath).toBeUndefined();
    const duplicate=await agent.post('/api/receipts/upload').set('X-CartWise-Request','1').attach('image',png,{filename:'duplicate.png',contentType:'image/png'});
    const secondDetail=await agent.get(`/api/receipts/${duplicate.body.id}`);
    expect(secondDetail.body.duplicates).toContainEqual(expect.objectContaining({id:response.body.id,reason:'exact_file'}));
    expect((await agent.post(`/api/receipts/${duplicate.body.id}/confirm`).set('X-CartWise-Request','1').send({})).status).toBe(409);
    expect((await agent.get(`/api/receipts/${response.body.id}/image`)).status).toBe(200);
    expect((await request(app).get(`/api/receipts/${response.body.id}`)).status).toBe(401);
    const other = request.agent(app);
    const otherEmail = `other-${email}`;
    await other.post('/api/auth/register').set('X-CartWise-Request', '1').send({ email: otherEmail, password: 'fictional-password-123' });
    for (const suffix of ['', '/image', '/ocr-status']) expect((await other.get(`/api/receipts/${response.body.id}${suffix}`)).status).toBe(404);
    await db.user.deleteMany({ where: { email: otherEmail } });
    expect((await agent.post('/api/receipts/upload').set('X-CartWise-Request', '1').attach('image', Buffer.from('fake'), 'fake.png')).status).toBe(415);
  } finally {
    for (const receipt of await db.receipt.findMany({ where: { user: { email } } })) await deleteImage(receipt.imagePath);
    await db.user.deleteMany({ where: { email } });
  }
});
