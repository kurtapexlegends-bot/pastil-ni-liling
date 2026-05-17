import { Product } from "../../app/admin/types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productForm: Product;
  setProductForm: React.Dispatch<React.SetStateAction<Product>>;
  saveProduct: (e: React.FormEvent) => Promise<void>;
}

export default function ProductModal({
  isOpen,
  onClose,
  productForm,
  setProductForm,
  saveProduct
}: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-earth/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-100 max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-earth">
            {productForm.id ? "Edit Catalog Item" : "Create Central Product"}
          </h3>
          <button 
            onClick={onClose}
            className="text-brand-earth/40 hover:text-brand-earth text-lg font-bold"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={saveProduct} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Product Name</label>
            <input 
              type="text" 
              value={productForm.name}
              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="e.g., Liling's Classic Garlic Chili Oil"
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Category</label>
              <select 
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-brand-green text-brand-earth"
              >
                <option value="pastil">Pastil</option>
                <option value="bagoong">Bagoong</option>
                <option value="chili_oil">Chili Oil</option>
                <option value="wholesale_bulk">Wholesale Bulk</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Central Stock</label>
              <input 
                type="number" 
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                required
                min="0"
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Retail Price (₱)</label>
              <input 
                type="number" 
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
                min="0"
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green text-brand-earth"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Wholesale Price (₱)</label>
              <input 
                type="number" 
                step="0.01"
                value={productForm.wholesale_price || 0}
                onChange={(e) => setProductForm(prev => ({ ...prev, wholesale_price: parseFloat(e.target.value) || 0 }))}
                disabled={!productForm.is_wholesale}
                min="0"
                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green text-brand-earth disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-4 items-center py-1">
            <label className="flex items-center gap-2 text-xs font-medium text-brand-earth/60 select-none cursor-pointer">
              <input 
                type="checkbox" 
                checked={productForm.is_wholesale}
                onChange={(e) => setProductForm(prev => ({ ...prev, is_wholesale: e.target.checked }))}
                className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
              />
              Available for Wholesale
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-brand-earth/60 select-none cursor-pointer">
              <input 
                type="checkbox" 
                checked={productForm.is_active}
                onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
              />
              Active/Published
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Product Description</label>
            <textarea 
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="e.g., Preservative-free chicken flakes stored in premium coconut oil."
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-brand-green resize-none text-brand-earth"
            />
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="border border-gray-100 px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors text-brand-earth"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-brand-earth hover:bg-brand-green text-white px-4 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
