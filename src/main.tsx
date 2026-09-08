import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ClerkSafeProvider } from './components/auth/ClerkSafeProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkSafeProvider>
      <App />
    </ClerkSafeProvider>
  </StrictMode>,
);