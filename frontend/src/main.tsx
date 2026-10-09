import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import './styles.css';
import { AuthScreen } from './Auth';

const screens = ['Dashboard', 'Receipts', 'Upload', 'Prices', 'Budgets', 'Reports', 'Settings'];
function FoundationScreen({ name }: { name: string }) {
  return <><p className="eyebrow">YOUR GROCERY NOTEBOOK</p><h1>{name}</h1><p>This screen is under implementation. CartWise compares your own historical receipts in CAD.</p></>;
}

function App() {
  return <BrowserRouter><a className="skip" href="#content">Skip to content</a><div className="shell"><aside><NavLink className="brand" to="/">â—ˆ CartWise</NavLink><p className="tagline">Know what goes in your cart.</p><nav aria-label="Main navigation">{screens.map((name, i) => <NavLink key={name} to={i === 0 ? '/' : `/${name.toLowerCase()}`} end>{name}</NavLink>)}</nav><p className="privacy-note">Your receipts.<br/>Your history.<br/>Historical prices only.</p></aside><div className="workspace"><header><span>Grocery Receipt & Price Intelligence</span><span className="currency">CAD</span></header><main id="content"><Routes><Route path="/login" element={<AuthScreen />}/><Route path="/register" element={<AuthScreen register />}/>{screens.map((name, i) => <Route key={name} path={i === 0 ? '/' : `/${name.toLowerCase()}`} element={<FoundationScreen name={name} />}/>)}<Route path="*" element={<><h1>Page not found</h1><NavLink to="/">Return to dashboard</NavLink></>}/></Routes></main></div></div></BrowserRouter>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

