import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Package, X, ScanBarcode } from 'lucide-react';

interface AddProductModalProps {
  onClose: () => void;
  onProductAdded?: (productId: string) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  onClose,
  onProductAdded,
}) => {
  const { addProduct, parties, settings } = useApp();
  const t = translations[settings.language];

  const suppliers = parties.filter((p) => p.type === 'supplier');

  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [sku, setSku] = useState(`SKU-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState('Fruit Fillings');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [unit, setUnit] = useState('per kg');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');

  const categories = [
    'Fruit Fillings',
    'Sauces & Syrups',
    'Glazes & Cherries',
    'Chocolates & Fudge',
    'Dry Fruits & Nuts',
    'Bakery & Pastry',
    'Confectionery',
    'General',
  ];

  const units = [
    'per kg',
    'per pack',
    'per tin',
    'per bottle',
    'per jar',
    'per carton',
    'per piece',
    'per liter',
    'per box',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const supp = suppliers.find((s) => s.id === supplierId);
    const created = addProduct({
      name: name.trim(),
      weight: weight.trim() || undefined,
      sku: sku.trim(),
      category,
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 5,
      unit,
      supplierId: supp?.id,
      supplierName: supp?.name,
    });

    if (onProductAdded) {
      onProductAdded(created.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F4A3C] flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                {t.addProduct}
              </h3>
              <p className="text-xs text-stone-500">
                Catalog entry & stock threshold
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Glaze cherry, Caramel sauce, Pineapple filling"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-semibold text-sm focus:outline-hidden focus:border-[#0F4A3C]"
            />
          </div>

          {/* Weight & Unit Section */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-2">
            <span className="text-[11px] font-bold text-[#0F4A3C] uppercase tracking-wider block">
              Weight & Pricing Specifications
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Weight / Net Size *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 kg, 500 g, 3.1 kg, 1 liter"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold bg-white text-stone-900"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Pricing Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Selling Price (PKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Rs 0"
                  value={sellingPrice}
                  onChange={(e) =>
                    setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-extrabold text-sm text-[#0F4A3C]"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {t.purchasePrice} (Cost PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Rs 0"
                  value={purchasePrice}
                  onChange={(e) =>
                    setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Low Stock Alert Limit
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {t.sku}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 uppercase font-mono text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {suppliers.length > 0 && (
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Default Supplier (Optional)
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="">None / Walk-in wholesale</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-stone-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#0F4A3C] text-white font-bold shadow-xs hover:bg-[#135747]"
            >
              {t.save} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
