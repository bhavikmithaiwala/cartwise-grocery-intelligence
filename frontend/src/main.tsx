import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import { AuthScreen } from './Auth';
import { api, ApiError, post, type Account } from './api';
import { Button, Notice } from './ui';
const screens = ['Dashboard', 'Receipts', 'Upload', 'Prices', 'Budgets', 'Reports', 'Settings'];
function FoundationScreen({ name }: { name: string }) {
  return <><p className="eyebrow">YOUR GROCERY NOTEBOOK</p><h1>{name}</h1><p>This screen is under implementation. CartWise compares your own historical receipts in CAD.</p></>;
}
function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api<Account>('/auth/me').then(setAccount).catch(err => { if (!(err instanceof ApiError && err.status === 401)) setError(err.message); }).finally(() => setLoading(false));
  }, []);
  if (loading) return <main><Notice>Loading your account…</Notice></main>;
  return <BrowserRouter><a className="skip" href="#content">Skip to content</a><div className="shell"><aside><NavLink className="brand" to="/">◈ CartWise</NavLink><p className="tagline">Know what goes in your cart.</p><nav aria-label="Main navigation">{account && screens.map((name, i) => <NavLink key={name} to={i === 0 ? '/' : `/${name.toLowerCase()}`} end>{name}</NavLink>)}</nav><p className="privacy-note">Your receipts.<br/>Your history.<br/>Historical prices only.</p></aside><div className="workspace"><header><span>Grocery Receipt & Price Intelligence</span><div className="actions">{account && <><span>{account.email}</span><Button className="secondary" onClick={async () => { try { await post('/auth/logout', {}); setAccount(null); } catch (err) { setError((err as Error).message); } }}>Sign out</Button></>}<span className="currency">CAD</span></div></header><main id="content">{error && <Notice error>{error}</Notice>}<Routes><Route path="/login" element={account ? <Navigate to="/" replace/> : <AuthScreen onAccount={setAccount}/>}/><Route path="/register" element={account ? <Navigate to="/" replace/> : <AuthScreen register onAccount={setAccount}/>}/>{screens.map((name, i) => <Route key={name} path={i === 0 ? '/' : `/${name.toLowerCase()}`} element={account ? <FoundationScreen name={name}/> : <Navigate to="/login" replace/>}/>)}<Route path="*" element={<><h1>Page not found</h1><NavLink to="/">Return to dashboard</NavLink></>}/></Routes></main></div></div></BrowserRouter>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
