import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CartItemProps {
  item: {
    id: number;
    product_id: number;
    product_name?: string;
    product_brand?: string;
    product_image?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    selected_color: string;
    selected_size: string;
    is_active?: boolean;
    stock_quantity?: number;
  };
  onQuantityChange: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);

  // Load product image
  useEffect(() => {
    if (!item.product_image) {
      setImageUrl('/api/placeholder/80/80');
      setImageLoading(false);
      return;
    }
    try {
      const url = item.product_image.startsWith('http') ? item.product_image : item.product_image;
      setImageUrl(url);
    } catch (e) {
      setImageUrl('/api/placeholder/80/80');
    } finally {
      setImageLoading(false);
    }
  }, [item.product_image]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      onQuantityChange(item.id, newQuantity);
    }
  };

  const isOutOfStock = item.stock_quantity === 0 || !item.is_active;
  const isLowStock = item.stock_quantity && item.stock_quantity < 5;

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${isOutOfStock ? 'opacity-60' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {imageLoading ?
          <div className="w-full h-full bg-gray-300 animate-pulse" /> :

          <img
            src={imageUrl}
            alt={item.product_name}
            className="w-full h-full object-cover"
            onError={() => setImageUrl('/api/placeholder/80/80')} />

          }
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {item.product_name || 'Unknown Product'}
          </h3>
          {item.product_brand &&
          <p className="text-sm text-gray-600">{item.product_brand}</p>
          }
          
          {/* Product Options */}
          <div className="mt-1 space-y-1">
            {item.selected_color &&
            <p className="text-xs text-gray-500">Color: {item.selected_color}</p>
            }
            {item.selected_size &&
            <p className="text-xs text-gray-500">Size: {item.selected_size}</p>
            }
          </div>

          {/* Stock Status */}
          {isOutOfStock ?
          <p className="text-sm text-red-600 font-medium mt-1">Out of Stock</p> :
          isLowStock ?
          <p className="text-sm text-orange-600 mt-1">Only {item.stock_quantity} left</p> :
          null}

          {/* Price */}
          <p className="text-lg font-bold text-gray-900 mt-2">
            ${item.unit_price.toFixed(2)} each
          </p>
          <p className="text-sm text-gray-600">
            Total: ${item.total_price.toFixed(2)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-end space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50">

            <Trash2 className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="h-8 w-8 p-0">

              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
              className="w-16 h-8 text-center"
              min="1" />

            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isOutOfStock}
              className="h-8 w-8 p-0">

              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>);

};

export default CartItem;
