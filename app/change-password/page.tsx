import ChangePasswordForm from '@/components/change-password-form';
import { Header } from '@/components/header';

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChangePasswordForm />
    </div>
  );
}
