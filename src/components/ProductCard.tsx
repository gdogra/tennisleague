import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import backend from '@/lib/backendClient';

interface DatabaseProduct {
  id: number;
  name: string;
  price: number;
  sale_price: number;
  is_on_sale: boolean;
  main_image: string;
  category_id: number;
  description: string;
  stock_quantity: number;
  is_active: boolean;
}

interface ProductCardProps {
  product: DatabaseProduct;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName = 'Uncategorized' }: ProductCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (product.main_image && product.main_image.trim() !== '') {
        try {
          // Check if it's already a URL
          if (product.main_image.startsWith('http')) {
            setImageUrl(product.main_image);
          } else {
            setImageUrl(product.main_image);
          }
        } catch (error) {
          console.error('Error loading image:', error);
          setImageUrl('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500');
        }
      } else {
        setImageUrl('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500');
      }
      setLoading(false);
    };

    loadImage();
  }, [product.main_image]);

  const displayPrice = product.is_on_sale && product.sale_price > 0 ? product.sale_price : product.price;
  const originalPrice = product.is_on_sale && product.sale_price > 0 ? product.price : null;

  const handleQuickAdd = async () => {
    if (!product.is_active || product.stock_quantity === 0) {
      toast.error('This product is currently unavailable');
      return;
    }

    try {
      // Check if user is logged in
      const { data: userInfo, error: authError } = await backend.auth.getUserInfo();
      if (authError || !userInfo) {
        toast.error('Please login to add items to cart');
        return;
      }

      // Get member info
      const { data: memberInfo, error: memberError } = await backend.members.getByUserId(userInfo.ID);

      if (memberError || !memberInfo) {
        toast.error('Member profile not found. Please contact support.');
        return;
      }
      const unitPrice = product.is_on_sale ? product.sale_price : product.price;

      // Check if item already exists in cart
      const { data: existingItem, error: cartError } = await backend.cart.find(memberInfo.id, product.id, '', '');
      if (cartError) throw cartError;
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        const { error: updateError } = await backend.cart.update(memberInfo.id, existingItem.id, {
          quantity: newQuantity,
          total_price: newQuantity * unitPrice,
          updated_at: new Date().toISOString()
        });
        if (updateError) throw updateError;
      } else {
        const { error: createError } = await backend.cart.create(memberInfo.id, {
          product_id: product.id,
          quantity: 1,
          selected_color: '',
          selected_size: '',
          unit_price: unitPrice,
          total_price: unitPrice,
          added_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        if (createError) throw createError;
      }

      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to add item to cart');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-transform hover:scale-105">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square bg-gray-100 relative">
          {loading ?
          <div className="w-full h-full animate-pulse bg-gray-200" /> :

          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover" />

          }
          {product.is_on_sale &&
          <Badge className="absolute top-2 right-2 bg-red-500 text-white">Sale</Badge>
          }
          {product.stock_quantity <= 0 &&
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          }
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green-600">
              ${displayPrice.toFixed(2)}
            </span>
            {originalPrice &&
            <span className="text-sm text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            }
          </div>
          <Badge variant="secondary">{categoryName}</Badge>
        </div>
        
        {product.description &&
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        }
        
        <div className="flex space-x-2">
          <Link to={`/product/${product.id}`} className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          {product.is_active && product.stock_quantity > 0 &&
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickAdd}
            className="px-3">

              +
            </Button>
          }
        </div>
      </div>
    </div>);

}
