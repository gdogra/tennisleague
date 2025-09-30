import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSidebar from '@/components/ContactSidebar';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductOptions from '@/components/ProductOptions';
import QuantitySelector from '@/components/QuantitySelector';
import ProductTabs from '@/components/ProductTabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import backend from '@/lib/backendClient';

interface DatabaseProduct {
  id: number;
  name: string;
  description: string;
  category_id: number;
  brand: string;
  model: string;
  price: number;
  sale_price: number;
  is_on_sale: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  weight: number;
  dimensions: string;
  color_options: string;
  size_options: string;
  main_image: string;
  additional_images: string;
  specifications: string;
  features: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductCategory {
  id: number;
  name: string;
  description: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [productImages, setProductImages] = useState<Array<{
    id: string;
    url: string;
    alt: string;
    color?: string;
  }>>([]);

  useEffect(() => {
    if (!id) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Fetch product data
        const { data: productItem, error: productError } = await backend.products.getById(parseInt(id));
        if (productError) throw new Error(productError);
        if (!productItem) throw new Error('Product not found');
        setProduct(productItem);

        // Fetch category data if available
        if (productItem.category_id && productItem.category_id > 0) {
          const { data: categoryList } = await backend.categories.list();
          const cat = (categoryList || []).find((c: any) => c.id === productItem.category_id) || null;
          setCategory(cat);
        }

        // Process images
        await loadProductImages(productItem);

        setError('');
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const loadProductImages = async (product: DatabaseProduct) => {
    const images: Array<{id: string;url: string;alt: string;color?: string;}> = [];

    // Main image
    if (product.main_image && product.main_image.trim() !== '') {
      const mainImageUrl = product.main_image.startsWith('http') ? product.main_image : product.main_image;
      images.push({ id: '1', url: mainImageUrl, alt: `${product.name} - Main Image` });
    }

    // Additional images
    if (product.additional_images && product.additional_images.trim() !== '') {
      try {
        const additionalImages = JSON.parse(product.additional_images);
        if (Array.isArray(additionalImages)) {
          for (let i = 0; i < additionalImages.length; i++) {
            const imageRef = additionalImages[i];
            const imageUrl = typeof imageRef === 'string' ? imageRef : imageRef.url || '';
            images.push({
              id: (i + 2).toString(),
              url: imageUrl,
              alt: `${product.name} - Image ${i + 2}`,
              color: typeof imageRef === 'object' ? imageRef.color : undefined
            });
          }
        }
      } catch (error) {
        console.error('Error parsing additional images:', error);
      }
    }

    // Fallback image if no images
    if (images.length === 0) {
      images.push({
        id: '1',
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        alt: `${product.name} - Default Image`
      });
    }

    setProductImages(images);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const colorOptions = product.color_options?.split(',').map((c) => c.trim()).filter((c) => c) || [];
    const sizeOptions = product.size_options?.split(',').map((s) => s.trim()).filter((s) => s) || [];

    if (colorOptions.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (product.stock_quantity < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    // Ensure user is logged in and member exists
    const { data: userInfo } = await backend.auth.getUserInfo();
    if (!userInfo) {
      toast.error('Please login to add items to cart');
      return;
    }
    const { data: memberInfo } = await backend.members.getByUserId(userInfo.ID);
    if (!memberInfo) {
      toast.error('Member profile not found');
      return;
    }

    const unitPrice = product.is_on_sale && product.sale_price > 0 ? product.sale_price : product.price;

    const { data: existingItem } = await backend.cart.find(
      memberInfo.id,
      product.id,
      selectedColor || '',
      selectedSize || ''
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      const { error } = await backend.cart.update(memberInfo.id, existingItem.id, {
        quantity: newQty,
        total_price: newQty * unitPrice,
        updated_at: new Date().toISOString()
      });
      if (error) {
        toast.error('Failed to update cart');
        return;
      }
    } else {
      const { error } = await backend.cart.create(memberInfo.id, {
        product_id: product.id,
        quantity,
        selected_color: selectedColor || '',
        selected_size: selectedSize || '',
        unit_price: unitPrice,
        total_price: quantity * unitPrice,
        added_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_name: product.name,
        product_brand: product.brand,
        product_image: productImages[0]?.url || ''
      });
      if (error) {
        toast.error('Failed to add to cart');
        return;
      }
    }

    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
            </div>
          </div>
        </main>
        <ContactSidebar />
        <Footer />
      </div>);

  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
            <Button onClick={() => window.history.back()} className="bg-green-600 hover:bg-green-700">
              Go Back
            </Button>
          </div>
        </main>
        <ContactSidebar />
        <Footer />
      </div>);

  }

  const displayPrice = product.is_on_sale && product.sale_price > 0 ? product.sale_price : product.price;
  const originalPrice = product.is_on_sale && product.sale_price > 0 ? product.price : null;
  const colorOptions = product.color_options?.split(',').map((c) => c.trim()).filter((c) => c) || [];
  const sizeOptions = product.size_options?.split(',').map((s) => s.trim()).filter((s) => s) || [];

  // Parse additional info for product tabs
  const additionalInfo: Record<string, string> = {
    Brand: product.brand || 'N/A',
    Model: product.model || 'N/A',
    Weight: product.weight ? `${product.weight}g` : 'N/A',
    Dimensions: product.dimensions || 'N/A',
    Colors: product.color_options || 'N/A',
    Sizes: product.size_options || 'N/A'
  };

  let specifications = {};
  if (product.specifications && product.specifications.trim() !== '') {
    try {
      specifications = JSON.parse(product.specifications);
    } catch (error) {
      console.error('Error parsing specifications:', error);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={productImages} selectedColor={selectedColor} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl font-semibold text-green-600">
                  ${displayPrice.toFixed(2)}
                </div>
                {originalPrice &&
                <div className="text-xl text-gray-500 line-through">
                    ${originalPrice.toFixed(2)}
                  </div>
                }
                {product.is_on_sale &&
                <Badge className="bg-red-500 text-white">On Sale</Badge>
                }
              </div>
            </div>

            {(colorOptions.length > 0 || sizeOptions.length > 0) &&
            <ProductOptions
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onColorChange={setSelectedColor}
              onSizeChange={setSelectedSize}
              colorOptions={colorOptions}
              sizeOptions={sizeOptions} />

            }

            <div className="flex items-center space-x-4">
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                max={product.stock_quantity} />

              <Button
                onClick={handleAddToCart}
                disabled={!product.is_active || product.stock_quantity <= 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md flex items-center justify-center space-x-2">

                <ShoppingCart className="h-4 w-4" />
                <span>
                  {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </span>
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>SKU: <span className="font-medium">{product.id}</span></span>
                <span>Category: <Badge variant="secondary">{category?.name || 'Uncategorized'}</Badge></span>
              </div>
              <div className="text-right">
                <div className={`font-medium ${product.stock_quantity <= product.low_stock_threshold ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="max-w-4xl">
          <ProductTabs
            description={product.description}
            additionalInfo={additionalInfo}
            specifications={specifications}
            features={product.features} />

        </div>
      </main>

      <ContactSidebar />
      <Footer />
    </div>);

}
