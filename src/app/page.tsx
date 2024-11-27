// Path: src\app\page.tsx
'use client';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md mx-auto">
        <LoginForm />
      </div>
    </main>
  );
}
