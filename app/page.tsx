import { Header } from '@/components/header';
import { DashboardView } from '@/components/dashboard-view';

export default function Main() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardView />
    </div>
  );
}
