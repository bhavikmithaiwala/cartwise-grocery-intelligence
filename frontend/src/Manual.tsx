import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewForm, blankReview } from './Review';
import { post } from './api';
import { Notice } from './ui';
export function ManualScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <><h1>Enter a receipt</h1><p>Create a reviewed draft, then explicitly confirm it. Use this when OCR is unavailable.</p>{error && <Notice error>{error}</Notice>}<ReviewForm initial={blankReview()} busy={busy} onSave={async value => { setBusy(true); setError(''); try { const receipt = await post<{id: string}>('/receipts/manual', value); navigate(`/receipts/${receipt.id}`); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }}/></>;
}
