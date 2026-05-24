import useSWR from "swr";

const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");
  return fetch(url, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
};

export function useAdminOrders(hasToken: boolean, isActive: boolean) {
  const { data: appsRes, mutate: mutateApps } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/applications" : null,
    fetcher
  );
  
  const { data: ordersRes, mutate: mutateOrders } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/orders" : null,
    fetcher
  );

  const { data: b2bOrdersRes, mutate: mutateB2bOrders } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/commissary-orders" : null,
    fetcher
  );

  const applications = appsRes?.data || [];
  const orders = ordersRes?.data || [];
  const b2bOrders = b2bOrdersRes?.data || [];

  const updateOrderStatus = async (id: number, status: string, isB2B: boolean = false) => {
    const token = localStorage.getItem("token");
    const endpoint = isB2B 
      ? `http://127.0.0.1:8000/api/admin/commissary-orders/${id}`
      : `http://127.0.0.1:8000/api/admin/orders/${id}`;

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (isB2B) {
        mutateB2bOrders();
      } else {
        mutateOrders();
      }
      return { success: true };
    }
    
    // Force UI to revert back to true server state
    if (isB2B) {
      mutateB2bOrders();
    } else {
      mutateOrders();
    }
    return { success: false, message: data.message || "Invalid state transition." };
  };

  const updateAppStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      mutateApps();
      return true;
    }
    return false;
  };

  const isLoading = (!appsRes || !ordersRes || !b2bOrdersRes) && hasToken && isActive;

  return { applications, orders, b2bOrders, updateOrderStatus, updateAppStatus, isLoading };
}
