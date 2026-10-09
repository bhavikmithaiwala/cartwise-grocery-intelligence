import {useEffect,useState} from 'react';
import {api} from './api';
import type {Overview} from './Dashboard';
import {localMonth} from './Budgets';
import {Field,Notice,money} from './ui';
export function ReportsScreen(){
  const [month,setMonth]=useState(localMonth());const [data,setData]=useState<Overview>();const [trends,setTrends]=useState<{month:string;totalCents:number;receiptCount:number}[]>([]);const [error,setError]=useState('');
  useEffect(()=>{Promise.all([api<Overview>(`/reports/overview?month=${month}`),api<typeof trends>(`/reports/trends?month=${month}&months=6`)]).then(([summary,history])=>{setData(summary);setTrends(history);}).catch(err=>setError(err.message));},[month]);
  const max=Math.max(1,...trends.map(t=>t.totalCents));
  return <><p className="eyebrow">THE BIGGER PICTURE</p><h1>Spending reports</h1><Field label="Report month" type="month" value={month} required onChange={e=>setMonth(e.target.value)}/>{error && <Notice error>{error}</Notice>}<section className="card"><h2>Six-month spending trend</h2><table><thead><tr><th>Month</th><th>Confirmed spending (CAD)</th><th>Receipts</th><th>Trend</th></tr></thead><tbody>{trends.map(t=><tr key={t.month}><td>{t.month}</td><td>{money(t.totalCents)}</td><td>{t.receiptCount}</td><td><div className="chart-bar" style={{width:`${t.totalCents/max*100}%`}}/></td></tr>)}</tbody></table></section>{data && <><div className="grid">{[['Categories (line totals)',data.categories],['Merchants (receipt totals)',data.merchants]] .map(([title,record])=><section className="card" key={String(title)}><h2>{String(title)}</h2><table><thead><tr><th>Name</th><th>CAD</th></tr></thead><tbody>{Object.entries(record).map(([name,total])=><tr key={name}><td>{name}</td><td>{money(total)}</td></tr>)}</tbody></table></section>)}</div><Notice>Receipt tax: {money(data.taxCents)}. Unallocated receipt adjustments: {money(data.unallocatedAdjustmentCents)}. Categories and budgets exclude both.</Notice></>}</>;
}
