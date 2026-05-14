import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { SessionProvider } from './app/session';
import './styles/global.css';
import './styles/index.css';
import './styles/clinic.css';
import './styles/doctors.css';
import './styles/dashboard.css';
import './styles/doctor.css';
import './styles/academy.css';
import './styles/about.css';
import './styles/auth.css';
import './styles/admin.css';
import './styles/videos.css';
import './styles/faq.css';
import './styles/react-app.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <SessionProvider>
        <App />
      </SessionProvider>
    </HashRouter>
  </StrictMode>
);
