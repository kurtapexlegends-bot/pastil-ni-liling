import { Product } from "../../app/admin/types";
import Modal from "../ui/Modal";

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productForm.id ? "Edit Catalog Item" : "Create Central Product"}
    >
      <form onSubmit={saveProduct} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Product Name</label>
          <input 
            type="text" 
            value={productForm.name}
            onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="e.g., Liling's Classic Garlic Chili Oil"
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Category</label>
            <select 
              value={productForm.category}
              onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            >
              <option value="pastil">Pastil</option>
              <option value="bagoong">Bagoong</option>
              <option value="chili_oil">Chili Oil</option>
              <option value="wholesale_bulk">Wholesale Bulk</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Central Stock</label>
            <input 
              type="number" 
              value={productForm.stock}
              onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              required
              min="0"
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Retail Price (₱)</label>
            <input 
              type="number" 
              step="0.01"
              value={productForm.price}
              onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              required
              min="0"
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Wholesale Price (₱)</label>
            <input 
              type="number" 
              step="0.01"
              value={productForm.wholesale_price || 0}
              onChange={(e) => setProductForm(prev => ({ ...prev, wholesale_price: parseFloat(e.target.value) || 0 }))}
              disabled={!productForm.is_wholesale}
              min="0"
              className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-6 items-center py-1 select-none">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-brand-earth/60 cursor-pointer">
            <input 
              type="checkbox" 
              checked={productForm.is_wholesale}
              onChange={(e) => setProductForm(prev => ({ ...prev, is_wholesale: e.target.checked }))}
              className="rounded border-gray-300 text-brand-green focus:ring-brand-green w-4 h-4"
            />
            Wholesale Enabled
          </label>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-brand-earth/60 cursor-pointer">
            <input 
              type="checkbox" 
              checked={productForm.is_active}
              onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-brand-green focus:ring-brand-green w-4 h-4"
            />
            Active / Published
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Product Description</label>
          <textarea 
            value={productForm.description}
            onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
            rows={2.5}
            placeholder="e.g., Preservative-free chicken flakes stored in premium coconut oil."
            className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-3">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 border border-gray-100 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[9px] py-2.5 rounded-xl transition-all shadow-xl shadow-brand-earth/10"
          >
            Save Product
          </button>
        </div>
      </form>
    </Modal>
  );
}
