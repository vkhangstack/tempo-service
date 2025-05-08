// react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// react
import { Analytics } from '@vercel/analytics/react';
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
// react helmet
import { HelmetProvider } from 'react-helmet-async';
// eslint-disable-next-line import/no-unresolved
import 'virtual:svg-icons-register';

import App from '@/App';

import './locales/i18n';

// import worker from './_mock';
// i18n
// tailwind css
import './theme/index.css';

const charAt = `
    Tempo Service
  `;
console.info(`%c${charAt}`, 'color: #5BE49B');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      gcTime: 300_000, // 5m
      staleTime: 10_1000, // 10s
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

// const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Suspense>
        <Analytics />
        {/* <MsalProvider instance={msalInstance}> */}
        <App />
        {/* </MsalProvider> */},
      </Suspense>
    </QueryClientProvider>
  </HelmetProvider>,
);

// 🥵 start service worker mock in development mode
// worker.start({ onUnhandledRequest: 'bypass' });
