import { useState } from "react";
import { Product, CartItem } from "@/types";

export function useWholesaleCart(customAlert: (msg: string, type?: 'info'|'success'|'error') => void) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async (hub: any, user: any, mutateOrders: () => void, mutateInventory: () => void) => {
    if (cartItems.length === 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsCheckingOut(true);

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await fetch("http://127.0.0.1:8000/api/franchise/commissary-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          shipping_address: hub?.address || "Franchise Branch Address",
          contact_number: user?.contact_number || "09171234567",
          payment_method: "cod",
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        customAlert("Commissary restock order placed successfully!", "success");
        setCartItems([]);
        setIsCartOpen(false);
        
        mutateOrders();
        mutateInventory();
      } else {
        customAlert("Failed to place restock order: " + (data.message || "Unknown error"), "error");
      }
    } catch (err) {
      console.error(err);
      customAlert("Error placing restock order.", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    isCheckingOut,
    handleAddToCart,
    updateQuantity,
    removeFromCart,
    handleCheckout
  };
}
