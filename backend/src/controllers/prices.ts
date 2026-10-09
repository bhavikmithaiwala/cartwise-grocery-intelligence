import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireUser } from '../middleware/owner.js';
import { unitPrice } from '../domain/units.js';
import { dateSchema } from '../domain/money.js';
export const prices=Router(); prices.use(requireUser);
prices.get('/history',async(req,res)=>{
  const query=z.object({productId:z.string().min(1).max(50),unit:z.enum(['g','ml','each']).optional(),merchant:z.string().max(120).optional(),from:dateSchema.optional(),to:dateSchema.optional()}).parse(req.query);
  const observations=await db.priceObservation.findMany({where:{userId:req.userId,productId:query.productId,receipt:{status:'confirmed'},...(query.unit?{normalizedUnit:query.unit}:{}),...(query.merchant?{merchant:query.merchant}:{}),purchaseDate:{gte:query.from,lte:query.to}},include:{line:{select:{quantityDecimal:true,quantityUnit:true,packageSizeDecimal:true,packageUnit:true,description:true}}},orderBy:[{purchaseDate:'asc'},{id:'asc'}],take:1000});
  res.json(observations.map(o=>({...o,centsPerUnit:unitPrice(o.lineTotalCents,o.normalizedQuantityDecimal),sourceReceiptId:o.receiptId,label:'Historical recorded price · CAD'})));
});
