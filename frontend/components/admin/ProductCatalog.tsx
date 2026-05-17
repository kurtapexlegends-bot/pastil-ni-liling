import Image from "next/image";
import { Product } from "../../app/admin/types";

interface ProductCatalogProps {
  products: Product[];
  setProductForm: (p: Product) => void;
  setIsProductModalOpen: (open: boolean) => void;
  deleteProduct: (id: number) => Promise<void>;
}

export default function ProductCatalog({ products, setProductForm, setIsProductModalOpen, deleteProduct }: ProductCatalogProps) {
  return (
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
                <td colSpan={7} className="px-6 py-12 text-center text-xs text-brand-earth/40 font-normal">
                  No products created in the central catalog.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} width={36} height={36} className="rounded-lg object-cover" />
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
                        onClick={() => {
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
                          setIsProductModalOpen(true);
                        }}
                        className="border border-gray-100 hover:bg-gray-50 text-brand-earth px-2.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id!)}
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
  );
}
