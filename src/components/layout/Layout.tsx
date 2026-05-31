import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050a0f] cyber-grid">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0a1628',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            color: '#e2e8f0',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </div>
  );
}
