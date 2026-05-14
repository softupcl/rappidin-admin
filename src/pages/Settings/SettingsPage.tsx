import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { settingsService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Store, Clock, DollarSign, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.get();
      setConfig(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.update(config);
      await fetchSettings();
      toast({ title: 'Configuración guardada' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Configura los parámetros de tu negocio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle>Información del Negocio</CardTitle>
            </div>
            <CardDescription>Datos básicos de tu empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={config?.name || ''} onChange={(e) => setConfig({ ...config, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={config?.email || ''} onChange={(e) => setConfig({ ...config, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input value={config?.phone || ''} onChange={(e) => setConfig({ ...config, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Dirección</Label><Input value={config?.address || ''} onChange={(e) => setConfig({ ...config, address: e.target.value })} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Horario de Atención</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Apertura</Label><Input type="time" value={config?.openingTime || '09:00'} onChange={(e) => setConfig({ ...config, openingTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>Cierre</Label><Input type="time" value={config?.closingTime || '22:00'} onChange={(e) => setConfig({ ...config, closingTime: e.target.value })} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Configuración de Envíos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tarifa Mínima</Label><Input type="number" step="0.01" value={config?.minDeliveryFee || 0} onChange={(e) => setConfig({ ...config, minDeliveryFee: parseFloat(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Radio de Entrega (km)</Label><Input type="number" step="0.1" value={config?.deliveryRadius || 5} onChange={(e) => setConfig({ ...config, deliveryRadius: parseFloat(e.target.value) })} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Apariencia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Color Principal</Label>
              <div className="flex gap-4 items-center">
                <Input type="color" value={config?.primaryColor || '#FF6B35'} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="w-16 h-10" />
                <Input value={config?.primaryColor || '#FF6B35'} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2"><Label>URL del Logo</Label><Input value={config?.logo || ''} onChange={(e) => setConfig({ ...config, logo: e.target.value })} placeholder="https://..." /></div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> Guardar Cambios</>}
        </Button>
      </form>
    </div>
  );
}