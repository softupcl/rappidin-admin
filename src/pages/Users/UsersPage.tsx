import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usersService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await usersService.updateStatus(id, !currentStatus);
      await fetchUsers();
      toast({ title: !currentStatus ? 'Usuario activado' : 'Usuario desactivado' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.roles.some((r: any) => r.name.toLowerCase() === roleFilter);
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const paginatedUsers = useMemo(() => filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredUsers, currentPage]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700';
      case 'DISPATCHER': return 'bg-purple-100 text-purple-700';
      case 'CLIENTE': return 'bg-blue-100 text-blue-700';
      case 'REPARTIDOR': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">{filteredUsers.length} usuarios</Badge>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant={roleFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setRoleFilter('all')}>Todos</Button>
              <Button variant={roleFilter === 'cliente' ? 'default' : 'outline'} size="sm" onClick={() => setRoleFilter('cliente')}>Clientes</Button>
              <Button variant={roleFilter === 'repartidor' ? 'default' : 'outline'} size="sm" onClick={() => setRoleFilter('repartidor')}>Deliveries</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border hover:bg-surface transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-muted">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{user.name?.[0]}{user.lastname?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name} {user.lastname}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles.map((role: any, idx: number) => (
                        <Badge key={idx} className={cn('text-xs', getRoleColor(role.name))}>{role.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn('gap-1', user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {user.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Button size="sm" variant={user.isActive ? 'outline' : 'default'} className="gap-2" onClick={() => handleToggleStatus(user.id, user.isActive)}>
                    {user.isActive ? <><XCircle className="h-4 w-4" /> Desactivar</> : <><CheckCircle className="h-4 w-4" /> Activar</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{filteredUsers.length} usuarios</p>
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