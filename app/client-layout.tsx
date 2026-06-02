'use client';

import { SidebarProvider, useSidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

function MainContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  // si es login, no aplicar magen de sidebar
  if (isLoginPage) {
    return <main className="flex-1 w-full">{children}</main>;
  }
  return (
    <main
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out w-full",
        "pt-14 md:pt-0",
        "md:ml-16",
        isExpanded && "md:ml-64"
      )}
    >
      {children}
    </main>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}