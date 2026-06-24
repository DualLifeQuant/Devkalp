import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/lib/query-provider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#5d9e4c', secondary: 'white' } },
          error: { iconTheme: { primary: '#dc2626', secondary: 'white' } },
        }}
      />
    </QueryProvider>
  );
}
