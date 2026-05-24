import useSWR from "swr";

const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");
  return fetch(url, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
};

export function useAdminProducts(hasToken: boolean, isActive: boolean) {
  const { data: prodsRes, mutate: mutateProducts } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/products" : null,
    fetcher
  );
  
  const products = prodsRes?.data || [];

  const saveProduct = async (productForm: any) => {
    const token = localStorage.getItem("token");
    const isEdit = productForm.id !== null;
    const url = isEdit 
      ? `http://127.0.0.1:8000/api/admin/products/${productForm.id}`
      : "http://127.0.0.1:8000/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...productForm,
        price: parseFloat(productForm.price.toString()),
        wholesale_price: productForm.is_wholesale ? parseFloat(productForm.wholesale_price.toString()) : null,
        stock: parseInt(productForm.stock.toString()),
      })
    });

    if (res.ok) {
      mutateProducts();
      return true;
    }
    return false;
  };

  const deleteProduct = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
        mutateProducts();
        return true;
    }
    return false;
  };

  return { products, mutateProducts, saveProduct, deleteProduct, isLoading: !prodsRes && hasToken && isActive };
}
