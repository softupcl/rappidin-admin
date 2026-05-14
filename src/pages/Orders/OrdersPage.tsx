import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ordersService, deliveriesService } from '@/services/api';
import { Order, OrderStatus } from '@/types';
import { Search, Eye, Truck, Check, X, Package, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
  PENDIENTE: { label: 'Pendiente', bg: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  DESPACHADO: { label: 'Despachado', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
  'EN CAMINO': { label: 'En Camino', bg: 'bg-purple-100 text-purple-700 border-purple-200' },
  ENTREGADO: { label: 'Entregado', bg: 'bg-green-100 text-green-700 border-green-200' },
  CANCELADO: { label: 'Cancelado', bg: 'bg-red-100 text-red-700 border-red-200' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, deliveriesData] = await Promise.all([
        ordersService.getAll(),
        deliveriesService.getAll(),
      ]);
      setOrders(ordersData);
      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedOrder || !selectedDelivery) return;
    try {
      await ordersService.assignDelivery(selectedOrder.id, selectedDelivery);
      await fetchData();
      setAssignDialog(false);
      setSelectedDelivery(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, status);
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client?.lastname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de tus clientes</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {filteredOrders.length} pedidos
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="DESPACHADO">Despachado</SelectItem>
                <SelectItem value="EN CAMINO">En Camino</SelectItem>
                <SelectItem value="ENTREGADO">Entregado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay pedidos</p>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border hover:bg-surface transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{order.id}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {order.client?.name} {order.client?.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.products?.length || 0} productos
                        {order.delivery && ` • ${order.delivery.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={STATUS_CONFIG[order.status]?.bg}>
                      {STATUS_CONFIG[order.status]?.label}
                    </Badge>
                    <div className="flex gap-1">
                      {order.status === 'PENDIENTE' && (
                        <Button size="sm" onClick={() => { setSelectedOrder(order); setAssignDialog(true); }}>
                          <Truck className="h-4 w-4 mr-1" /> Asignar
                        </Button>
                      )}
                      {order.status === 'DESPACHADO' && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'EN CAMINO')}>
                          <Check className="h-4 w-4 mr-1" /> En Camino
                        </Button>
                      )}
                      {order.status === 'EN CAMINO' && (
                        <Button size="sm" className="bg-green-600" onClick={() => handleUpdateStatus(order.id, 'ENTREGADO')}>
                          <Check className="h-4 w-4 mr-1" /> Entregado
                        </Button>
                      )}
                      {order.status !== 'ENTREGADO' && order.status !== 'CANCELADO' && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleUpdateStatus(order.id, 'CANCELADO')}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder && !assignDialog} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Información completa del pedido</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOrder.client?.name} {selectedOrder.client?.lastname}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge className={STATUS_CONFIG[selectedOrder.status]?.bg}>
                    {STATUS_CONFIG[selectedOrder.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p>{selectedOrder.client?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p>{new Date(selectedOrder.timestamp * 1000).toLocaleString('es-CL')}</p>
                </div>
              </div>
              {selectedOrder.address && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dirección</p>
                  <div className="flex items-center gap-2 p-3 bg-surface rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p>{selectedOrder.address.address}, {selectedOrder.address.neighborhood}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Productos</p>
                <div className="space-y-2">
                  {selectedOrder.products?.map((op) => (
                    <div key={op.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{op.product?.name}</p>
                          <p className="text-sm text-muted-foreground">${op.product?.price?.toFixed(2)} x {op.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${((op.product?.price || 0) * op.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Delivery</DialogTitle>
            <DialogDescription>Selecciona un delivery para el pedido #{selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedDelivery?.toString() || ''} onValueChange={(v) => setSelectedDelivery(parseInt(v))}>
              <SelectTrigger><SelectValue placeholder="Elige un delivery" /></SelectTrigger>
              <SelectContent>
                {deliveries.filter((d) => d.isAvailable).map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.user.name} {d.user.lastname} - {d.activeOrders} pedidos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>Cancelar</Button>
            <Button onClick={handleAssignDelivery} disabled={!selectedDelivery}>Asignar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}