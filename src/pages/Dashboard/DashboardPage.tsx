import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardService } from '@/services/api';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Award,
  BarChart3,
  Activity,
  Store,
  XCircle,
  MapPin,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#FF6B35', '#004E89', '#F77F00', '#4CAF50', '#2196F3', '#9C27B0'];

function StatCard({ title, value, icon: Icon, color, bgColor, change, suffix = '' }: any) {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">
              {value}{suffix}
            </p>
            {change !== undefined && (
              <p className={cn('text-xs mt-2 flex items-center gap-1 font-medium', change >= 0 ? 'text-success' : 'text-destructive')}>
                {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change >= 0 ? '+' : ''}{change}% vs ayer
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl transition-transform group-hover:scale-110', bgColor)}>
            <Icon className={cn('h-5 w-5', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      console.log('Dashboard stats:', data);
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      setError(error.response?.data?.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Error al cargar el dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={fetchData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Sin datos disponibles</h2>
        <p className="text-muted-foreground text-center max-w-md">
          No hay datos para mostrar. Comienza agregando productos y categorías.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen completo de tu negocio</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border">
          <Store className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Rappidin Admin</span>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse ml-2" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Pedidos Pendientes"
          value={stats.pendingOrders || 0}
          icon={Clock}
          color="text-warning"
          bgColor="bg-warning/10"
        />
        <StatCard
          title="En Camino"
          value={stats.inProgressOrders || 0}
          icon={Truck}
          color="text-info"
          bgColor="bg-info/10"
        />
        <StatCard
          title="Entregados"
          value={stats.completedOrders || 0}
          icon={CheckCircle}
          color="text-success"
          bgColor="bg-success/10"
        />
        <StatCard
          title="Ventas Hoy"
          value={`$${(stats.todayRevenue || 0).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color="text-primary"
          bgColor="bg-primary/10"
          change={stats.revenueChange}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Pedidos"
          value={stats.totalOrders || 0}
          icon={ShoppingCart}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Clientes"
          value={stats.totalUsers || 0}
          icon={Users}
          color="text-teal-600"
          bgColor="bg-teal-50"
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts || 0}
          icon={Package}
          color="text-accent"
          bgColor="bg-accent/10"
        />
        <StatCard
          title="Deliveries"
          value={stats.totalDeliveries || 0}
          icon={Truck}
          color="text-secondary"
          bgColor="bg-secondary/10"
        />
      </div>

      {/* Revenue & Order Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Ingresos Semanales</CardTitle>
            </div>
            <CardDescription>Ventas de los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.weeklyRevenue && stats.weeklyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.weeklyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#999" tickFormatter={(v: any) => `$${v}`} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Ingresos']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF6B35"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Sin datos de ingresos esta semana
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Estado de Pedidos</CardTitle>
            </div>
            <CardDescription>Distribución actual</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {stats.ordersByStatus.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${Number(value)} pedidos`, 'Cantidad']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {stats.ordersByStatus.map((item: any, index: number) => (
                    <div key={item.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.status}</span>
                      </div>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Sin pedidos registrados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Top Deliveries */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>Productos Más Vendidos</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link to="/products">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts && stats.topProducts.length > 0 ? (
                stats.topProducts.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                      index === 0 ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'
                    )}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${product.price?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{product.totalQuantity} vendidos</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Sin datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Deliveries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <CardTitle>Top Deliveries</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link to="/deliveries">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topDeliveries && stats.topDeliveries.length > 0 ? (
                stats.topDeliveries.map((delivery: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-surface">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn(
                        'text-sm font-semibold',
                        index === 0 ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'
                      )}>
                        {delivery.name?.[0]}{delivery.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{delivery.name} {delivery.lastname}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {delivery.phone && <Phone className="h-3 w-3" />}
                        <span>{delivery.phone || 'Sin teléfono'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{delivery.completedDeliveries}</p>
                      <p className="text-xs text-muted-foreground">entregas</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Sin datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock & Metrics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <Card className="border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Stock Bajo</CardTitle>
            </div>
            <CardDescription>Productos con menos de 10 unidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                    </div>
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      {product.stock}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Todo el stock está bien</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Métricas del Negocio</CardTitle>
            </div>
            <CardDescription>Indicadores clave de rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-surface rounded-xl">
                <p className="text-3xl font-bold text-primary">
                  ${stats.avgOrderValue ? stats.avgOrderValue.toFixed(0) : '0'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Ticket Promedio</p>
              </div>
              <div className="text-center p-4 bg-surface rounded-xl">
                <p className={cn('text-3xl font-bold', (stats.cancellationRate || 0) > 10 ? 'text-destructive' : 'text-success')}>
                  {stats.cancellationRate || 0}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Tasa Cancelación</p>
              </div>
              <div className="text-center p-4 bg-surface rounded-xl">
                <p className="text-3xl font-bold text-secondary">
                  ${stats.monthlyRevenue ? stats.monthlyRevenue.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Ingresos Mes</p>
              </div>
              <div className="text-center p-4 bg-surface rounded-xl">
                <p className="text-3xl font-bold text-accent">
                  {stats.totalOrders || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Histórico</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos pedidos recibidos</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/orders">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="gradient-primary text-white text-sm">
                        {order.client?.name?.[0]}{order.client?.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {order.client?.name} {order.client?.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        #{order.id} • {order.products?.length || 0} productos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {order.delivery && (
                      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>{order.delivery.name}</span>
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize',
                        order.status === 'PENDIENTE' && 'border-warning text-warning bg-warning/10',
                        order.status === 'DESPACHADO' && 'border-info text-info bg-info/10',
                        order.status === 'EN CAMINO' && 'border-purple-500 text-purple-600 bg-purple-50',
                        order.status === 'ENTREGADO' && 'border-success text-success bg-success/10',
                        order.status === 'CANCELADO' && 'border-destructive text-destructive bg-destructive/10'
                      )}
                    >
                      {order.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay pedidos recientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}