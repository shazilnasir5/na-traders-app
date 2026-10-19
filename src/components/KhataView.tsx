import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { formatPKR, getInitials, formatDate } from '../utils/formatters';
import { Party, PartyType } from '../types';
import {
  Search,
  Plus,
  Users2,
  Building2,
  ChevronRight,
  UserPlus,
  FileSpreadsheet,
  Edit3,
  Check,
} from 'lucide-react';
import { EditPartyModal } from './EditPartyModal';

interface KhataViewProps {
  onSelectParty: (partyId: string) => void;
  onOpenAddParty: (type: PartyType) => void;
  onOpenAddEntry: (partyId?: string) => void;
}

export const KhataView: React.FC<KhataViewProps> = ({
  onSelectParty,
  onOpenAddParty,
  onOpenAddEntry,
}) => {
  const {
    parties,
    settings,
    getPartyBalance,
    getTotalCustomerDues,
    getTotalSupplierDues,
    ledgerEntries,
  } = useApp();

  const t = translations[settings.language];
  const [activeType, setActiveType] = useState<PartyType>('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  const customerDues = getTotalCustomerDues();
  const supplierDues = getTotalSupplierDues();

  // Filter parties by type and search query
  const filteredParties = useMemo(() => {
    return parties
      .filter((p) => p.type === activeType)
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.companyName && p.companyName.toLowerCase().includes(q)) ||
          p.phone.includes(q)
        );
      });
  }, [parties, activeType, searchQuery]);

  // Find last entry for a party
  const getLastEntryText = (partyId: string) => {
    const entries = ledgerEntries.filter((e) => e.partyId === partyId);
    if (entries.length === 0) return 'No entries yet';
    const sorted = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastDate = sorted[0].date;
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastDate.startsWith(todayStr) || lastDate.startsWith('2026-10-18')) {
      return `${t.lastEntry} · ${t.today}`;
    }
    return `${t.lastEntry} · ${formatDate(lastDate)}`;
  };

  return (
    <div className="space-y-3.5 pb-24 pt-2 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            {t.khata}
          </h1>
          <p className="text-xs text-stone-500">
            {parties.filter((p) => p.type === activeType).length}{' '}
            {activeType === 'customer' ? t.customers : t.suppliers}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddEntry()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200/90 text-[#0F4A3C] font-bold text-xs shadow-2xs hover:bg-stone-50 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addEntry}</span>
          </button>

          <button
            onClick={() => onOpenAddParty(activeType)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F4A3C] text-white font-bold text-xs shadow-xs hover:bg-[#135747] active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ {activeType === 'customer' ? 'Customer' : 'Supplier'}</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastFeedback}</span>
        </div>
      )}

      {/* Hero Card: Deep Green Header Total */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F4A3C] text-white p-5 shadow-lg shadow-[#0F4A3C]/20 border border-[#165A4B]">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-emerald-200/90 uppercase">
              {activeType === 'customer'
                ? t.totalCustomerDue
                : t.totalSupplierDue}
            </span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-emerald-200 border border-white/10">
              {filteredParties.length} parties
            </span>
          </div>

          <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
            {formatPKR(activeType === 'customer' ? customerDues : supplierDues)}
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100">
            <span>
              {activeType === 'customer'
                ? 'Total receivables from all customers'
                : 'Total payables to all suppliers'}
            </span>
            <button
              onClick={() =>
                setActiveType((prev) =>
                  prev === 'customer' ? 'supplier' : 'customer'
                )
              }
              className="font-bold underline hover:text-white"
            >
              Switch to {activeType === 'customer' ? 'Suppliers' : 'Customers'}
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
          placeholder={t.findCustomer}
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

      {/* Type Switcher Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveType('customer')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeType === 'customer'
              ? 'bg-[#0F4A3C] text-white shadow-xs'
              : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>
            {t.customers} ({parties.filter((p) => p.type === 'customer').length})
          </span>
        </button>

        <button
          onClick={() => setActiveType('supplier')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeType === 'supplier'
              ? 'bg-[#0F4A3C] text-white shadow-xs'
              : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>
            {t.suppliers} ({parties.filter((p) => p.type === 'supplier').length})
          </span>
        </button>
      </div>

      {/* Party List */}
      <div className="space-y-2">
        {filteredParties.length === 0 ? (
          <div className="text-center py-10 bg-white/80 rounded-2xl border border-stone-200/70 p-6">
            <Users2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-stone-800">
              No {activeType === 'customer' ? 'customers' : 'suppliers'} found
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Add your first {activeType === 'customer' ? 'customer' : 'supplier'} to
              manage their individual khata ledger.
            </p>
            <button
              onClick={() => onOpenAddParty(activeType)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0F4A3C] text-white text-xs font-bold shadow-xs hover:bg-[#135747]"
            >
              + Add {activeType === 'customer' ? 'Customer' : 'Supplier'}
            </button>
          </div>
        ) : (
          filteredParties.map((party) => {
            const balance = getPartyBalance(party.id);
            const initials = getInitials(party.name);
            const hasMultipleAccounts = party.accounts.length > 1;

            return (
              <div
                key={party.id}
                onClick={() => onSelectParty(party.id)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/80 hover:border-stone-300 transition-all cursor-pointer hover:shadow-xs active:scale-[0.99]"
              >
                {/* Left: Initials Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200/70 text-[#0F4A3C] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-stone-900 truncate">
                        {party.name}
                      </h3>
                      {hasMultipleAccounts && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 border border-stone-200/80">
                          {party.accounts.length} accounts
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5 truncate">
                      {getLastEntryText(party.id)}
                    </div>
                  </div>
                </div>

                {/* Right: Net Balance Due */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <div
                      className={`text-sm sm:text-base font-extrabold tabular-nums ${
                        balance > 0
                          ? 'text-rose-600'
                          : balance < 0
                          ? 'text-emerald-700'
                          : 'text-stone-600'
                      }`}
                    >
                      {balance === 0
                        ? 'Rs 0'
                        : `${formatPKR(Math.abs(balance))} ${
                            balance > 0
                              ? activeType === 'customer'
                                ? t.due
                                : t.owed
                              : 'adv'
                          }`}
                    </div>
                    {hasMultipleAccounts && (
                      <div className="text-[10px] text-stone-400">
                        Combined Total
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingParty(party);
                      }}
                      title={activeType === 'customer' ? 'Edit customer details' : 'Edit supplier details'}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-[#0F4A3C] hover:bg-emerald-50 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Switch Link */}
      <div className="pt-2 text-center">
        <button
          onClick={() =>
            setActiveType((prev) =>
              prev === 'customer' ? 'supplier' : 'customer'
            )
          }
          className="text-xs font-semibold text-stone-600 hover:text-[#0F4A3C] transition-colors"
        >
          {activeType === 'customer' ? t.viewSuppliers : t.viewCustomers}
        </button>
      </div>

      {/* Edit Party Modal */}
      {editingParty && (
        <EditPartyModal
          party={editingParty}
          onClose={() => setEditingParty(null)}
          onPartyUpdated={() => {
            setEditingParty(null);
            setToastFeedback(t.customerUpdated);
            setTimeout(() => setToastFeedback(null), 2500);
          }}
          onPartyDeleted={() => {
            setEditingParty(null);
            setToastFeedback('Party and associated data removed successfully.');
            setTimeout(() => setToastFeedback(null), 2500);
          }}
        />
      )}
    </div>
  );
};
