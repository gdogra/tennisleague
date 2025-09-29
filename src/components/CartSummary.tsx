import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, CreditCard } from 'lucide-react';

interface CartSummaryProps {
  items: Array<{
    id: number;
    quantity: number;
    total_price: number;
  }>;
  onCheckout: () => void;
  onClearCart: () => void;
  loading?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  onCheckout,
  onClearCart,
  loading = false
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5" />
          <span>Order Summary</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Item Count */}
        <div className="flex justify-between text-sm">
          <span>Items ({itemCount})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span>Tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span>
            Shipping 
            {subtotal > 50 && <span className="text-green-600 text-xs"> (Free!)</span>}
          </span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        
        <Separator />
        
        {/* Total */}
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        
        {/* Free Shipping Notice */}
        {subtotal > 0 && subtotal < 50 &&
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            Add ${(50 - subtotal).toFixed(2)} more for free shipping!
          </div>
        }
        
        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={onCheckout}
            disabled={items.length === 0 || loading}>

            <CreditCard className="h-4 w-4 mr-2" />
            Proceed to Checkout
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={onClearCart}
            disabled={items.length === 0 || loading}>

            Clear Cart
          </Button>
          
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => window.location.href = '/'}>

            Continue Shopping
          </Button>
        </div>
      </CardContent>
    </Card>);

};

export default CartSummary;