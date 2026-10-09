import {Router} from 'express';
import {z} from 'zod';
import {requireUser} from '../middleware/owner.js';
import {monthSchema} from './budgets.js';
import {overview} from '../services/reports.js';
export const reports=Router();reports.use(requireUser);
reports.get('/overview',async(req,res)=>{const {month}=z.object({month:monthSchema}).parse(req.query);res.json(await overview(req.userId,month));});
reports.get('/trends',async(req,res)=>{
  const {month,months}=z.object({month:monthSchema,months:z.coerce.number().int().min(1).max(24).default(6)}).parse(req.query);
  const [year,index]=month.split('-').map(Number);const data=[];
  for(let offset=months-1;offset>=0;offset--){const date=new Date(Date.UTC(year,index-1-offset,1));const key=date.toISOString().slice(0,7);const row=await overview(req.userId,key);data.push({month:key,totalCents:row.totalCents,receiptCount:row.receiptCount});}
  res.json(data);
});
