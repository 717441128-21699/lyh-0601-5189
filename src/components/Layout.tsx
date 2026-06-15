import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MagicParticles from './MagicParticles';
import NotificationToast from './NotificationToast';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen relative">
      <MagicParticles />
      <NotificationToast />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />

          <main className="flex-1 p-4 lg:p-6 overflow-auto scroll-container">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
