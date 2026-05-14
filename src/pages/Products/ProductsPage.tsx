import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { productsService, categoriesService, storageService } from '@/services/api';
import { Product } from '@/types';
import { Search, Plus, Pencil, Trash2, Package, Image as ImageIcon, DollarSign, Upload, X, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUpload {
  url: string;
  file?: File;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [p, c] = await Promise.all([productsService.getAll(), categoriesService.getAll()]);
      setProducts(p);
      setCategories(c);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCount((prev) => prev + 1);
    try {
      const result = await storageService.uploadImage(file, 'products');
      if (result.success && result.data?.url) {
        const newImages = [...images];
        newImages[index] = { url: result.data.url };
        setImages(newImages);
      }
    } catch (error) {
      toast({ title: 'Error al subir imagen', variant: 'destructive' });
    } finally {
      setUploadingCount((prev) => prev - 1);
    }
  };

  const addImageSlot = () => {
    if (images.length < 3) {
      setImages([...images, { url: '' }]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imageUrls = images.map((img) => img.url).filter(Boolean);
      const data: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
      };
      if (imageUrls[0]) data.image1 = imageUrls[0];
      if (imageUrls[1]) data.image2 = imageUrls[1];
      if (imageUrls[2]) data.image3 = imageUrls[2];

      if (editingProduct) {
        await productsService.update(editingProduct.id, data);
        toast({ title: 'Producto actualizado' });
      } else {
        await productsService.create(data);
        toast({ title: 'Producto creado' });
      }
      await fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar producto?')) {
      await productsService.delete(id);
      await fetchData();
      toast({ title: 'Producto eliminado' });
    }
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '' });
    setImages([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId.toString(),
    });
    const productImages: ImageUpload[] = [];
    if (product.image1) productImages.push({ url: product.image1 });
    if (product.image2) productImages.push({ url: product.image2 });
    if (product.image3) productImages.push({ url: product.image3 });
    setImages(productImages);
    setIsDialogOpen(true);
  };

  const filteredProducts = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())), [products, searchTerm]);
  const paginatedProducts = useMemo(() => filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredProducts, currentPage]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de productos</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    {product.image1 ? <img src={product.image1} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category?.name || 'Sin categoría'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold flex items-center gap-1"><DollarSign className="h-4 w-4 text-primary" />{product.price.toFixed(2)}</p>
                    <p className={cn('text-sm', product.stock === 0 && 'text-destructive', product.stock > 0 && product.stock < 10 && 'text-yellow-600')}>Stock: {product.stock}</p>
                  </div>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>{product.isActive ? 'Activo' : 'Inactivo'}</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{filteredProducts.length} productos</p>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Nombre</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe el producto..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Precio</Label><Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Stock</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label>Categoría</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Imágenes (hasta 3)</Label>
              <div className="flex flex-wrap gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative w-24 h-24 border-2 border-dashed border-border rounded-xl overflow-hidden group">
                    {img.url ? (
                      <>
                        <img src={img.url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:border-primary/50 transition-colors">
                        {uploadingCount > 0 ? (
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">{index + 1}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, index)} className="hidden" />
                      </label>
                    )}
                  </div>
                ))}
                {images.length < 3 && (
                  <button type="button" onClick={addImageSlot} className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary">
                    <PlusCircle className="h-6 w-6" />
                    <span className="text-xs mt-1">Agregar</span>
                  </button>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={uploadingCount > 0}>Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}