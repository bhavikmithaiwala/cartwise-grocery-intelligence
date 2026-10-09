import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireUser } from '../middleware/owner.js';
export const products = Router();
products.use(requireUser);
products.get('/', async (req, res) => {
  const query = z.object({q:z.string().max(120).default('')}).parse(req.query);
  res.json(await db.canonicalProduct.findMany({where:{userId:req.userId,name:{contains:query.q}},orderBy:{name:'asc'},take:200}));
});
products.post('/', async (req,res) => {
  const data = z.object({name:z.string().trim().min(1).max(120),unitFamily:z.enum(['mass','volume','each'])}).strict().parse(req.body);
  res.status(201).json(await db.canonicalProduct.create({data:{...data,userId:req.userId}}));
});
