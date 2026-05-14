import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { deliveriesService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Truck, MapPin, Phone, CheckCircle, XCircle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { fetchDeliveries(); }, []);

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
        <Badge variant="outline" className="px-3 py-1">{deliveries.length} repartidores</Badge>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {paginatedDeliveries.map((d) => (
              <div key={d.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border hover:bg-surface transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-muted">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">{d.user.name?.[0]}{d.user.lastname?.[0]}</AvatarFallback>
                  </Avatar>
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
                  {d.currentLat && d.currentLng && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span>{d.currentLat.toFixed(4)}, {d.currentLng.toFixed(4)}</span>
                    </div>
                  )}
                  <Badge className={cn('gap-1', d.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {d.isAvailable ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {d.isAvailable ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Button size="sm" variant={d.isAvailable ? 'destructive' : 'default'} onClick={() => handleToggleAvailability(d.id, d.isAvailable)} className="gap-2">
                    {d.isAvailable ? <><XCircle className="h-4 w-4" /> Desactivar</> : <><CheckCircle className="h-4 w-4" /> Activar</>}
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