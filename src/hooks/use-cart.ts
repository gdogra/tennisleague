import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import backend from '@/lib/backend';

interface CartItem {
  id: number;
  member_id: number;
  product_id: number;
  quantity: number;
  selected_color: string;
  selected_size: string;
  unit_price: number;
  total_price: number;
  added_at: string;
  updated_at: string;
  // Product details (joined from products table)
  product_name?: string;
  product_brand?: string;
  product_image?: string;
  is_active?: boolean;
  stock_quantity?: number;
}

interface User {
  ID: number;
  Name: string;
  Email: string;
  CreateTime: string;
  Roles: string;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [memberInfo, setMemberInfo] = useState<any>(null);

  // Check authentication and get user info
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: userInfo, error } = await backend.auth.getUserInfo();
        if (error || !userInfo) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(userInfo);

        // Get member info
        const { data: memberData } = await backend.members.getByUserId(userInfo.ID);
        if (memberData) setMemberInfo(memberData);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load cart items
  useEffect(() => {
    if (user && memberInfo) {
      loadCartItems();
    }
  }, [user, memberInfo]);

  const loadCartItems = async () => {
    if (!memberInfo) return;

    try {
      setLoading(true);
      const { data, error } = await backend.cart.list(memberInfo.id);

      if (error) {
        throw error;
      }

      // Load product details for each cart item
      const cartItemsWithProducts = await Promise.all(
        (data || []).map(async (item: CartItem) => {
          try {
            const { data: product, error: productError } = await backend.products.getById(item.product_id);
            if (!productError && product) {
              return {
                ...item,
                product_name: product.name,
                product_brand: product.brand,
                product_image: product.main_image,
                is_active: product.is_active,
                stock_quantity: product.stock_quantity
              };
            }

            return item;
          } catch (err) {
            console.error('Error loading product details:', err);
            return item;
          }
        })
      );

      setCartItems(cartItemsWithProducts);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number, color?: string, size?: string) => {
    if (!user || !memberInfo) {
      toast.error('Please login to add items to cart');
      return false;
    }

    try {
      // Get product details
      const { data: product, error: productError } = await backend.products.getById(productId);
      if (productError || !product) {
        throw new Error('Product not found');
      }
      const unitPrice = product.is_on_sale ? product.sale_price : product.price;

      // Check if item already exists in cart
      const existingItem = cartItems.find((item) =>
      item.product_id === productId &&
      item.selected_color === (color || '') &&
      item.selected_size === (size || '')
      );

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;
        const { error } = await backend.cart.update(memberInfo.id, existingItem.id, {
          quantity: newQuantity,
          total_price: newQuantity * unitPrice,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await backend.cart.create(memberInfo.id, {
          product_id: productId,
          quantity,
          selected_color: color || '',
          selected_size: size || '',
          unit_price: unitPrice,
          total_price: quantity * unitPrice,
          added_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
      }

      await loadCartItems();
      toast.success('Item added to cart');
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      const cartItem = cartItems.find((item) => item.id === cartItemId);
      if (!cartItem) return;

      const { error } = await backend.cart.update(memberInfo!.id, cartItemId, {
        quantity,
        total_price: quantity * cartItem.unit_price,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      await loadCartItems();
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      const { error } = await backend.cart.delete(memberInfo!.id, cartItemId);
      if (error) throw error;

      await loadCartItems();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!memberInfo) return;

    try {
      // Delete all cart items for this member
      await backend.cart.clear(memberInfo.id);
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    loading,
    user,
    memberInfo,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCartItems,
    getCartTotal,
    getCartItemCount
  };
};
