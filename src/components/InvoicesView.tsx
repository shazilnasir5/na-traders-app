import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { formatPKR, formatDate } from '../utils/formatters';
import { Invoice } from '../types';
import {
  FileText,
  Search,
  Plus,
  ArrowUpRight,
  Receipt,
  Share2,
  Printer,
  ChevronRight,
} from 'lucide-react';

interface InvoicesViewProps {
  onSelectInvoice: (invoiceId: string) => void;
  onOpenCreateInvoice: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onSelectInvoice,
  onOpenCreateInvoice,
}) => {
  const { invoices, settings } = useApp();
  const t = translations[settings.language];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');

  // Compute month totals
  const thisMonthTotal = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  return (
    <div className="space-y-3.5 pb-24 pt-2 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            {t.invoices}
          </h1>
          <p className="text-xs text-stone-500">
            Professional invoices & GST receipts
          </p>
        </div>

        <button
          onClick={onOpenCreateInvoice}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F4A3C] text-white font-bold text-xs shadow-xs hover:bg-[#135747] active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create</span>
        </button>
      </div>

      {/* Hero Card: Deep Green Month Summary matching design board */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F4A3C] text-white p-5 shadow-lg shadow-[#0F4A3C]/20 border border-[#165A4B]">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-emerald-200/90 uppercase">
              {t.thisMonth.toUpperCase()}
            </span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-emerald-200 border border-white/10 font-semibold">
              {invoices.length} invoices
            </span>
          </div>

          <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
            {formatPKR(thisMonthTotal)}
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100">
            <span>Generated invoices and billing records</span>
            <button
              onClick={onOpenCreateInvoice}
              className="font-bold underline hover:text-white"
            >
              + Create new
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search invoice number or customer..."
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

      {/* Filter Tabs: All, Paid, Partial, Unpaid */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {(['all', 'paid', 'partial', 'unpaid'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              statusFilter === filter
                ? 'bg-[#0F4A3C] text-white shadow-xs'
                : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Invoice List matching design board */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-stone-800 tracking-tight px-1">
          {t.recentInvoices}
        </h2>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-10 bg-white/80 rounded-2xl border border-stone-200/70 p-6">
            <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">
              No invoices found
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Create a new invoice to share with your customers.
            </p>
            <button
              onClick={onOpenCreateInvoice}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0F4A3C] text-white text-xs font-bold shadow-xs hover:bg-[#135747]"
            >
              + Create Invoice
            </button>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'paid';
            const isPartial = inv.status === 'partial';

            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv.id)}
                className="p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/80 hover:border-stone-300 transition-all cursor-pointer hover:shadow-xs active:scale-[0.99] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-stone-900">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="font-semibold text-sm text-stone-800 truncate">
                        {inv.customerName}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                      <span>{formatDate(inv.issueDate)}</span>
                      <span>·</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        {formatPKR(inv.totalAmount)}
                      </span>
                      {inv.accountName && (
                        <>
                          <span>·</span>
                          <span className="text-stone-500 text-[11px]">
                            {inv.accountName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shrink-0 ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPartial
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs font-semibold text-[#0F4A3C]">
                  <span>{inv.items.length} items billed</span>
                  <div className="flex items-center gap-1 hover:underline">
                    <span>{t.viewShare}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Button */}
      <div className="pt-2 text-center">
        <button
          onClick={onOpenCreateInvoice}
          className="text-xs font-semibold text-stone-600 hover:text-[#0F4A3C] transition-colors"
        >
          + Create new invoice
        </button>
      </div>
    </div>
  );
};
