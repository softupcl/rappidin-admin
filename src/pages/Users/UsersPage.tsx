import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usersService } from '@/services/api';
import { UserRoleFilter, ROLE_MAPPINGS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Pencil, Trash2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = [
  { value: 'restaurante' as const, label: 'Restaurante' },
  { value: 'repartidor' as const, label: 'Repartidor' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all');
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    lastname: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roles: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }
    try {
      const dbRoles = formData.roles.map(r => ROLE_MAPPINGS[r as keyof typeof ROLE_MAPPINGS]);
      const data: any = {
        email: formData.email,
        name: formData.name,
        lastname: formData.lastname,
        phone: formData.phone,
        roles: dbRoles,
      };
      if (formData.password) {
        data.password = formData.password;
      }

      if (editingUser) {
        await usersService.update(editingUser.id, data);
        toast({ title: 'Usuario actualizado' });
      } else {
        await usersService.create(data);
        toast({ title: 'Usuario creado' });
      }
      await fetchUsers();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error al guardar usuario', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersService.delete(userToDelete.id);
      toast({ title: 'Usuario eliminado' });
      await fetchUsers();
    } catch (error) {
      toast({ title: 'Error al eliminar usuario', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ email: '', name: '', lastname: '', phone: '', password: '', confirmPassword: '', roles: [] });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    const userRoles = user.roles.map((r: any) => r.role?.name?.toLowerCase());
    setFormData({
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      roles: userRoles.includes('restaurante') ? ['restaurante'] : userRoles.includes('repartidor') ? ['repartidor'] : [],
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const dbRole = roleFilter === 'all' ? null : ROLE_MAPPINGS[roleFilter];
      const matchesRole = roleFilter === 'all' || (user.roles || []).some((r: any) => r.role?.name === dbRole);
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const paginatedUsers = useMemo(() => filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredUsers, currentPage]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700';
      case 'DISPATCHER': return 'bg-purple-100 text-purple-700';
      case 'RESTAURANTE': return 'bg-orange-100 text-orange-700';
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
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">{filteredUsers.length} usuarios</Badge>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo Usuario
          </Button>
        </div>
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
              <Button variant={roleFilter === 'restaurante' ? 'default' : 'outline'} size="sm" onClick={() => setRoleFilter('restaurante')}>Restaurantes</Button>
              <Button variant={roleFilter === 'repartidor' ? 'default' : 'outline'} size="sm" onClick={() => setRoleFilter('repartidor')}>Repartidores</Button>
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
                      {user.roles.map((userRole: any, idx: number) => (
                        <Badge key={idx} className={cn('text-xs', getRoleColor(userRole.role?.name || ''))}>{userRole.role?.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn('gap-1', user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {user.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(user)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button size="sm" variant={user.isActive ? 'outline' : 'default'} className="gap-2" onClick={() => handleToggleStatus(user.id, user.isActive)}>
                      {user.isActive ? <><XCircle className="h-4 w-4" /> Desactivar</> : <><CheckCircle className="h-4 w-4" /> Activar</>}
                    </Button>
                  </div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica los datos del usuario' : 'Ingresa los datos del nuevo usuario'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido</Label>
                <Input id="lastname" value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{editingUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required className="pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <Button
                    key={role.value}
                    type="button"
                    variant={formData.roles.includes(role.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (formData.roles.includes(role.value)) {
                        setFormData({ ...formData, roles: formData.roles.filter((r) => r !== role.value) });
                      } else {
                        setFormData({ ...formData, roles: [...formData.roles, role.value] });
                      }
                    }}
                  >
                    {role.label}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={formData.roles.length === 0}>Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar al usuario <strong>{userToDelete?.name} {userToDelete?.lastname}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}