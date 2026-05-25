import { useState } from "react";
import Image from "next/image";
import { Product } from "../../app/admin/types";
import { Package, Plus } from "@phosphor-icons/react";
import ProductModal from "./ProductModal";
import { useConfirm } from "../../hooks/useConfirm";
import { toast } from "sonner";

interface ProductCatalogProps {
  products: Product[];
  saveProduct: (p: Product) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

export default function ProductCatalog({ products, saveProduct, deleteProduct }: ProductCatalogProps) {
  const { confirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<Product>({
    id: null,
    name: "",
    description: "",
    price: 0,
    wholesale_price: 0,
    stock: 0,
    category: "pastil",
    is_wholesale: false,
    is_active: true
  });

  const handleAddProduct = () => {
    setProductForm({
      id: null,
      name: "",
      description: "",
      price: 0,
      wholesale_price: 0,
      stock: 0,
      category: "pastil",
      is_wholesale: false,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      wholesale_price: product.wholesale_price || 0,
      stock: product.stock,
      category: product.category,
      is_wholesale: !!product.is_wholesale,
      is_active: !!product.is_active
    });
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    const success = await saveProduct(productForm);
    setIsSaving(false);
    if (success) {
      setIsModalOpen(false);
      toast.success(productForm.id ? "Product updated successfully" : "Product added successfully");
    } else {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      isDestructive: true
    });
    
    if (isConfirmed) {
      const success = await deleteProduct(id);
      if (success) {
        toast.success("Product deleted successfully");
      } else {
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 bg-brand-earth hover:bg-brand-green text-white px-4 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all shadow-sm shrink-0 active:scale-[0.98]"
        >
          <Plus size={14} weight="bold" />
          Add Product
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Product details</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Category</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Retail price</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Wholesale price</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Stock qty</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Status</th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/40 border-b border-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <Package size={48} weight="duotone" className="text-brand-earth" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-earth">
                        No products created
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                      {product.image_url ? (
                        <img 
                          src={product.image_url.startsWith('http://localhost/storage') 
                            ? product.image_url.replace('http://localhost/storage', 'http://127.0.0.1:8000/storage')
                            : product.image_url.startsWith('/') 
                              ? `http://127.0.0.1:8000${product.image_url}` 
                              : product.image_url
                          } 
                          alt={product.name} 
                          className="w-9 h-9 rounded-lg object-cover" 
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-brand-earth/40 uppercase">Jar</div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-brand-earth">{product.name}</p>
                        <p className="text-[9px] text-brand-earth/40">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs text-brand-earth/60 font-medium capitalize">
                      {product.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs font-semibold text-brand-earth">
                      ₱{Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs">
                      {product.is_wholesale ? (
                        <span className="font-semibold text-brand-green">₱{Number(product.wholesale_price || 0).toFixed(2)}</span>
                      ) : (
                        <span className="text-[9px] text-brand-earth/30">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-xs text-brand-earth/60 font-medium">
                      {product.stock} units
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-semibold uppercase tracking-wider ${
                        product.is_active ? 'bg-green-50 text-green-700 border border-green-100/50' : 'bg-red-50 text-red-700 border border-red-100/50'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="border border-gray-100 hover:bg-gray-50 text-brand-earth px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id!)}
                          className="border border-red-100 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productForm={productForm}
        setProductForm={setProductForm}
        saveProduct={handleSave}
      />
    </div>
  );
}