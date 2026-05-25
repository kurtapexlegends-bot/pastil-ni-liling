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
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left Column: Product Specifications */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">{"Product Name"}</label>
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
                <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">{"Category"}</label>
                <select 
                  value={productForm.category}
                  onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-bold text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="pastil">{"Pastil"}</option>
                  <option value="bagoong">{"Bagoong"}</option>
                  <option value="chili_oil">{"Chili Oil"}</option>
                  <option value="wholesale_bulk">{"Wholesale Bulk"}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">{"Central Stock"}</label>
                <input 
                  type="number" 
                  value={productForm.stock}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    let rawValue = e.target.value;
                    if (productForm.stock === 0 && rawValue.startsWith('0') && rawValue.length > 1) {
                      rawValue = rawValue.substring(1);
                    }
                    const val = rawValue === '' ? ('' as any) : parseInt(rawValue);
                    setProductForm(prev => ({ ...prev, stock: val }));
                    validateField("stock", val, { ...productForm, stock: val });
                  }}
                  onFocus={(e) => {
                    if (productForm.stock === 0) {
                      setProductForm(prev => ({ ...prev, stock: '' as any }));
                    }
                  }}
                  onBlur={(e) => {
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

            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">{"Product Description"}</label>
              <textarea 
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4.5}
                placeholder="e.g., Preservative-free chicken flakes stored in premium coconut oil."
                className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          {/* Right Column: Pricing, Status & Image Uploads */}
          <div className="space-y-4">
            {/* Pricing Ledger Panel */}
            <div className="bg-[#fafafa] border border-gray-100 rounded-2xl p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">{"Retail Price (₱)"}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={productForm.price}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let rawValue = e.target.value;
                      if (productForm.price === 0 && rawValue.startsWith('0') && rawValue.length > 1) {
                        rawValue = rawValue.substring(1);
                      }
                      const val = rawValue === '' ? ('' as any) : parseFloat(rawValue);
                      setProductForm(prev => ({ ...prev, price: val }));
                      validateField("price", val, { ...productForm, price: val });
                    }}
                    onFocus={(e) => {
                      if (productForm.price === 0) {
                        setProductForm(prev => ({ ...prev, price: '' as any }));
                      }
                    }}
                    onBlur={(e) => {
                       if (productForm.price as any === '') {
                         setProductForm(prev => ({ ...prev, price: 0 }));
                         validateField("price", 0, { ...productForm, price: 0 });
                       }
                    }}
                    min="0"
                    className={`w-full border rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:outline-none transition-all shadow-sm ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200/50' : 'border-gray-100 focus:border-brand-earth/30'}`}
                  />
                  {errors.price && <p className="text-[9px] font-bold text-red-500 mt-1 ml-1">{errors.price}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={`text-[8px] font-black uppercase tracking-widest transition-colors duration-200 ${productForm.is_wholesale ? 'text-brand-earth/40' : 'text-brand-earth/20'}`}>{"Wholesale Price (₱)"}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={productForm.wholesale_price}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let rawValue = e.target.value;
                      if (productForm.wholesale_price === 0 && rawValue.startsWith('0') && rawValue.length > 1) {
                        rawValue = rawValue.substring(1);
                      }
                      const val = rawValue === '' ? ('' as any) : parseFloat(rawValue);
                      setProductForm(prev => ({ ...prev, wholesale_price: val }));
                    }}
                    onFocus={(e) => {
                      if (productForm.wholesale_price === 0) {
                        setProductForm(prev => ({ ...prev, wholesale_price: '' as any }));
                      }
                    }}
                    onBlur={(e) => {
                       if (productForm.wholesale_price as any === '') {
                         setProductForm(prev => ({ ...prev, wholesale_price: 0 }));
                       }
                    }}
                    disabled={!productForm.is_wholesale}
                    min="0"
                    className="w-full border border-gray-100 rounded-2xl px-4 py-3 text-[10px] font-medium text-brand-earth bg-white focus:border-brand-earth/30 outline-none transition-all shadow-sm disabled:bg-gray-50/50 disabled:text-gray-300"
                  />
                </div>
              </div>

              {/* Status Toggles Panel */}
              <div className="flex gap-4 items-center pt-3 border-t border-gray-200/50 select-none">
                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-earth/60 hover:text-brand-earth transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_wholesale}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_wholesale: e.target.checked }))}
                    className="rounded border-gray-300 text-brand-green focus:ring-brand-green w-4 h-4 cursor-pointer"
                  />
                  {"Wholesale"}
                </label>

                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-earth/60 hover:text-brand-earth transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-brand-green focus:ring-brand-green w-4 h-4 cursor-pointer"
                  />
                  {"Published"}
                </label>
              </div>
            </div>

            {/* Media Dropzone Wrapper */}
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest text-brand-earth/40">{"Product Image"}</label>
              <div className="border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl p-4 flex items-center gap-4">
                {productForm.image_url ? (
                  <div className="relative w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0 group bg-white shadow-sm">
                    <img 
                      src={productForm.image_url.startsWith('http://localhost/storage') 
                        ? productForm.image_url.replace('http://localhost/storage', 'http://127.0.0.1:8000/storage')
                        : productForm.image_url.startsWith('/') 
                          ? `http://127.0.0.1:8000${productForm.image_url}` 
                          : productForm.image_url
                      } 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({ ...prev, image_url: '' }))}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[9px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      {"Clear"}
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-dashed border-gray-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <ImageIcon size={22} className="text-brand-earth/30" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
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
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-100 bg-white text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      isUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50 text-brand-earth/70 hover:text-brand-earth hover:border-brand-green/20'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <CircleNotch size={12} className="animate-spin text-brand-green mr-1.5" />
                        {"Uploading..."}
                      </>
                    ) : (
                      "Upload Image"
                    )}
                  </label>
                  <p className="text-[7.5px] font-bold text-brand-earth/30 uppercase tracking-widest leading-none">
                    {"Max 5MB (JPG, PNG, WEBP)"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel Footer */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 border border-gray-100 hover:bg-gray-50 text-brand-earth/70 font-bold uppercase tracking-wider text-[9px] py-3 rounded-xl transition-all"
          >
            {"Cancel"}
          </button>
          <button 
            type="submit" 
            disabled={!productForm.name.trim() || !productForm.price || !productForm.description?.trim() || !productForm.image_url || (productForm.is_wholesale && !productForm.wholesale_price)}
            className="flex-1 bg-brand-earth hover:bg-brand-earth/95 text-white font-bold uppercase tracking-wider text-[9px] py-3 rounded-xl transition-all shadow-xl shadow-brand-earth/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-earth"
          >
            {"Save Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}