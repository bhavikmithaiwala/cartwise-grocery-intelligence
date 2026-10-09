import {db} from '../db.js';
export async function overview(userId:string,month:string){
  const receipts=await db.receipt.findMany({where:{userId,status:'confirmed',purchaseDate:{startsWith:month}},include:{lines:true},orderBy:[{purchaseDate:'desc'},{id:'desc'}]});
  const budgets=await db.monthlyBudget.findMany({where:{userId,month}});
  const categories:Record<string,number>={};const merchants:Record<string,number>={};let lineTotalCents=0;
  for(const r of receipts){merchants[r.rawMerchant]=(merchants[r.rawMerchant]??0)+r.totalCents;for(const l of r.lines){categories[l.category]=(categories[l.category]??0)+l.lineTotalCents;lineTotalCents+=l.lineTotalCents;}}
  const totalCents=receipts.reduce((s,r)=>s+r.totalCents,0);const taxCents=receipts.reduce((s,r)=>s+r.taxCents,0);
  return {month,currency:'CAD',totalCents,taxCents,lineTotalCents,unallocatedAdjustmentCents:totalCents-taxCents-lineTotalCents,receiptCount:receipts.length,budgetLimitCents:budgets.reduce((s,b)=>s+b.limitCents,0),budgetRemainingCents:budgets.reduce((s,b)=>s+b.limitCents-(categories[b.category]??0),0),categories,merchants,recent:receipts.slice(0,5).map(r=>({id:r.id,merchant:r.rawMerchant,purchaseDate:r.purchaseDate,totalCents:r.totalCents}))};
}
