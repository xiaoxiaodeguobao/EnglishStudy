import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { queryClient } from './lib/queryClient';
import './index.css';

// Global error handler - shows errors directly on page if React fails to mount
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `<div style="padding:20px;font-family:monospace;color:red;background:#fff;border:2px solid red;margin:20px;border-radius:8px">
      <h2>启动错误 / Startup Error</h2>
      <pre style="white-space:pre-wrap;word-break:break-all">${event.message}\n${event.filename}:${event.lineno}</pre>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
} catch (err) {
  console.error('[React Mount Error]', err);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:20px;font-family:monospace;color:red;background:#fff;border:2px solid red;margin:20px;border-radius:8px">
      <h2>React 挂载失败 / React Mount Failed</h2>
      <pre style="white-space:pre-wrap;word-break:break-all">${err instanceof Error ? err.stack : String(err)}</pre>
    </div>`;
  }
}
