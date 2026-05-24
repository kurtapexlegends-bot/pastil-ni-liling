import useSWR from "swr";

const fetcher = (url: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");
  return fetch(url, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json());
};

export function useAdminHubs(hasToken: boolean, isActive: boolean) {
  const { data: hubsRes, mutate: mutateHubs } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/hubs" : null,
    fetcher
  );
  
  const { data: franRes, mutate: mutateFranchisees } = useSWR(
    hasToken && isActive ? "http://127.0.0.1:8000/api/admin/franchisees" : null,
    fetcher
  );

  const hubs = hubsRes?.data || [];
  const franchisees = franRes?.data || [];

  const saveHub = async (hubForm: any) => {
    const token = localStorage.getItem("token");
    const isEdit = hubForm.id !== null;
    const url = isEdit 
      ? `http://127.0.0.1:8000/api/admin/hubs/${hubForm.id}`
      : "http://127.0.0.1:8000/api/admin/hubs";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...hubForm,
        franchisee_id: parseInt(hubForm.franchisee_id.toString())
      })
    });

    if (res.ok) {
      mutateHubs();
      return true;
    }
    return false;
  };

  const deleteHub = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/api/admin/hubs/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
        mutateHubs();
        return true;
    }
    return false;
  };

  const isLoading = (!hubsRes || !franRes) && hasToken && isActive;

  return { hubs, franchisees, mutateHubs, mutateFranchisees, saveHub, deleteHub, isLoading };
}
