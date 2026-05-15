import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deliveriesService } from '@/services/api';
import { socketService } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { Phone, CheckCircle, XCircle, Package, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'online' | 'offline' | 'order' }[]>([]);
  const pageSize = 10;

  useEffect(() => {
    fetchDeliveries();
    socketService.connectAdmin();

    socketService.onDeliveryOnline((data) => {
      setDeliveries(prev => prev.map(d =>
        d.user.id === data.userId ? { ...d, isOnline: true, user: { ...d.user, name: data.name, lastname: data.lastname } } : d
      ));
      addNotification(data.userId, `${data.name} ${data.lastname} se conectó`, 'online');
    });

    socketService.onDeliveryOffline((data) => {
      setDeliveries(prev => prev.map(d =>
        d.user.id === data.userId ? { ...d, isOnline: false } : d
      ));
      addNotification(data.userId, `${data.name} ${data.lastname} se desconectó`, 'offline');
    });

    socketService.onNewOrder((data) => {
      addNotification(data.id, `Nuevo pedido #${data.id}`, 'order');
    });

    return () => {
      socketService.disconnectAdmin();
    };
  }, []);

  const addNotification = (id: number, message: string, type: 'online' | 'offline' | 'order') => {
    const notification = { id: Date.now(), message, type };
    setNotifications(prev => [notification, ...prev].slice(0, 5));
    toast({ title: message });
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const fetchDeliveries = async () => {
    try {
      const data = await deliveriesService.getAll();
      setDeliveries(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      await deliveriesService.updateAvailability(id, !currentStatus);
      await fetchDeliveries();
      toast({ title: !currentStatus ? 'Delivery activado' : 'Delivery desactivado' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const paginatedDeliveries = useMemo(() => deliveries.slice((currentPage - 1) * pageSize, currentPage * pageSize), [deliveries, currentPage]);
  const totalPages = Math.max(1, Math.ceil(deliveries.length / pageSize));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Deliveries</h1>
          <p className="text-muted-foreground">Gestiona tu equipo de repartidores</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">{deliveries.length} repartidores</Badge>
          {notifications.length > 0 && (
            <Badge variant="default" className="px-3 py-1 bg-primary gap-1">
              <Bell className="h-3 w-3" />
              {notifications.length}
            </Badge>
          )}
        </div>
      </div>

      {notifications.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className={cn(
                  'flex items-center gap-2 text-sm p-2 rounded-lg',
                  n.type === 'online' && 'bg-green-100 text-green-700',
                  n.type === 'offline' && 'bg-gray-100 text-gray-700',
                  n.type === 'order' && 'bg-blue-100 text-blue-700',
                )}>
                  {n.type === 'online' && <CheckCircle className="h-4 w-4" />}
                  {n.type === 'offline' && <XCircle className="h-4 w-4" />}
                  {n.type === 'order' && <Package className="h-4 w-4" />}
                  <span>{n.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {paginatedDeliveries.map((d) => (
              <div key={d.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border hover:bg-surface transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={cn(
                      'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
                      d.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    )} />
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">{d.user.name?.[0]}{d.user.lastname?.[0]}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{d.user.name} {d.user.lastname}</p>
                    <p className="text-sm text-muted-foreground">{d.user.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" />
                      <span>{d.user.phone || 'No disponible'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{d.activeOrders} pedidos activos</span>
                  </div>
                  <Badge className={cn('gap-1', d.isOnline ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700')}>
                    {d.isOnline ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {d.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                  <Badge className={cn('gap-1', d.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700')}>
                    {d.isAvailable ? 'Disponible' : 'No disponible'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => handleToggleAvailability(d.id, d.isActive)} className="gap-2">
                    {d.isActive ? <><XCircle className="h-4 w-4" /> Desactivar</> : <><CheckCircle className="h-4 w-4" /> Activar</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{deliveries.length} deliveries</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</Button>
                <span className="text-sm py-1">Página {currentPage} de {totalPages}</span>
                <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}