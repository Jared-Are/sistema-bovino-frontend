import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { InventorySection } from '@/components/inventory-section';

export default function Home() {
  return (
    <div className="bg-zinc-50">
      <Sidebar />
      <Header />
      <InventorySection />
    </div>
  );
}
