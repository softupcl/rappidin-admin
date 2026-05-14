import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Package,
  Layers,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Store,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const navSections = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/', description: 'Resumen y métricas' },
      { label: 'Pedidos', icon: ShoppingCart, path: '/orders', description: 'Gestión de pedidos', badge: 0 },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { label: 'Deliveries', icon: Truck, path: '/deliveries', description: 'Repartidores activos' },
      { label: 'Productos', icon: Package, path: '/products', description: 'Catálogo de productos' },
      { label: 'Categorías', icon: Layers, path: '/categories', description: 'Gestión de categorías' },
    ],
  },
  {
    title: 'Administración',
    items: [
      { label: 'Usuarios', icon: Users, path: '/users', description: 'Gestión de usuarios' },
      { label: 'Configuración', icon: Settings, path: '/settings', description: 'Ajustes del sistema' },
    ],
  },
];

function NavItem({ item, isActive }: { item: any; isActive: boolean }) {
  return (
    <Link to={item.path} className="block">
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
          'hover:bg-primary/5',
          isActive && 'bg-primary/10 text-primary'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-all',
            isActive
              ? 'gradient-primary text-white shadow-md'
              : 'bg-surface text-muted-foreground group-hover:text-primary'
          )}
        >
          <item.icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={cn('text-sm font-medium', isActive && 'text-primary')}>
              {item.label}
            </span>
            {item.badge > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        </div>
        {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
      </div>
    </Link>
  );
}

function DesktopSidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside className="hidden lg:flex w-72 flex-col bg-card border-r border-border animate-slide-in-left">
      {/* Logo Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient">Rappidin</h1>
            <p className="text-xs text-muted-foreground">Panel de Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 p-3 bg-surface rounded-xl">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="gradient-primary text-white font-semibold text-sm">
              {user?.name?.[0]}{user?.lastname?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}

function MobileBottomNav() {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { logout } = useAuthStore();

  const mainItems = navSections.slice(0, 2).flatMap((s) => s.items);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-background border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {mainItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg transition-all',
                  isActive ? 'gradient-primary text-white shadow-md' : 'bg-surface'
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground">
              <div className="p-2 rounded-lg bg-surface">
                <Menu className="h-5 w-5" />
              </div>
              <span className="text-xs">Más</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0 flex flex-col">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gradient">Rappidin</h1>
                  <p className="text-xs text-muted-foreground">Panel de Admin</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
              {navSections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <SheetClose asChild key={item.path}>
                          <Link to={item.path}>
                            <NavItem item={item} isActive={isActive} />
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSheetOpen(false);
                  logout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}