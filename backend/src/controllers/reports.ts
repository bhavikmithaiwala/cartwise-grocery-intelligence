import {Router} from 'express';
import {z} from 'zod';
import {requireUser} from '../middleware/owner.js';
import {monthSchema} from './budgets.js';
import {overview} from '../services/reports.js';
export const reports=Router();reports.use(requireUser);
reports.get('/overview',async(req,res)=>{const {month}=z.object({month:monthSchema}).parse(req.query);res.json(await overview(req.userId,month));});
