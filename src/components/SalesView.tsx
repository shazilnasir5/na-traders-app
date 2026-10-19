import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/formatters';
import { PaymentMethod, Product, SaleItem } from '../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Search,
  CheckCircle2,
  Receipt,
  Share2,
  Building2,
  User,
  ArrowRight,
} from 'lucide-react';

interface SalesViewProps {
  onSaleSaved?: (saleId: string) => void;
  onOpenInvoiceModal?: (invoiceId: string) => void;
  preselectedCustomerId?: string;
}

export const SalesView: React.FC<SalesViewProps> = ({
  onSaleSaved,
  onOpenInvoiceModal,
  preselectedCustomerId,
}) => {
  const { parties, products, addSale, settings } = useApp();
  const t = translations[settings.language];

  // Customers only
  const customers = useMemo(
    () => parties.filter((p) => p.type === 'customer'),
    [parties]
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedCustomerId || (customers[0]?.id || '')
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    selectedCustomer?.accounts[0]?.id || ''
  );

  // When customer changes, default to their first account
  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id);
    const cust = customers.find((c) => c.id === id);
    if (cust && cust.accounts.length > 0) {
      setSelectedAccountId(cust.accounts[0].id);
    }
  };

  // Cart items
  const [cartItems, setCartItems] = useState<SaleItem[]>([
    {
      productId: 'prod-glaze-cherry',
      productName: 'Glaze cherry',
      sku: 'GLZ-CHR-01',
      unit: 'per kg',
      quantity: 2,
      unitPrice: 650,
      purchasePrice: 480,
      total: 1300,
    },
    {
      productId: 'prod-choc-sauce',
      productName: 'Chocolate sauce',
      sku: 'SAU-CHC-02',
      unit: 'per bottle',
      quantity: 1,
      unitPrice: 700,
      purchasePrice: 520,
      total: 700,
    },
  ]);

  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [paidNow, setPaidNow] = useState<number>(1000); // matching design board
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [savedSaleSuccess, setSavedSaleSuccess] = useState<{
    saleId: string;
    invoiceId?: string;
  } | null>(null);

  // Compute totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const taxAmount = useMemo(() => {
    return Math.round((subtotal - discount) * (taxRate / 100));
  }, [subtotal, discount, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discount + taxAmount);
  }, [subtotal, discount, taxAmount]);

  const remainingBalance = useMemo(() => {
    return Math.max(0, grandTotal - paidNow);
  }, [grandTotal, paidNow]);

  // Product selection
  const handleAddProductToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unit: product.unit,
          quantity: 1,
          unitPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          total: product.sellingPrice,
        },
      ];
    });
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleSaveSale = (generateInvoice: boolean = true) => {
    if (!selectedCustomerId || !selectedAccountId || cartItems.length === 0) {
      return;
    }

    const result = addSale({
      customerId: selectedCustomerId,
      accountId: selectedAccountId,
      items: cartItems,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      totalAmount: grandTotal,
      paidAmount: paidNow,
      paymentMethod,
      notes,
      generateInvoice,
    });

    setSavedSaleSuccess({
      saleId: result.sale.id,
      invoiceId: result.invoice?.id,
    });

    if (onSaleSaved) {
      onSaleSaved(result.sale.id);
    }
  };

  // Filtered catalog for quick adder
  const catalogSuggestions = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 5);
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  if (savedSaleSuccess) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Sale Recorded Successfully!
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Inventory reduced, invoice generated, and {selectedCustomer?.name}’s
            khata ledger updated automatically.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Customer:</span>
            <span className="font-bold text-stone-900">
              {selectedCustomer?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Account:</span>
            <span className="font-bold text-stone-900">
              {selectedCustomer?.accounts.find((a) => a.id === selectedAccountId)?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Total Sale:</span>
            <span className="font-bold text-stone-900">
              {formatPKR(grandTotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Paid Now:</span>
            <span className="font-bold text-emerald-700">
              {formatPKR(paidNow)} ({paymentMethod.toUpperCase()})
            </span>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-2">
            <span className="text-stone-500">Remaining Balance:</span>
            <span className="font-extrabold text-rose-600">
              {formatPKR(remainingBalance)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {savedSaleSuccess.invoiceId && onOpenInvoiceModal && (
            <button
              onClick={() => onOpenInvoiceModal(savedSaleSuccess.invoiceId!)}
              className="w-full py-3 rounded-2xl bg-[#0F4A3C] text-white font-bold text-sm shadow-md hover:bg-[#135747] flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>View & Share Invoice</span>
            </button>
          )}

          <button
            onClick={() => {
              setSavedSaleSuccess(null);
              setCartItems([]);
              setPaidNow(0);
              setDiscount(0);
            }}
            className="w-full py-3 rounded-2xl bg-white border border-stone-300 text-stone-800 font-bold text-sm hover:bg-stone-50"
          >
            Start Another Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 pt-1 animate-fadeIn">
      {/* Screen Title */}
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
          {t.newSale}
        </h1>
        <p className="text-xs text-stone-500">
          Point of Sale · Inventory auto-deducted · Khata updated
        </p>
      </div>

      {/* Customer & Account Selection */}
      <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-xs space-y-3">
        <div>
          <label className="text-[11px] font-bold tracking-wider text-stone-600 uppercase block mb-1">
            {t.customers.toUpperCase()}
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm font-semibold text-stone-900 focus:outline-hidden focus:border-[#0F4A3C]"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Account Selector if customer has multiple accounts */}
        {selectedCustomer && selectedCustomer.accounts.length > 1 && (
          <div>
            <label className="text-[11px] font-bold tracking-wider text-stone-600 uppercase block mb-1">
              Select Specific Ledger Account
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {selectedCustomer.accounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedAccountId === acc.id
                      ? 'bg-[#0F4A3C] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Items Search & Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold tracking-wider text-stone-600 uppercase block px-1">
          {t.products.toUpperCase()}
        </label>

        {/* Search Input for adding products */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setShowProductDropdown(true);
            }}
            onFocus={() => setShowProductDropdown(true)}
            placeholder="Search or scan a product..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/90 text-sm focus:outline-hidden focus:border-[#0F4A3C] shadow-2xs"
          />

          {showProductDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-stone-200 shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-stone-100">
              {catalogSuggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddProductToCart(p)}
                  className="w-full p-2.5 text-left flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-xs text-stone-900">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Stock: {p.stock} · SKU: {p.sku}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#0F4A3C] tabular-nums">
                    {formatPKR(p.sellingPrice)}
                  </div>
                </button>
              ))}
              <div className="p-2 text-center bg-stone-50">
                <button
                  type="button"
                  onClick={() => setShowProductDropdown(false)}
                  className="text-xs text-stone-500 font-semibold"
                >
                  Close catalog
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Added Items List matching design board */}
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-stone-900 truncate">
                  {item.productName}
                </h4>
                <div className="text-xs text-stone-500 mt-0.5">
                  {formatPKR(item.unitPrice)} × {item.quantity}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-extrabold text-stone-900 tabular-nums">
                    {formatPKR(item.total)}
                  </div>
                </div>

                {/* Counter Stepper */}
                <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-0.5 border border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.productId, -1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-stone-700 hover:text-rose-600 shadow-2xs active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.productId, 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-stone-700 hover:text-[#0F4A3C] shadow-2xs active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.productId)}
                  className="p-1.5 text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="text-center py-6 bg-white/60 rounded-2xl border border-dashed border-stone-300 text-xs text-stone-500">
              No products added yet. Search above to add items.
            </div>
          )}
        </div>
      </div>

      {/* Financial Breakdown & Payment Section matching design board */}
      <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Payment & Settlement
        </h3>

        {/* Subtotal, Discount, Total */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-semibold tabular-nums">
              {formatPKR(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-600">
            <span>Discount (PKR)</span>
            <input
              type="number"
              min="0"
              value={discount || ''}
              placeholder="0"
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              className="w-24 px-2 py-1 text-right text-xs font-bold rounded-lg border border-stone-200"
            />
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
            <span className="text-sm font-bold text-stone-900 uppercase">
              Total
            </span>
            <span className="text-lg font-extrabold text-[#0F4A3C] tabular-nums">
              {formatPKR(grandTotal)}
            </span>
          </div>
        </div>

        {/* Paid Now Input */}
        <div className="pt-2 border-t border-stone-100">
          <label className="text-xs font-bold text-stone-700 block mb-1">
            Paid Now (PKR)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max={grandTotal}
              value={paidNow}
              onChange={(e) => setPaidNow(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-base font-extrabold text-stone-900 focus:outline-hidden focus:border-[#0F4A3C] tabular-nums"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                type="button"
                onClick={() => setPaidNow(grandTotal)}
                className="text-[10px] font-bold bg-white px-2 py-1 rounded-lg border border-stone-200 text-emerald-700 hover:bg-stone-50"
              >
                Full Paid
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs mt-1.5">
            <span className="text-stone-500">Remaining Balance:</span>
            <span
              className={`font-bold tabular-nums ${
                remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {remainingBalance > 0
                ? `${formatPKR(remainingBalance)} (${t.due})`
                : 'Full Paid (Rs 0 due)'}
            </span>
          </div>
        </div>

        {/* Payment Method Tabs matching design board */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-stone-600 uppercase block">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['cash', 'bank', 'other'] as PaymentMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  paymentMethod === method
                    ? 'bg-[#0F4A3C] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Button matching design board */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-gradient-to-t from-[#F4F6F2] via-[#F4F6F2] to-transparent z-30">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => handleSaveSale(true)}
            disabled={cartItems.length === 0}
            className="w-full h-13 rounded-2xl bg-[#0F4A3C] text-white font-extrabold text-sm shadow-xl shadow-[#0F4A3C]/25 hover:bg-[#135747] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              Save sale · {formatPKR(grandTotal)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
