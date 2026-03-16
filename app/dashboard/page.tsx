'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSection } from '@/components/dashboard-section';
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); 
    }
  }, [router]);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenido</h1>
      <DashboardSection />
    </div>
  );
}