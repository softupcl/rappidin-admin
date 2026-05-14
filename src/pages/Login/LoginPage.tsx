import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { Loader2, Eye, EyeOff, Store, Shield, Truck, Clock } from 'lucide-react';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: Store, title: 'Gestión de Productos', desc: 'Administra tu catálogo completo' },
  { icon: Truck, title: 'Deliveries', desc: 'Control de repartidores en tiempo real' },
  { icon: Clock, title: 'Pedidos', desc: 'Gestión y asignación de pedidos' },
  { icon: Shield, title: 'Seguro', desc: 'Autenticación segura con JWT' },
];

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await authService.login(data.email, data.password);
      const userData = response.data;

      if (userData.roles && userData.roles.some((r: string) => ['ADMIN', 'DISPATCHER'].includes(r))) {
        setAuth(userData, userData.session_token);
      } else {
        setError('email', { message: 'No tienes permisos de administrador' });
      }
    } catch (error: any) {
      setError('email', { message: error.response?.data?.message || 'Credenciales inválidas' });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 animate-fade-in">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rappidin</h1>
              <p className="text-sm text-muted-foreground">Panel de Administración</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@rapidin.cl"
                  className="h-12 pl-4 pr-4 rounded-xl border-border focus:border-primary focus:ring-primary/20 transition-all"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-12 pl-4 pr-12 rounded-xl border-border focus:border-primary focus:ring-primary/20 transition-all"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl gradient-primary text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-surface rounded-xl border border-border">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Conexión Segura</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tu información está protegida con autenticación JWT
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Features Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero animate-gradient-shift relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Rappidin Admin</h2>
                <p className="text-white/80">Gestión integral de tu negocio</p>
              </div>
            </div>

            <p className="text-lg text-white/90 mb-10 max-w-md">
              Administra pedidos, productos, deliveries y mucho más desde un solo lugar.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-white/70">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Badge */}
          <div className="mt-12 flex items-center gap-2 text-white/60 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Sistema operativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}