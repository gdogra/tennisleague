import { useState } from 'react';
import Header from '@/components/Header';
import ContactSidebar from '@/components/ContactSidebar';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import CartSummary from '@/components/CartSummary';
import CheckoutModal from '@/components/CheckoutModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';

const CartPage = () => {
  const {
    cartItems,
    loading,
    user,
    memberInfo,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCartItems
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setShowCheckout(true);
  };

  const handleOrderComplete = () => {
    loadCartItems();
    toast.success('Order placed successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading cart...</span>
          </div>
        </div>
        <Footer />
      </div>);

  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Cart Content */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-500">
                  Cart
                </h1>
                
                {/* Login Required Alert */}
                <Alert className="mb-6 border-orange-200 bg-orange-50">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Please log in to view your cart and make purchases.
                  </AlertDescription>
                </Alert>
                
                {/* Login Button */}
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mr-4"
                  onClick={() => window.location.href = '/members/memberlogin'}>

                  Login
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}>

                  Continue Shopping
                </Button>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ContactSidebar />
            </div>
          </div>
        </div>
        
        <Footer />
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Cart Content */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-500 flex items-center">
                <ShoppingCart className="h-6 w-6 mr-2" />
                Shopping Cart
                {cartItems.length > 0 &&
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                }
              </h1>
              
              {cartItems.length === 0 ?
              <>
                  {/* Empty Cart Alert */}
                  <Alert className="mb-6 border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Your cart is currently empty.
                    </AlertDescription>
                  </Alert>
                  
                  {/* Return to Shop Button */}
                  <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                  onClick={() => window.location.href = '/'}>

                    Continue Shopping
                  </Button>
                </> :

              <div className="space-y-4">
                  {/* Cart Items */}
                  {cartItems.map((item) =>
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={updateQuantity}
                  onRemove={removeFromCart} />

                )}
                  
                  {/* Continue Shopping Button */}
                  <div className="pt-4 border-t">
                    <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}>

                      Continue Shopping
                    </Button>
                  </div>
                </div>
              }
            </div>
          </div>
          
          {/* Sidebar - Cart Summary and Contact */}
          <div className="lg:col-span-1 space-y-6">
            {cartItems.length > 0 &&
            <CartSummary
              items={cartItems}
              onCheckout={handleCheckout}
              onClearCart={clearCart}
              loading={loading} />

            }
            
            <ContactSidebar />
          </div>
        </div>
      </div>
      
      {/* Checkout Modal */}
      {showCheckout && memberInfo &&
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartItems}
        memberInfo={memberInfo}
        onOrderComplete={handleOrderComplete} />

      }
      
      <Footer />
    </div>);

};

export default CartPage;
