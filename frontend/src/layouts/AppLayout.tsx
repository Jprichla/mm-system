import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export function AppLayout() {
  return (
    <div>
      <Header />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[240px_1fr]">
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
