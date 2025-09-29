import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ContactSidebar from '@/components/ContactSidebar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  ShoppingBag } from
'lucide-react';
import { toast } from 'sonner';
import backend from '@/lib/backend';

interface Order {
  id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  shipping_method: string;
  tracking_number: string;
  estimated_delivery_date: string;
}

interface OrderItem {
  id: number;
  product_name: string;
  product_brand: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_color: string;
  selected_size: string;
  product_image: string;
  item_status: string;
}

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({});

  useEffect(() => {
    const checkAuthAndLoadOrders = async () => {
      try {
        // Check authentication
        const { data: userInfo, error: authError } = await backend.auth.getUserInfo();
        if (authError || !userInfo) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(userInfo);

        // Get member info
        const { data: member, error: memberError } = await backend.members.getByUserId(userInfo.ID);

        if (memberError || !member) {
          toast.error('Member profile not found');
          setLoading(false);
          return;
        }
        setMemberInfo(member);

        // Load orders
        const { data: ordersData, error: ordersError } = await backend.orders.list(member.id);
        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadOrders();
  }, []);

  const loadOrderItems = async (orderId: number) => {
    if (orderItems[orderId]) return; // Already loaded

    try {
      const { data, error } = await backend.orders.items(orderId);
      if (error) throw error;
      setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }));
    } catch (error) {
      console.error('Error loading order items:', error);
      toast.error('Failed to load order details');
    }
  };

  const toggleOrderExpansion = async (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      await loadOrderItems(orderId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading order history...</span>
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
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
                  <p className="text-gray-600 mb-4">Please log in to view your order history.</p>
                  <Button onClick={() => window.location.href = '/members/memberlogin'}>
                    Login
                  </Button>
                </CardContent>
              </Card>
            </div>
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
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <ShoppingBag className="h-6 w-6 mr-2" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ?
                <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                    <Button onClick={() => window.location.href = '/'}>
                      Start Shopping
                    </Button>
                  </div> :

                <div className="space-y-4">
                    {orders.map((order) =>
                  <Card key={order.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    Order #{order.order_number}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Placed on {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Badge className={getStatusColor(order.order_status)}>
                                    {getStatusIcon(order.order_status)}
                                    <span className="ml-1">{order.order_status}</span>
                                  </Badge>
                                  
                                  <Badge className={getStatusColor(order.payment_status)}>
                                    {order.payment_status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-xl font-bold">
                                ${order.total_amount.toFixed(2)}
                              </p>
                              <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="mt-2">

                                <Eye className="h-4 w-4 mr-1" />
                                {expandedOrder === order.id ? 'Hide' : 'View'} Details
                              </Button>
                            </div>
                          </div>
                          
                          {/* Order Details */}
                          {expandedOrder === order.id &&
                      <div className="mt-4 pt-4 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-gray-600">Shipping Method</p>
                                  <p className="font-medium capitalize">{order.shipping_method}</p>
                                </div>
                                
                                {order.tracking_number &&
                          <div>
                                    <p className="text-sm text-gray-600">Tracking Number</p>
                                    <p className="font-medium">{order.tracking_number}</p>
                                  </div>
                          }
                                
                                {order.estimated_delivery_date &&
                          <div>
                                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                                    <p className="font-medium">
                                      {new Date(order.estimated_delivery_date).toLocaleDateString()}
                                    </p>
                                  </div>
                          }
                              </div>
                              
                              {/* Order Items */}
                              {orderItems[order.id] &&
                        <div>
                                  <h4 className="font-semibold mb-3">Order Items</h4>
                                  <div className="space-y-3">
                                    {orderItems[order.id].map((item) =>
                            <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded">
                                        <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                                          {item.product_image &&
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder/48/48';
                                  }} />

                                }
                                        </div>
                                        
                                        <div className="flex-1">
                                          <h5 className="font-medium">{item.product_name}</h5>
                                          {item.product_brand &&
                                <p className="text-sm text-gray-600">{item.product_brand}</p>
                                }
                                          {(item.selected_color || item.selected_size) &&
                                <p className="text-xs text-gray-500">
                                              {item.selected_color && `Color: ${item.selected_color}`}
                                              {item.selected_color && item.selected_size && ' • '}
                                              {item.selected_size && `Size: ${item.selected_size}`}
                                            </p>
                                }
                                        </div>
                                        
                                        <div className="text-right">
                                          <p className="font-medium">Qty: {item.quantity}</p>
                                          <p className="text-sm text-gray-600">
                                            ${item.unit_price.toFixed(2)} each
                                          </p>
                                          <p className="font-semibold">
                                            ${item.total_price.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                            )}
                                  </div>
                                </div>
                        }
                            </div>
                      }
                        </CardContent>
                      </Card>
                  )}
                  </div>
                }
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <ContactSidebar />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>);

};

export default OrderHistoryPage;
