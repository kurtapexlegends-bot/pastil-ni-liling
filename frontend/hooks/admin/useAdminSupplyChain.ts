import useSWR from "swr";

const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");
  return fetch(url, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
};

export function useAdminSupplyChain(hasToken: boolean, isActive: boolean) {
  const { data: ingRes, mutate: mutateIngredients } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/inventory/ingredients" : null,
    fetcher
  );
  
  const { data: batRes, mutate: mutateBatches } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/inventory/batches" : null,
    fetcher
  );
  
  const { data: recRes, mutate: mutateRecipes } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/inventory/recipes" : null,
    fetcher
  );

  const ingredients = ingRes?.data || [];
  const batches = batRes?.data || [];
  const recipes = recRes?.data || [];

  const addIngredient = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to create ingredient.");
    }
  };

  const restockIngredient = async (id: number, qty: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/inventory/ingredients/${id}/restock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ quantity: qty })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to restock ingredient.");
    }
  };

  const addBatch = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to register production batch.");
    }
  };

  const addRecipe = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to configure recipe formulation.");
    }
  };

  const triggerMarkdown = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/api/admin/inventory/batches/markdown", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to trigger markdown scan.");
    }
  };

  const isLoading = (!ingRes || !batRes || !recRes) && hasToken && isActive;

  return {
    ingredients,
    batches,
    recipes,
    mutateIngredients,
    mutateBatches,
    mutateRecipes,
    addIngredient,
    restockIngredient,
    addBatch,
    addRecipe,
    triggerMarkdown,
    isLoading
  };
}
