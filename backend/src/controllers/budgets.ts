import {Router} from 'express';
import {z} from 'zod';
import {db} from '../db.js';
import {requireUser} from '../middleware/owner.js';
import {categories,centsSchema} from '../domain/money.js';
export const monthSchema=z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/);
export const budgets=Router();budgets.use(requireUser);
budgets.get('/',async(req,res)=>{
  const {month}=z.object({month:monthSchema}).parse(req.query);
  const saved=await db.monthlyBudget.findMany({where:{userId:req.userId,month}});
  const lines=await db.receiptLine.findMany({where:{receipt:{userId:req.userId,status:'confirmed',purchaseDate:{startsWith:month}}},select:{category:true,lineTotalCents:true}});
  res.json(categories.map(category=>({category,month,limitCents:saved.find(b=>b.category===category)?.limitCents ?? 0,spentCents:lines.filter(l=>l.category===category).reduce((s,l)=>s+l.lineTotalCents,0)})));
});
budgets.put('/:category/:month',async(req,res)=>{
  const category=z.enum(categories).parse(req.params.category);const month=monthSchema.parse(req.params.month);const {limitCents}=z.object({limitCents:centsSchema}).strict().parse(req.body);
  res.json(await db.monthlyBudget.upsert({where:{userId_category_month:{userId:req.userId,category,month}},create:{userId:req.userId,category,month,limitCents},update:{limitCents}}));
});
