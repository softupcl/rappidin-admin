import { useEffect, useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
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
import { ordersService } from '@/services/api';
import { socketService } from '@/services/socket';
import { Order, OrderStatus, User } from '@/types';
import { Search, Eye, Truck, X, Package, Check, MapPin, Loader2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
  PENDIENTE: { label: 'Pendiente', bg: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  'EN PREPARACION': { label: 'En Preparación', bg: 'bg-orange-100 text-orange-700 border-orange-200' },
  DESPACHADO: { label: 'Despachado', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
  'EN CAMINO': { label: 'En Camino', bg: 'bg-purple-100 text-purple-700 border-purple-200' },
  ENTREGADO: { label: 'Entregado', bg: 'bg-green-100 text-green-700 border-green-200' },
  CANCELADO: { label: 'Cancelado', bg: 'bg-red-100 text-red-700 border-red-200' },
};

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    socketService.connectAdmin();

    socketService.onOrderTaken(({ orderId, deliveryId, delivery }) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: 'EN CAMINO',
              delivery: delivery
                ? { id: deliveryId, name: delivery.name, lastname: delivery.lastname } as User
                : order.delivery,
            };
          }
          return order;
        })
      );
    });

    socketService.onOrderStatusChanged(({ orderId, status }) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: status as OrderStatus,
            };
          }
          return order;
        })
      );
    });

    socketService.onNewOrder((newOrder) => {
      toast({ title: `Nuevo pedido recibido #${newOrder.id}` });
      setOrders((prevOrders) => {
        // Asegurarse de que no exista para evitar duplicados en strict mode
        if (prevOrders.some((o) => o.id === newOrder.id)) return prevOrders;
        return [newOrder, ...prevOrders];
      });
    });

    return () => {
      socketService.disconnectAdmin();
    };
  }, []);

  const fetchData = async () => {
    try {
      const ordersData = await ordersService.getAll();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await ordersService.updateStatus(orderId, status);
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client?.lastname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [orders, searchTerm, statusFilter]);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="font-bold text-primary text-sm">#{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'client',
      header: 'Cliente',
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-sm">{row.original.client?.name} {row.original.client?.lastname}</p>
          <p className="text-xs text-muted-foreground">{row.original.client?.phone || ''}</p>
        </div>
      ),
    },
    {
      accessorKey: 'products',
      header: 'Productos',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.products?.length || 0}</span>
      ),
    },
    {
      accessorKey: 'delivery',
      header: 'Repartidor',
      cell: ({ row }) =>
        row.original.delivery ? (
          <span className="text-sm">{row.original.delivery.name} {row.original.delivery.lastname}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge className={STATUS_CONFIG[row.original.status]?.bg}>
          {STATUS_CONFIG[row.original.status]?.label}
        </Badge>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: 'Fecha',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.original.timestamp).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        if (updatingOrderId === order.id) {
          return (
            <Button size="sm" disabled>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Actualizando...
            </Button>
          );
        }
        return (
          <div className="flex items-center gap-1">
            {order.status === 'PENDIENTE' && (
              <>
                <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'EN PREPARACION')}>
                  <Package className="h-4 w-4 mr-1" /> Prep
                </Button>
                <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'DESPACHADO')}>
                  <Truck className="h-4 w-4 mr-1" /> Despachar
                </Button>
              </>
            )}
            {order.status === 'EN PREPARACION' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'PENDIENTE')}>
                  ← Volver
                </Button>
                <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'DESPACHADO')}>
                  <Truck className="h-4 w-4 mr-1" /> Despachar
                </Button>
              </>
            )}
            {order.status === 'DESPACHADO' && (
              <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'EN PREPARACION')}>
                ← Preparación
              </Button>
            )}
            {order.status === 'EN CAMINO' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'DESPACHADO')}>
                  ← Despachado
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(order.id, 'ENTREGADO')}>
                  <Check className="h-4 w-4 mr-1" /> Entregado
                </Button>
              </>
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
        );
      },
    },
  ];

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
                <SelectItem value="EN PREPARACION">En Preparación</SelectItem>
                <SelectItem value="DESPACHADO">Despachado</SelectItem>
                <SelectItem value="EN CAMINO">En Camino</SelectItem>
                <SelectItem value="ENTREGADO">Entregado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable
            columns={columns}
            data={filteredOrders}
            totalItems={filteredOrders.length}
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
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
                  <p className="text-sm text-muted-foreground">Fecha Solicitud</p>
                  <p>{new Date(selectedOrder.timestamp).toLocaleString('es-CL')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forma de Pago</p>
                  <p className="capitalize">{selectedOrder.paymentMethod || 'Efectivo'}</p>
                </div>
                {selectedOrder.takenAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Hora de Salida</p>
                    <p>{new Date(selectedOrder.takenAt).toLocaleString('es-CL')}</p>
                  </div>
                )}
                {selectedOrder.deliveredAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Hora de Entrega</p>
                    <p>{new Date(selectedOrder.deliveredAt).toLocaleString('es-CL')}</p>
                  </div>
                )}
              </div>
              
              {selectedOrder.delivery && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Repartidor Asignado</p>
                  <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedOrder.delivery.name} {selectedOrder.delivery.lastname}</p>
                        {selectedOrder.delivery.phone && (
                          <p className="text-sm text-muted-foreground">{selectedOrder.delivery.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                          <p className="text-sm text-muted-foreground">${Math.round(op.product?.price || 0)} x {op.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${Math.round((op.product?.price || 0) * op.quantity)}</p>
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
    </div>
  );
}