import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { SupabaseProvider } from './lib/supabase-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider>
      <Router>
        <App />
      </Router>
    </SupabaseProvider>
  </StrictMode>
);