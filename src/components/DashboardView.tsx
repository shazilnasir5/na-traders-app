import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { formatPKR, formatTimeOnly } from '../utils/formatters';
import {
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Receipt,
  Wallet,
  PackagePlus,
  ShoppingBag,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToSale: () => void;
  onNavigateToAddProduct: () => void;
  onNavigateToInvoice: () => void;
  onNavigateToReceivePayment: () => void;
  onNavigateToKhata: () => void;
  onNavigateToInventory: (filter?: 'low_stock') => void;
  onSelectCustomer: (partyId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToSale,
  onNavigateToAddProduct,
  onNavigateToInvoice,
  onNavigateToReceivePayment,
  onNavigateToKhata,
  onNavigateToInventory,
  onSelectCustomer,
}) => {
  const {
    businessProfile,
    settings,
    getTodaySalesTotal,
    getTodayCashReceived,
    getTotalCustomerDues,
    getTotalSupplierDues,
    getLowStockProducts,
    sales,
    ledgerEntries,
  } = useApp();

  const t = translations[settings.language];
  const todaySales = getTodaySalesTotal();
  const todayCash = getTodayCashReceived();
  const customerDues = getTotalCustomerDues();
  const supplierDues = getTotalSupplierDues();
  const lowStockCount = getLowStockProducts().length;

  // Format today's date
  const todayDateFormatted = new Date().toLocaleDateString(
    settings.language === 'ur' ? 'ur-PK' : 'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
  );

  // Combine recent activity (latest sales & payment entries)
  const recentActivities = [
    ...sales.slice(0, 3).map((s) => ({
      id: s.id,
      partyId: s.customerId,
      title: `Sale · ${s.customerName}`,
      subtitle: `${formatTimeOnly(s.date)} · ${s.status.toUpperCase()}`,
      amount: s.totalAmount,
      isCredit: false, // money receivable or recorded
      type: 'sale' as const,
      date: s.date,
    })),
    ...ledgerEntries
      .filter((e) => e.type === 'payment_received')
      .slice(0, 3)
      .map((e) => ({
        id: e.id,
        partyId: e.partyId,
        title: `Payment · ${e.partyName}`,
        subtitle: `${formatTimeOnly(e.date)} · ${e.paymentMethod?.toUpperCase() || 'CASH'}`,
        amount: e.amount,
        isCredit: true, // money received (+)
        type: 'payment' as const,
        date: e.date,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-4 pb-20 pt-2 animate-fadeIn">
      {/* Greeting Header */}
      <div className="px-1 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>
              {t.goodMorning}, {businessProfile.ownerName}
            </span>
            <span className="text-lg">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            {todayDateFormatted}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-[#0F4A3C] bg-white/80 px-2.5 py-1 rounded-full border border-stone-200/80 shadow-xs">
            {businessProfile.name}
          </span>
        </div>
      </div>

      {/* Hero Card: Today's Sales (Deep Green) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F4A3C] text-white p-5 shadow-lg shadow-[#0F4A3C]/20 border border-[#165A4B] transition-transform active:scale-[0.99]">
        {/* Subtle decorative glow in top right */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-emerald-200/90 uppercase">
              {t.todaysSales}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-200 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
              {todaySales > 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                  <span>↑ Active</span>
                </>
              ) : (
                <span>Rs 0 Today</span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
              {formatPKR(todaySales)}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100/90">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t.todaysCash}:</span>
              <span className="font-bold text-white tabular-nums">
                {formatPKR(todayCash)}
              </span>
            </div>
            <button
              onClick={onNavigateToSale}
              className="font-semibold text-xs text-white underline underline-offset-4 hover:text-emerald-200 transition-colors"
            >
              + {t.newSale}
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Summary Cards: Customer Dues & Low Stock */}
      <div className="grid grid-cols-2 gap-3">
        {/* Customer Dues */}
        <button
          onClick={onNavigateToKhata}
          className="text-left p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-xs hover:border-[#0F4A3C]/40 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              {t.customerDues}
            </span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-600 tabular-nums">
            {formatPKR(customerDues)}
          </div>
          <div className="text-[11px] text-stone-600 mt-1 flex items-center gap-1">
            <span>{customerDues > 0 ? t.due : 'Settled'}</span>
            <span>·</span>
            <span className="text-[#0F4A3C] font-semibold">{t.khata} →</span>
          </div>
        </button>

        {/* Low Stock Alert */}
        <button
          onClick={() => onNavigateToInventory('low_stock')}
          className="text-left p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase">
              {t.lowStock}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-600 tabular-nums">
            {lowStockCount} {t.items}
          </div>
          <div className="text-[11px] text-stone-600 mt-1 flex items-center gap-1">
            <span>Needs reorder</span>
            <span>·</span>
            <span className="text-[#0F4A3C] font-semibold">{t.inventory} →</span>
          </div>
        </button>
      </div>

      {/* Supplier Dues Banner strip */}
      <div
        onClick={onNavigateToKhata}
        className="cursor-pointer p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200/80 flex items-center justify-between hover:bg-stone-200/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-stone-200/80 text-stone-700 flex items-center justify-center font-bold text-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
              {t.supplierDues}
            </div>
            <div className="text-[11px] text-stone-500">
              Amount payable to vendors
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-stone-900 tabular-nums">
            {formatPKR(supplierDues)}
          </div>
          <div className="text-[10px] text-stone-500">{t.owed}</div>
        </div>
      </div>

      {/* Quick Actions matching the design board */}
      <div className="space-y-2 pt-1">
        <h2 className="text-sm font-bold text-stone-800 tracking-tight px-1">
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Main Action: New Sale */}
          <button
            onClick={onNavigateToSale}
            className="flex items-center justify-center gap-2 h-13 rounded-2xl bg-[#0F4A3C] text-white font-bold text-sm shadow-md shadow-[#0F4A3C]/20 hover:bg-[#135747] active:scale-[0.98] transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.newSale}</span>
          </button>

          {/* Secondary Action: Add Product */}
          <button
            onClick={onNavigateToAddProduct}
            className="flex items-center justify-center gap-2 h-13 rounded-2xl bg-white text-[#0F4A3C] font-bold text-sm border border-stone-200/90 shadow-xs hover:bg-stone-50 active:scale-[0.98] transition-all"
          >
            <PackagePlus className="w-4 h-4" />
            <span>{t.addProduct}</span>
          </button>
        </div>

        {/* Secondary quick actions strip */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={onNavigateToInvoice}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-xs text-stone-700 font-semibold text-xs border border-stone-200/70 hover:bg-white active:scale-95 transition-all"
          >
            <Receipt className="w-3.5 h-3.5 text-[#0F4A3C]" />
            <span>{t.createInvoice}</span>
          </button>
          <button
            onClick={onNavigateToReceivePayment}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/70 backdrop-blur-xs text-stone-700 font-semibold text-xs border border-stone-200/70 hover:bg-white active:scale-95 transition-all"
          >
            <Wallet className="w-3.5 h-3.5 text-[#0F4A3C]" />
            <span>{t.receivePayment}</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-800 tracking-tight">
            {t.recentActivity}
          </h2>
          <button
            onClick={onNavigateToKhata}
            className="text-xs font-semibold text-[#0F4A3C] hover:underline"
          >
            {t.viewCustomers}
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-stone-400 space-y-1">
              <p className="text-xs font-bold text-stone-700">No transactions recorded yet</p>
              <p className="text-[11px] text-stone-400">Record a new sale or receive payment to start your ledger</p>
            </div>
          ) : (
            recentActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => onSelectCustomer(act.partyId)}
                className="flex items-center justify-between p-3.5 hover:bg-stone-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      act.type === 'payment'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {act.type === 'payment' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-stone-900 truncate">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">
                      {act.subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-bold tabular-nums ${
                      act.type === 'payment' ? 'text-emerald-700' : 'text-stone-900'
                    }`}
                  >
                    {act.type === 'payment' ? `+ ${formatPKR(act.amount)}` : formatPKR(act.amount)}
                  </div>
                  <div className="text-[10px] text-stone-600 font-medium">
                    {act.type === 'payment' ? 'Recorded' : 'Sale'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
