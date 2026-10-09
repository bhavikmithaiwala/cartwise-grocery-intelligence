import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return <main><h1>CartWise</h1><p>Grocery receipts. Clearer spending. Your recorded price history.</p></main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
