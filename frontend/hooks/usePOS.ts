import { useState, useEffect } from "react";

export function usePOS(hubInventory: any[], mutateInventory: any, customAlert: (msg: string, type?: 'info'|'success'|'error') => void) {
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState<string>("cash");
  const [posChannel, setPosChannel] = useState<string>("walk_in");
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPOSCheckingOut, setIsPOSCheckingOut] = useState(false);

  const triggerQueueSyncDirectly = async (token: string) => {
    const queue = localStorage.getItem("pos_offline_queue");
    if (!queue) return;

    const parsedQueue = JSON.parse(queue);
    if (parsedQueue.length === 0) return;

    // Isolate viable orders vs dead-letter anomalies
    const viableOrders = parsedQueue.filter((o: any) => (o.sync_retries || 0) < 3);
    const deadOrders = parsedQueue.filter((o: any) => (o.sync_retries || 0) >= 3);

    if (viableOrders.length === 0) {
      if (deadOrders.length > 0) {
        setOfflineQueue(deadOrders); // Ensure UI shows the blocked anomalies
      }
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/pos/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orders: viableOrders })
      });

      const data = await res.json();
      if (data.success) {
        // Success: Clear viable orders, but retain dead orders for manual review
        if (deadOrders.length > 0) {
          localStorage.setItem("pos_offline_queue", JSON.stringify(deadOrders));
          setOfflineQueue(deadOrders);
        } else {
          localStorage.removeItem("pos_offline_queue");
          setOfflineQueue([]);
        }
        
        // Refresh local inventory levels using SWR
        mutateInventory();
      } else {
        // Backend failure (e.g. 500 error): Increment retry counters safely
        const updatedQueue = parsedQueue.map((o: any) => {
          if ((o.sync_retries || 0) < 3) return { ...o, sync_retries: (o.sync_retries || 0) + 1 };
          return o;
        });
        localStorage.setItem("pos_offline_queue", JSON.stringify(updatedQueue));
        setOfflineQueue(updatedQueue);
      }
    } catch (err) {
      console.warn("Failed to automatic sync queue", err);
      // Network failure: Increment retry counters safely
      const updatedQueue = parsedQueue.map((o: any) => {
        if ((o.sync_retries || 0) < 3) return { ...o, sync_retries: (o.sync_retries || 0) + 1 };
        return o;
      });
      localStorage.setItem("pos_offline_queue", JSON.stringify(updatedQueue));
      setOfflineQueue(updatedQueue);
    }
  };

  const handleManualSync = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsSyncing(true);
    await triggerQueueSyncDirectly(token);
    setIsSyncing(false);
    customAlert("Offline queue sync check completed.", "success");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Initial load for Offline POS Queue
    const savedQueue = localStorage.getItem("pos_offline_queue");
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (token) triggerQueueSyncDirectly(token);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine && token) {
      triggerQueueSyncDirectly(token);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []); // Run once on mount

  const handleAddToPOSCart = (prod: any) => {
    setPosCart(prev => {
      const existing = prev.find(item => item.id === prod.product_id);
      if (existing) {
        if (existing.quantity >= prod.stock_quantity) {
          customAlert(`Cannot exceed available branch stock of ${prod.stock_quantity} units.`, "error");
          return prev;
        }
        return prev.map(item =>
          item.id === prod.product_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: prod.product.id, name: prod.product.name, price: prod.product.price, quantity: 1, maxStock: prod.stock_quantity, flavor_modifier: "Original" }];
    });
  };

  const updatePOSCartQuantity = (id: number, delta: number) => {
    setPosCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.maxStock) {
          customAlert(`Cannot exceed available branch stock of ${item.maxStock} units.`, "error");
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const updatePOSCartFlavor = (id: number, flavor: string) => {
    setPosCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, flavor_modifier: flavor };
      }
      return item;
    }));
  };

  const removeFromPOSCart = (id: number) => {
    setPosCart(prev => prev.filter(item => item.id !== id));
  };

  const handlePOSCheckout = async () => {
    if (posCart.length === 0) return;
    const offlineId = "pos-offline-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const totalAmount = posCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const newPOSOrder = {
      offline_id: offlineId,
      total_amount: totalAmount,
      payment_method: posPaymentMethod,
      channel: posChannel,
      sync_retries: 0,
      items: posCart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        flavor_modifier: item.flavor_modifier || "Original"
      }))
    };

    // Snapshot inventory state BEFORE optimistic UI deduction
    const backupInventory = [...hubInventory];

    mutateInventory((current: any) => {
      if (!current || !current.data) return current;
      return {
        ...current,
        data: current.data.map((invItem: any) => {
          const cartMatch = posCart.find((c: any) => c.id === invItem.product_id);
          if (cartMatch) {
            return {
              ...invItem,
              stock_quantity: Math.max(0, invItem.stock_quantity - cartMatch.quantity)
            };
          }
          return invItem;
        })
      };
    }, { revalidate: false });

    const updatedQueue = [...offlineQueue, newPOSOrder];
    setOfflineQueue(updatedQueue);
    localStorage.setItem("pos_offline_queue", JSON.stringify(updatedQueue));
    setPosCart([]);

    if (navigator.onLine) {
      setIsPOSCheckingOut(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setIsPOSCheckingOut(false);
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/pos/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ orders: [newPOSOrder] })
        });

        const data = await res.json();
        if (data.success) {
          const clearedQueue = updatedQueue.filter(o => o.offline_id !== offlineId);
          setOfflineQueue(clearedQueue);
          localStorage.setItem("pos_offline_queue", JSON.stringify(clearedQueue));
          
          mutateInventory();
        } else {
          // Sync Failed: Perform Atomic Rollback of optimistic inventory deduction
          mutateInventory((current: any) => {
            if (!current) return current;
            return { ...current, data: backupInventory };
          }, { revalidate: false });
          
          // Increment retry counter for this ghost order
          const retriedQueue = updatedQueue.map(o => o.offline_id === offlineId ? { ...o, sync_retries: (o.sync_retries || 0) + 1 } : o);
          setOfflineQueue(retriedQueue);
          localStorage.setItem("pos_offline_queue", JSON.stringify(retriedQueue));
          
          customAlert("Failed to place order: " + (data.message || "Unknown error"), "error");
        }
      } catch (err) {
        console.warn("Stall offline, order saved locally.", err);
        // Network Crash: Perform Atomic Rollback of optimistic inventory deduction
        mutateInventory((current: any) => {
          if (!current) return current;
          return { ...current, data: backupInventory };
        }, { revalidate: false });
        
        // Increment retry counter for this ghost order
        const retriedQueue = updatedQueue.map(o => o.offline_id === offlineId ? { ...o, sync_retries: (o.sync_retries || 0) + 1 } : o);
        setOfflineQueue(retriedQueue);
        localStorage.setItem("pos_offline_queue", JSON.stringify(retriedQueue));
        
        customAlert("Network unstable. POS order saved locally and inventory locked.", "error");
      } finally {
        setIsPOSCheckingOut(false);
      }
    } else {
      customAlert("Offline Mode: Order saved locally. It will automatically sync once online!", "info");
    }
  };

  return {
    posCart,
    offlineQueue,
    isOnline,
    isSyncing,
    isPOSCheckingOut,
    posPaymentMethod,
    setPosPaymentMethod,
    posChannel,
    setPosChannel,
    handleManualSync,
    handleAddToPOSCart,
    updatePOSCartQuantity,
    updatePOSCartFlavor,
    removeFromPOSCart,
    handlePOSCheckout
  };
}
