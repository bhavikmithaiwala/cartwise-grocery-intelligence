import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Notice } from './ui';
export function UploadScreen() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const navigate = useNavigate();
  function select(candidate?: File) {
    setError(''); setFile(null);
    if (!candidate) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(candidate.type)) { setError('Choose a JPG, PNG or WebP image.'); return; }
    if (candidate.size > 8 * 1024 * 1024) { setError('Images must be 8 MB or smaller.'); return; }
    setFile(candidate);
  }
  function upload() {
    if (!file) return;
    setError(''); setProgress(0);
    const form = new FormData(); form.append('image', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/receipts/upload'); xhr.setRequestHeader('X-CartWise-Request', '1');
    xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100)); };
    xhr.onerror = () => { setProgress(null); setError('Connection failed. Your receipt has not been confirmed.'); };
    xhr.onload = () => { setProgress(null); try { const result = JSON.parse(xhr.responseText); if (xhr.status >= 400) setError(result.message ?? 'Upload failed.'); else navigate(`/receipts/${result.id}`); } catch { setError('The server returned an invalid response.'); } };
    xhr.send(form);
  }
  return <><p className="eyebrow">FROM PAPER TO PERSPECTIVE</p><h1>Add a receipt</h1><p>OCR suggests. You review. Only confirmed receipts count toward spending.</p>{error && <Notice error>{error}</Notice>}<section className="card empty" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); select(e.dataTransfer.files[0]); }}><h2>Drop your grocery receipt here</h2><p>JPG, PNG or WebP · up to 8 MB and 16 megapixels</p><label className="field">Choose receipt image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={progress !== null} onChange={e => select(e.target.files?.[0])}/></label>{file && <p>{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}<Button disabled={!file || progress !== null} onClick={upload}>{progress === null ? 'Upload & extract' : 'Uploading…'}</Button>{progress !== null && <><progress max={100} value={progress} aria-label="Upload progress"/><p>{progress}% uploaded; OCR starts on the server after validation.</p></>}</section><p>Prefer to type it yourself? <Link to="/receipts/new">Enter a receipt manually</Link>.</p><Notice>Images are private and deleted after confirmation by default. You can change retention in Settings.</Notice></>;
}
