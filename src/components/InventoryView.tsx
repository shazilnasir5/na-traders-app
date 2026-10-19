import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/formatters';
import { Product } from '../types';
import {
  Search,
  ScanBarcode,
  Plus,
  AlertCircle,
  Archive,
  Edit2,
  Package,
  Layers,
  ArrowUpDown,
  Check,
} from 'lucide-react';

interface InventoryViewProps {
  onOpenAddProduct: () => void;
  initialFilter?: 'all' | 'low_stock';
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenAddProduct,
  initialFilter = 'all',
}) => {
  const { products, settings, adjustStock, archiveProduct, updateProduct } =
    useApp();
  const t = translations[settings.language];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low_stock' | 'category'>(
    initialFilter === 'low_stock' ? 'low_stock' : 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickAdjustAmount, setQuickAdjustAmount] = useState<number>(1);
  const [barcodeScanFeedback, setBarcodeScanFeedback] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Exclude archived unless searched specifically
      if (p.isArchived && activeFilter !== 'all') return false;

      // Filter tabs
      if (activeFilter === 'low_stock' && p.stock > p.minStockAlert) {
        return false;
      }
      if (
        activeFilter === 'category' &&
        selectedCategory !== 'all' &&
        p.category !== selectedCategory
      ) {
        return false;
      }

      // Search match (name, sku, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, activeFilter, selectedCategory, searchQuery]);

  const lowStockCount = products.filter((p) => !p.isArchived && p.stock <= p.minStockAlert).length;

  const simulateBarcodeScan = () => {
    // Pick a random product from inventory and simulate barcode scan
    const randomProd = products[Math.floor(Math.random() * products.length)];
    if (randomProd) {
      setSearchQuery(randomProd.sku);
      setBarcodeScanFeedback(`Scanned SKU: ${randomProd.sku} (${randomProd.name})`);
      setTimeout(() => setBarcodeScanFeedback(null), 3500);
    }
  };

  const getProductIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('cherry') || cat.includes('glaze')) return '🍒';
    if (cat.includes('sauce') || cat.includes('syrup')) return '🍯';
    if (cat.includes('filling') || cat.includes('fruit')) return '🍍';
    if (cat.includes('choc') || cat.includes('fudge')) return '🍫';
    if (cat.includes('dry') || cat.includes('nut')) return '🥜';
    if (cat.includes('bakery') || cat.includes('pastry') || cat.includes('khasta')) return '🥐';
    if (cat.includes('beverage')) return '☕';
    return '📦';
  };

  return (
    <div className="space-y-3.5 pb-24 pt-2 animate-fadeIn">
      {/* Screen Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            {t.products}
          </h1>
          <p className="text-xs text-stone-500">
            {products.length} {t.items} in catalog
          </p>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F4A3C] text-white font-bold text-xs shadow-xs hover:bg-[#135747] active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addProduct}</span>
        </button>
      </div>

      {/* Search & Barcode Scanner bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchProducts}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#0F4A3C] focus:ring-1 focus:ring-[#0F4A3C] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Scan Barcode Button */}
        <button
          onClick={simulateBarcodeScan}
          title="Scan barcode with camera or reader"
          className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 flex items-center justify-center text-stone-700 hover:text-[#0F4A3C] hover:border-[#0F4A3C] active:scale-95 transition-all shadow-2xs shrink-0"
        >
          <ScanBarcode className="w-5 h-5" />
        </button>
      </div>

      {/* Toast notifications */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barcode scanner toast banner if simulated */}
      {barcodeScanFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{barcodeScanFeedback}</span>
        </div>
      )}

      {/* Segmented Filter Bar: All, Low stock, Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => {
            setActiveFilter('all');
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-[#0F4A3C] text-white shadow-xs'
              : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
          }`}
        >
          {t.all} {products.length}
        </button>

        <button
          onClick={() => {
            setActiveFilter('low_stock');
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === 'low_stock'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white/80 text-amber-700 hover:bg-white border border-amber-200'
          }`}
        >
          <span>{t.lowStock}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
            {lowStockCount}
          </span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveFilter('category');
              setSelectedCategory(cat);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'category' && selectedCategory === cat
                ? 'bg-[#0F4A3C] text-white shadow-xs'
                : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white/70 rounded-2xl border border-stone-200/70 p-6">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-stone-800">
              No products found
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search or add a new product to your inventory.
            </p>
            <button
              onClick={onOpenAddProduct}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0F4A3C] text-white text-xs font-bold shadow-xs hover:bg-[#135747]"
            >
              + {t.addProduct}
            </button>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const isLow = prod.stock <= prod.minStockAlert;
            return (
              <div
                key={prod.id}
                onClick={() => {
                  setSelectedProduct(prod);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border transition-all cursor-pointer hover:shadow-xs active:scale-[0.99] ${
                  isLow
                    ? 'border-amber-200/90 bg-amber-50/20'
                    : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                {/* Left: Product Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5EBE1] border border-stone-200/60 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                    {getProductIcon(prod.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-stone-900 truncate">
                        {prod.name}
                      </h3>
                      {prod.weight && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200/70">
                          {prod.weight}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                      <span
                        className={`font-semibold tabular-nums ${
                          isLow ? 'text-rose-600 font-bold' : 'text-stone-700'
                        }`}
                      >
                        {t.stock} {prod.stock}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="truncate">
                        {isLow ? (
                          <span className="text-amber-700 font-medium">
                            {t.lowStock}
                          </span>
                        ) : (
                          `SKU ${prod.sku}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Selling Price & Quick Edit Trigger */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-extrabold text-stone-900 tabular-nums">
                      {formatPKR(prod.sellingPrice)}
                    </div>
                    <div className="text-[11px] text-stone-600 font-medium">
                      {prod.unit}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(prod);
                    }}
                    title="Edit Product (Weight & Price)"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#0F4A3C]/10 text-stone-700 hover:text-[#0F4A3C] font-bold text-xs border border-stone-200 transition-all active:scale-95 shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#0F4A3C]" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Product Detail & Quick Stock Adjust Sheet */}
      {selectedProduct && !editingProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F5EBE1] flex items-center justify-center text-2xl">
                  {getProductIcon(selectedProduct.category)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-base text-stone-900">
                      {selectedProduct.name}
                    </h3>
                    {selectedProduct.weight && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                        {selectedProduct.weight}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    SKU: {selectedProduct.sku} · {selectedProduct.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-3 rounded-xl bg-stone-50 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-600 block">
                  Current Stock
                </span>
                <span
                  className={`text-base font-bold tabular-nums ${
                    selectedProduct.stock <= selectedProduct.minStockAlert
                      ? 'text-rose-600'
                      : 'text-stone-900'
                  }`}
                >
                  {selectedProduct.stock}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-600 block">
                  Purchase Price
                </span>
                <span className="text-base font-bold text-stone-900 tabular-nums">
                  {formatPKR(selectedProduct.purchasePrice)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 text-center">
                <span className="text-[10px] uppercase font-bold text-stone-600 block">
                  Selling Price
                </span>
                <span className="text-base font-bold text-[#0F4A3C] tabular-nums">
                  {formatPKR(selectedProduct.sellingPrice)}
                </span>
              </div>
            </div>

            {/* Quick Stock Adjustment (+ / -) */}
            <div className="p-3.5 rounded-2xl bg-stone-100/70 space-y-2">
              <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>Quick Stock Adjustment</span>
                <span className="text-[11px] text-stone-500">
                  {selectedProduct.unit} {selectedProduct.weight ? `(${selectedProduct.weight})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    adjustStock(selectedProduct.id, -quickAdjustAmount);
                    setSelectedProduct((prev) =>
                      prev
                        ? {
                            ...prev,
                            stock: Math.max(0, prev.stock - quickAdjustAmount),
                          }
                        : null
                    );
                  }}
                  className="flex-1 py-2 rounded-xl bg-white border border-stone-300 font-bold text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
                >
                  - {quickAdjustAmount} Stock
                </button>

                <input
                  type="number"
                  min="1"
                  value={quickAdjustAmount}
                  onChange={(e) =>
                    setQuickAdjustAmount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 py-2 text-center rounded-xl bg-white border border-stone-300 font-bold text-sm"
                />

                <button
                  onClick={() => {
                    adjustStock(selectedProduct.id, quickAdjustAmount);
                    setSelectedProduct((prev) =>
                      prev
                        ? { ...prev, stock: prev.stock + quickAdjustAmount }
                        : null
                    );
                  }}
                  className="flex-1 py-2 rounded-xl bg-white border border-stone-300 font-bold text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all"
                >
                  + {quickAdjustAmount} Stock
                </button>
              </div>
            </div>

            {/* Action Bar: Edit Weight & Price Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setEditingProduct(selectedProduct);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0F4A3C] text-white text-xs font-bold shadow-xs hover:bg-[#135747] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Product (Weight & Price)</span>
              </button>

              <button
                onClick={() => {
                  archiveProduct(selectedProduct.id);
                  setSelectedProduct(null);
                }}
                className="px-3 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:text-rose-600 text-xs font-bold hover:bg-stone-50 transition-colors"
                title="Archive Product"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Product Modal (Weight, Price, Name, Category, Stock, Unit) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F4A3C] flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Edit Product
                  </h3>
                  <p className="text-xs text-stone-500">
                    Update weight, price, and catalog details
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProduct(editingProduct.id, {
                  name: editingProduct.name,
                  weight: editingProduct.weight,
                  sellingPrice: Number(editingProduct.sellingPrice),
                  purchasePrice: Number(editingProduct.purchasePrice),
                  stock: Number(editingProduct.stock),
                  minStockAlert: Number(editingProduct.minStockAlert),
                  unit: editingProduct.unit,
                  category: editingProduct.category,
                });
                if (selectedProduct && selectedProduct.id === editingProduct.id) {
                  setSelectedProduct(editingProduct);
                }
                const weightLabel = editingProduct.weight ? ` (${editingProduct.weight})` : '';
                setToastMessage(`Updated ${editingProduct.name}${weightLabel} · Rs ${Number(editingProduct.sellingPrice).toLocaleString('en-PK')}`);
                setTimeout(() => setToastMessage(null), 3500);
                setEditingProduct(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-sm focus:outline-hidden focus:border-[#0F4A3C]"
                />
              </div>

              {/* Weight & Size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Weight / Net Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 kg, 500 g, 3.1 kg, 1 liter"
                    value={editingProduct.weight || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        weight: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Pricing Unit
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        unit: e.target.value,
                      })
                    }
                    placeholder="per kg, per bottle, per tin"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Purchase Price (Cost PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.purchasePrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        purchasePrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Selling Price (Retail PKR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.sellingPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sellingPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-[#0F4A3C]"
                  />
                </div>
              </div>

              {/* Stock & Low Stock Alert */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.minStockAlert}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        minStockAlert: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0F4A3C] text-white font-bold shadow-xs hover:bg-[#135747] active:scale-95 transition-all"
                >
                  Save Product Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
