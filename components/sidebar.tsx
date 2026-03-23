'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import {
  Home,
  Beef,
  Heart,
  Stethoscope,
  TrendingUp,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  MapPin,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { CambiarContrasenaModal } from './cambiar-contrasena-modal';

type UserRole = 'propietario' | 'veterinario' | 'operario';

interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const menuConfig: Record<UserRole, Array<{ id: string; label: string; icon: any; href: string }>> = {
  propietario: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'animales', label: 'Animales', icon: Beef, href: '/animales' },
    { id: 'reproduccion', label: 'Reproducción', icon: Heart, href: '/reproduccion' },
    { id: 'salud', label: 'Salud', icon: Stethoscope, href: '/salud' },
    { id: 'produccion', label: 'Producción', icon: TrendingUp, href: '/produccion' },
    { id: 'usuarios', label: 'Usuarios', icon: Users, href: '/usuarios' },
  ],
  veterinario: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/' },
    { id: 'animales', label: 'Animales', icon: Beef, href: '/animales' },
    { id: 'reproduccion', label: 'Reproducción', icon: Heart, href: '/reproduccion' },
    { id: 'salud', label: 'Salud', icon: Stethoscope, href: '/salud' },
  ],
  operario: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/' },
    { id: 'animales', label: 'Animales', icon: Beef, href: '/animales' },
    { id: 'reproduccion', label: 'Reproducción', icon: Heart, href: '/reproduccion' },
    { id: 'salud', label: 'Salud', icon: Stethoscope, href: '/salud' },
    { id: 'produccion', label: 'Producción', icon: TrendingUp, href: '/produccion' },
  ],
};

const roleNames: Record<UserRole, string> = {
  propietario: 'Propietario',
  veterinario: 'Veterinario',
  operario: 'Operario',
};

function MobileSidebar({ userRole, userName, fincaNombre, fincaUbicacion, onLogout, onOpenModal, menuItems }: any) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-3 left-3 z-50 h-10 w-10 bg-white/80 backdrop-blur-sm border shadow-sm"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-white">
        <SheetHeader className="sr-only">
          <SheetTitle>Menú de navegación</SheetTitle>
          <SheetDescription>Navega por las secciones de la aplicación</SheetDescription>
        </SheetHeader>
        <SidebarContent 
          isExpanded={true} 
          userRole={userRole} 
          userName={userName} 
          fincaNombre={fincaNombre}
          fincaUbicacion={fincaUbicacion}
          onLogout={onLogout}
          onOpenModal={onOpenModal}
          menuItems={menuItems}
        />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent({ 
  isExpanded, 
  userRole, 
  userName, 
  fincaNombre,
  fincaUbicacion,
  onLogout, 
  onOpenModal,
  menuItems, 
  onToggle, 
  showToggle = false 
}: any) {
  const pathname = usePathname();
  const rolValido = userRole as UserRole;

  return (
    <div className="flex h-full flex-col bg-white relative">
      <div className="flex flex-col border-b border-zinc-200 px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm shrink-0">
              <Beef className="h-5 w-5" />
            </div>
            <div className={cn(
              "whitespace-nowrap transition-all duration-200 overflow-hidden",
              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
            )}>
              <p className="font-semibold text-zinc-900 leading-tight">
                {fincaNombre || 'Mi Finca'}
              </p>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{fincaUbicacion || 'Ubicación no especificada'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-emerald-50 hover:text-emerald-700",
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-medium border border-emerald-200"
                  : "text-zinc-700"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-200",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200">
        <div className="px-3 py-3">
          <button
            onClick={onOpenModal}
            className="w-full flex items-center gap-2 hover:bg-zinc-50 rounded-lg transition-all duration-200 p-2"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-emerald-700">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className={cn(
              "whitespace-nowrap transition-all duration-200 overflow-hidden text-left flex-1",
              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
            )}>
              <p className="text-sm font-medium text-zinc-900">{userName || 'Usuario'}</p>
              <p className="text-xs text-zinc-500">{roleNames[rolValido] || userRole}</p>
            </div>
            {isExpanded && (
              <Lock className="h-4 w-4 text-zinc-400 shrink-0" />
            )}
          </button>
        </div>
        
        <div className="p-2">
          <button
            onClick={onLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "hover:bg-red-50 text-red-600 hover:text-red-700"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-200",
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              )}
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>

      {showToggle && onToggle && (
        <Button
          onClick={onToggle}
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full bg-white border border-zinc-200 shadow-sm hover:bg-zinc-100"
        >
          {isExpanded ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}

function DesktopSidebar({ userRole, userName, fincaNombre, fincaUbicacion, onLogout, onOpenModal, menuItems, isExpanded, onToggle }: any) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-zinc-200",
        "transition-all duration-300 ease-in-out",
        "hidden md:block",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <SidebarContent 
        isExpanded={isExpanded} 
        userRole={userRole} 
        userName={userName} 
        fincaNombre={fincaNombre}
        fincaUbicacion={fincaUbicacion}
        onLogout={onLogout}
        onOpenModal={onOpenModal}
        menuItems={menuItems}
        onToggle={onToggle}
        showToggle={true}
      />
    </aside>
  );
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('propietario');
  const [userName, setUserName] = useState('');
  const [fincaNombre, setFincaNombre] = useState('');
  const [fincaUbicacion, setFincaUbicacion] = useState('');
  const router = useRouter();
  const isMobile = useIsMobile();
  const pathname = usePathname(); 
  const isLoginPage = pathname === '/';

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const cargarDatosUsuario = () => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    const rol = localStorage.getItem('userRole') as UserRole | null;
    
    if (!token) {
      setUserRole('propietario');
      setUserName('');
      setFincaNombre('');
      setFincaUbicacion('');
      return;
    }

    if (rol) {
      setUserRole(rol);
    }

    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        setUserName(usuario.nombre || 'Usuario');
        
        if (usuario.finca) {
          setFincaNombre(usuario.finca.nombre || '');
          setFincaUbicacion(usuario.finca.ubicacion || '');
        }
      } catch (e) {
        console.error('Error parsing usuario:', e);
      }
    }
  };

  useEffect(() => {
    cargarDatosUsuario();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        setUserRole('propietario');
        setUserName('');
        setFincaNombre('');
        setFincaUbicacion('');
        return;
      }
      
      if (e.key === 'usuario' || e.key === 'userRole') {
        cargarDatosUsuario();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login', () => cargarDatosUsuario());

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login', () => cargarDatosUsuario());
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userRole');
    
    setUserRole('propietario');
    setUserName('');
    setFincaNombre('');
    setFincaUbicacion('');
    
    router.push('/');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const menuItems = menuConfig[userRole];

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {!isLoginPage && (isMobile ? (
        <MobileSidebar 
          userRole={userRole} 
          userName={userName} 
          fincaNombre={fincaNombre}
          fincaUbicacion={fincaUbicacion}
          onLogout={handleLogout}
          onOpenModal={handleOpenModal}
          menuItems={menuItems}
        />
      ) : (
        <DesktopSidebar 
          userRole={userRole} 
          userName={userName} 
          fincaNombre={fincaNombre}
          fincaUbicacion={fincaUbicacion}
          onLogout={handleLogout}
          onOpenModal={handleOpenModal}
          menuItems={menuItems}
          isExpanded={isExpanded}
          onToggle={toggleSidebar}
        />
      ))}
      {children}
      
      <CambiarContrasenaModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </SidebarContext.Provider>
  );
}