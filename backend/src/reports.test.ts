import {afterAll,expect,test} from 'vitest';
import {db} from './db.js';
import {overview} from './services/reports.js';
afterAll(()=>db.$disconnect());
test('reports count confirmed purchases by local calendar date and separate tax from category spending',async()=>{
  const user=await db.user.create({data:{email:`reports-${Date.now()}@example.test`,passwordHash:'fixture'}});
  try{
    for(const [date,status,total] of [['2026-10-01','confirmed',113],['2026-09-30','confirmed',500],['2026-10-02','needs_review',800]] as const)await db.receipt.create({data:{userId:user.id,status,purchaseDate:date,rawMerchant:'Demo',subtotalCents:100,taxCents:13,totalCents:total,lines:{create:{description:'Demo item',category:'Pantry',lineTotalCents:100,reviewedByUser:true}}}});
    const result=await overview(user.id,'2026-10');expect(result.totalCents).toBe(113);expect(result.categories.Pantry).toBe(100);expect(result.receiptCount).toBe(1);
    expect((await overview('another-user','2026-10')).receiptCount).toBe(0);
  }finally{await db.user.delete({where:{id:user.id}});}
});
