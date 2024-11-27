// Path: src\app\dashboard\layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Track and manage phone calls in real-time',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
