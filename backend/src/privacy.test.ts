import {afterAll,expect,test} from 'vitest';
import request from 'supertest';
import {app} from './app.js';
import {db} from './db.js';
afterAll(()=>db.$disconnect());
test('two-account API lifecycle isolates writes, analytics, products, budgets, exports and deletion',async()=>{
 const a=request.agent(app),b=request.agent(app);const suffix=Date.now();const password='fictional-password-123';
 const first=await a.post('/api/auth/register').set('X-CartWise-Request','1').send({email:`privacy-a-${suffix}@example.test`,password});
 const second=await b.post('/api/auth/register').set('X-CartWise-Request','1').send({email:`privacy-b-${suffix}@example.test`,password});
 try{
  const product=await a.post('/api/products').set('X-CartWise-Request','1').send({name:'Fictional oats',unitFamily:'mass'});
  const draft={merchant:'=FICTIONAL MARKET',purchaseDate:'2026-10-01',subtotalCents:500,taxCents:0,totalCents:500,correctionNote:'',lines:[{description:'Oats',category:'Pantry',quantityDecimal:'1',quantityUnit:'kg',productId:product.body.id,lineTotalCents:500}]};
  expect((await b.post('/api/receipts/manual').set('X-CartWise-Request','1').send(draft)).status).toBe(404);
  const receipt=await a.post('/api/receipts/manual').set('X-CartWise-Request','1').send(draft);expect(receipt.status).toBe(201);
  expect((await a.get('/api/reports/overview?month=2026-10')).body.totalCents).toBe(0);
  for(const action of ['confirm','retry-ocr'])expect((await b.post(`/api/receipts/${receipt.body.id}/${action}`).set('X-CartWise-Request','1').send({})).status).toBe(404);
  expect((await b.patch(`/api/receipts/${receipt.body.id}/review`).set('X-CartWise-Request','1').send(draft)).status).toBe(404);
  expect((await b.delete(`/api/receipts/${receipt.body.id}`).set('X-CartWise-Request','1')).status).toBe(404);
  expect((await a.post(`/api/receipts/${receipt.body.id}/confirm`).set('X-CartWise-Request','1').send({})).status).toBe(200);
  expect((await a.get('/api/reports/overview?month=2026-10')).body.totalCents).toBe(500);
  expect((await b.get('/api/reports/overview?month=2026-10')).body.totalCents).toBe(0);
  expect((await b.get(`/api/prices/history?productId=${product.body.id}`)).body).toEqual([]);
  expect((await a.get(`/api/prices/history?productId=${product.body.id}`)).body[0]).toMatchObject({normalizedUnit:'g',centsPerUnit:'0.500000',sourceReceiptId:receipt.body.id});
  expect((await a.put('/api/budgets/Pantry/2026-10').set('X-CartWise-Request','1').send({limitCents:1000})).status).toBe(200);
  expect((await a.get('/api/budgets?month=2026-10')).body.find((x:{category:string})=>x.category==='Pantry')).toMatchObject({spentCents:500,limitCents:1000});
  expect((await b.get('/api/budgets?month=2026-10')).body.find((x:{category:string})=>x.category==='Pantry').limitCents).toBe(0);
  const csv=await a.get('/api/reports/export.csv?from=2026-10-01&to=2026-10-31');expect(csv.text).toContain("'=FICTIONAL");
  expect((await b.get('/api/reports/export.csv?from=2026-10-01&to=2026-10-31')).text).not.toContain('FICTIONAL');
  const exported=await a.post('/api/account/export').set('X-CartWise-Request','1').send({});expect(JSON.stringify(exported.body)).not.toContain('passwordHash');expect(exported.body.receipts).toHaveLength(1);
  expect((await a.patch('/api/settings').set('X-CartWise-Request','1').send({retainImages:true})).body.retainImages).toBe(true);
  expect((await a.delete('/api/account').set('X-CartWise-Request','1').send({password:'incorrect'})).status).toBe(401);
  expect((await a.delete('/api/account').set('X-CartWise-Request','1').send({password})).status).toBe(204);
  expect((await a.get('/api/auth/me')).status).toBe(401);
  expect(await db.priceObservation.count({where:{userId:first.body.id}})).toBe(0);
 }finally{await db.user.deleteMany({where:{id:{in:[first.body.id,second.body.id]}}});}
});
