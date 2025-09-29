import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import backend from '@/lib/backend';
import { CreditCard, Truck, MapPin } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Array<{
    id: number;
    product_id: number;
    product_name?: string;
    product_brand?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    selected_color: string;
    selected_size: string;
    product_image?: string;
  }>;
  memberInfo: any;
  onOrderComplete: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  memberInfo,
  onOrderComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Billing Address
    billingFirstName: '',
    billingLastName: '',
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',

    // Shipping Address
    sameAsbilling: true,
    shippingFirstName: '',
    shippingLastName: '',
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'US',

    // Payment
    paymentMethod: 'credit_card',

    // Shipping Method
    shippingMethod: 'standard',

    // Notes
    notes: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const tax = subtotal * 0.08;
  const shippingCost = getShippingCost(formData.shippingMethod, subtotal);
  const total = subtotal + tax + shippingCost;

  function getShippingCost(method: string, subtotal: number) {
    if (subtotal > 50) return 0; // Free shipping over $50

    switch (method) {
      case 'express':
        return 19.99;
      case 'overnight':
        return 39.99;
      default:
        return 9.99;
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp.slice(-6)}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create billing address object
      const billingAddress = {
        firstName: formData.billingFirstName,
        lastName: formData.billingLastName,
        address1: formData.billingAddress1,
        address2: formData.billingAddress2,
        city: formData.billingCity,
        state: formData.billingState,
        zip: formData.billingZip,
        country: formData.billingCountry
      };

      // Create shipping address object
      const shippingAddress = formData.sameAsbilling ? billingAddress : {
        firstName: formData.shippingFirstName,
        lastName: formData.shippingLastName,
        address1: formData.shippingAddress1,
        address2: formData.shippingAddress2,
        city: formData.shippingCity,
        state: formData.shippingState,
        zip: formData.shippingZip,
        country: formData.shippingCountry
      };

      // Create order
      const orderNumber = generateOrderNumber();
      const orderRecord = {
        member_id: memberInfo.id,
        order_number: orderNumber,
        order_status: 'Pending',
        payment_status: 'Pending',
        subtotal,
        tax_amount: tax,
        shipping_amount: shippingCost,
        discount_amount: 0,
        total_amount: total,
        currency: 'USD',
        payment_method: formData.paymentMethod,
        billing_address: JSON.stringify(billingAddress),
        shipping_address: JSON.stringify(shippingAddress),
        shipping_method: formData.shippingMethod,
        notes: formData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const orderItems = cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name || 'Unknown Product',
        product_brand: item.product_brand || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        selected_color: item.selected_color,
        selected_size: item.selected_size,
        product_image: item.product_image || '',
        item_status: 'In Stock',
        created_at: new Date().toISOString()
      }));

      const { error: orderError } = await backend.orders.create(memberInfo.id, orderRecord, orderItems);
      if (orderError) throw orderError;

      // Clear cart
      await backend.cart.clear(memberInfo.id);

      toast.success(`Order placed successfully! Order #${orderNumber}`);
      onOrderComplete();
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Checkout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Billing Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Billing Address
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingFirstName">First Name</Label>
                    <Input
                      id="billingFirstName"
                      value={formData.billingFirstName}
                      onChange={(e) => handleInputChange('billingFirstName', e.target.value)}
                      required />

                  </div>
                  <div>
                    <Label htmlFor="billingLastName">Last Name</Label>
                    <Input
                      id="billingLastName"
                      value={formData.billingLastName}
                      onChange={(e) => handleInputChange('billingLastName', e.target.value)}
                      required />

                  </div>
                </div>
                
                <div>
                  <Label htmlFor="billingAddress1">Address</Label>
                  <Input
                    id="billingAddress1"
                    value={formData.billingAddress1}
                    onChange={(e) => handleInputChange('billingAddress1', e.target.value)}
                    required />

                </div>
                
                <div>
                  <Label htmlFor="billingAddress2">Apartment, suite, etc. (optional)</Label>
                  <Input
                    id="billingAddress2"
                    value={formData.billingAddress2}
                    onChange={(e) => handleInputChange('billingAddress2', e.target.value)} />

                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      value={formData.billingCity}
                      onChange={(e) => handleInputChange('billingCity', e.target.value)}
                      required />

                  </div>
                  <div>
                    <Label htmlFor="billingState">State</Label>
                    <Input
                      id="billingState"
                      value={formData.billingState}
                      onChange={(e) => handleInputChange('billingState', e.target.value)}
                      required />

                  </div>
                  <div>
                    <Label htmlFor="billingZip">ZIP Code</Label>
                    <Input
                      id="billingZip"
                      value={formData.billingZip}
                      onChange={(e) => handleInputChange('billingZip', e.target.value)}
                      required />

                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Method
                </h3>
                
                <Select
                  value={formData.shippingMethod}
                  onValueChange={(value) => handleInputChange('shippingMethod', value)}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Shipping (5-7 days) - ${subtotal > 50 ? '0.00' : '9.99'}</SelectItem>
                    <SelectItem value="express">Express Shipping (2-3 days) - ${subtotal > 50 ? '10.00' : '19.99'}</SelectItem>
                    <SelectItem value="overnight">Overnight Shipping - ${subtotal > 50 ? '30.00' : '39.99'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h3>
                
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="apple_pay">Apple Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Notes */}
              <div className="space-y-4">
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special instructions for your order..."
                  rows={3} />

              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  {cartItems.map((item) =>
                  <div key={item.id} className="flex justify-between text-sm">
                      <span className="flex-1">
                        {item.product_name} × {item.quantity}
                        {item.selected_color &&
                      <span className="text-gray-500"> ({item.selected_color})</span>
                      }
                        {item.selected_size &&
                      <span className="text-gray-500"> - {item.selected_size}</span>
                      }
                      </span>
                      <span>${item.total_price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Totals */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}>

              {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

};

export default CheckoutModal;
