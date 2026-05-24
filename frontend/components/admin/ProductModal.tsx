import { useState } from "react";
import { Product } from "../../app/admin/types";
import Modal from "../ui/Modal";
import { Image as ImageIcon, CircleNotch } from "@phosphor-icons/react";
import { useValidation, constraints, ValidationSchema } from "../../hooks/useValidation";

const productSchema: ValidationSchema<Product> = {
  name: [
    constraints.required('Product Name is required.'),
    constraints.minLength(3, 'Name must be at least 3 characters.')
  ],
  price: [
    constraints.required('Retail Price is required.'),
    constraints.minNum(0.01, 'Price must be greater than 0.')
  ],
  stock: [
    constraints.required('Stock is required.'),
    constraints.minNum(0, 'Stock cannot be negative.')
  ]
};

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
  const [isUploading, setIsUploading] = useState(false);
  const { errors, validateField, validateAll, clearErrors } = useValidation(productSchema);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll(productForm)) return;
    saveProduct(e);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/products/upload-image", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setProductForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.message || "Failed to upload image.");
      }
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        clearErrors();
        onClose();
      }}
      title={productForm.id ? "Edit Catalog Item" : "Create Central Product"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Product Name</label>
          <input 
            type="text" 
            value={productForm.name}
            onChange={(e) => {
              const val = e.target.value;
              setProductForm(prev => ({ ...prev, name: val }));
              validateField("name", val, { ...productForm, name: val });
            }}
            placeholder="e.g., Liling's Classic Garlic Chili Oil"
            className={`w-full border rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:outline-none transition-all shadow-sm ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200/50' : 'border-gray-100 focus:border-brand-earth/30'}`}
          />
          {errors.name && <p className="text-[9px] font-bold text-red-500 mt-1 ml-1">{errors.name}</p>}
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
              onChange={(e) => {
                let rawValue = e.target.value;
                // If it was exactly '0' and they typed '1', it might come through as '01'.
                // If they try to type a number when it's exactly 0, strip the leading 0
                if (productForm.stock === 0 && rawValue.startsWith('0') && rawValue.length > 1) {
                  rawValue = rawValue.substring(1);
                }
                const val = rawValue === '' ? ('' as any) : parseInt(rawValue);
                setProductForm(prev => ({ ...prev, stock: val }));
                validateField("stock", val, { ...productForm, stock: val });
              }}
              onFocus={(e) => {
                // Instantly clear if they click into it and it's exactly 0
                if (productForm.stock === 0) {
                  setProductForm(prev => ({ ...prev, stock: '' as any }));
                }
              }}
              onBlur={(e) => {
                 // Snap back to 0 if they click out and left it blank
                 if (productForm.stock as any === '') {
                   setProductForm(prev => ({ ...prev, stock: 0 }));
                   validateField("stock", 0, { ...productForm, stock: 0 });
                 }
              }}
              min="0"
              className={`w-full border rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:outline-none transition-all shadow-sm ${errors.stock ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200/50' : 'border-gray-100 focus:border-brand-earth/30'}`}
            />
            {errors.stock && <p className="text-[9px] font-bold text-red-500 mt-1 ml-1">{errors.stock}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Retail Price (₱)</label>
            <input 
              type="number" 
              step="0.01"
              value={productForm.price}
              onChange={(e) => {
                const val = e.target.value === '' ? ('' as any) : parseFloat(e.target.value);
                setProductForm(prev => ({ ...prev, price: val }));
                validateField("price", val, { ...productForm, price: val });
              }}
              min="0"
              className={`w-full border rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:outline-none transition-all shadow-sm ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200/50' : 'border-gray-100 focus:border-brand-earth/30'}`}
            />
            {errors.price && <p className="text-[9px] font-bold text-red-500 mt-1 ml-1">{errors.price}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Wholesale Price (₱)</label>
            <input 
              type="number" 
              step="0.01"
              value={productForm.wholesale_price}
              onChange={(e) => setProductForm(prev => ({ ...prev, wholesale_price: e.target.value === '' ? ('' as any) : parseFloat(e.target.value) }))}
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

        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">Product Image</label>
          <div className="flex items-center gap-4">
            {productForm.image_url ? (
              <div className="relative w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setProductForm(prev => ({ ...prev, image_url: '' }))}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                <ImageIcon size={20} className="text-brand-earth/30" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
                id="product-image-upload"
              />
              <label
                htmlFor="product-image-upload"
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50 text-brand-earth/70 hover:text-brand-earth'
                }`}
              >
                {isUploading ? (
                  <>
                    <CircleNotch size={14} className="animate-spin text-brand-green" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Upload Image
                  </>
                )}
              </label>
              <p className="text-[8px] font-medium text-brand-earth/40 uppercase tracking-widest mt-1.5 ml-1">
                Max 5MB (JPG, PNG, WEBP)
              </p>
            </div>
          </div>
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