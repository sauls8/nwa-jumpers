import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Remove StrictMode temporarily to avoid Chrome double-render issues
// Can re-enable after debugging
createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
