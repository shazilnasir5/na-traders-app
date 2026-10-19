import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import {
  formatPKR,
  formatTimeOnly,
  formatDate,
  getEntryDelta,
} from '../utils/formatters';
import { LedgerEntry, PartyAccount } from '../types';
import {
  ArrowLeft,
  Plus,
  Wallet,
  Receipt,
  FileSpreadsheet,
  RotateCcw,
  AlertCircle,
  Building,
  CreditCard,
  Share2,
  Phone,
  MapPin,
  CheckCircle,
  Edit3,
  Trash2,
  Check,
} from 'lucide-react';
import { EditPartyModal } from './EditPartyModal';

interface LedgerDetailViewProps {
  partyId: string;
  onBack: () => void;
  onOpenReceivePayment: (partyId: string, accountId?: string) => void;
  onOpenAddEntry: (partyId: string, accountId?: string) => void;
  onOpenStatement: (partyId: string) => void;
  onOpenNewAccount: (partyId: string) => void;
}

export const LedgerDetailView: React.FC<LedgerDetailViewProps> = ({
  partyId,
  onBack,
  onOpenReceivePayment,
  onOpenAddEntry,
  onOpenStatement,
  onOpenNewAccount,
}) => {
  const {
    parties,
    settings,
    getPartyBalance,
    getAccountBalance,
    getPartyEntries,
    getAccountEntries,
    reverseLedgerEntry,
    deleteLedgerEntry,
  } = useApp();

  const t = translations[settings.language];
  const party = parties.find((p) => p.id === partyId);

  // Selected account: 'all' represents combined, or specific account ID
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [reversalModalEntry, setReversalModalEntry] = useState<LedgerEntry | null>(
    null
  );
  const [reversalReason, setReversalReason] = useState('');
  const [showPartyInfo, setShowPartyInfo] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<LedgerEntry | null>(null);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  if (!party) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-stone-500">Party not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#0F4A3C] text-white rounded-xl text-xs font-bold"
        >
          {t.cancel}
        </button>
      </div>
    );
  }

  const isCustomer = party.type === 'customer';

  // Compute current display balance
  const currentBalance =
    selectedAccountId === 'all'
      ? getPartyBalance(party.id)
      : getAccountBalance(party.id, selectedAccountId);

  // Retrieve entries for display
  const entries: LedgerEntry[] = useMemo(() => {
    const raw =
      selectedAccountId === 'all'
        ? getPartyEntries(party.id)
        : getAccountEntries(party.id, selectedAccountId);

    return [...raw].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [party.id, selectedAccountId, getPartyEntries, getAccountEntries]);

  // Compute total given vs total paid for summary stats
  const { totalGiven, totalPaid } = useMemo(() => {
    let given = 0;
    let paid = 0;
    entries.forEach((entry) => {
      if (entry.isReversed) return;
      if (isCustomer) {
        if (entry.type === 'sale' || entry.type === 'debit') {
          given += entry.amount;
        } else if (
          entry.type === 'payment_received' ||
          entry.type === 'credit'
        ) {
          paid += entry.amount;
        }
      } else {
        // Supplier
        if (entry.type === 'purchase' || entry.type === 'credit') {
          given += entry.amount;
        } else if (entry.type === 'payment_made' || entry.type === 'debit') {
          paid += entry.amount;
        }
      }
    });
    return { totalGiven: given, totalPaid: paid };
  }, [entries, isCustomer]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: LedgerEntry[] } = {};
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    entries.forEach((entry) => {
      const entryDate = entry.date.split('T')[0];
      let label = formatDate(entry.date);
      if (entryDate === todayStr || entry.date.startsWith('2026-10-18')) {
        label = `${t.today.toUpperCase()} · 18 OCTOBER`;
      } else if (
        entryDate === yesterdayStr ||
        entry.date.startsWith('2026-10-17')
      ) {
        label = `${t.yesterday.toUpperCase()} · 17 OCTOBER`;
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(entry);
    });

    return groups;
  }, [entries, t]);

  const handleConfirmReversal = () => {
    if (reversalModalEntry) {
      reverseLedgerEntry(reversalModalEntry.id, reversalReason);
      setReversalModalEntry(null);
      setReversalReason('');
    }
  };

  const getAccountName = (accId: string) => {
    const acc = party.accounts.find((a) => a.id === accId);
    return acc ? acc.name : 'Main Account';
  };

  return (
    <div className="space-y-3.5 pb-24 pt-1 animate-fadeIn">
      {/* Top Bar with Back Arrow */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-700 hover:text-[#0F4A3C] p-1 -ml-1 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <div className="text-left">
            <h1 className="text-lg font-bold text-stone-900 leading-tight">
              {party.name}
            </h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
              {isCustomer ? t.customerAccount : t.supplierAccount}
              {party.companyName ? ` · ${party.companyName}` : ''}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowEditModal(true)}
            title={isCustomer ? t.editCustomer : t.editSupplier}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-stone-200/90 text-stone-700 hover:text-[#0F4A3C] text-xs font-semibold shadow-2xs hover:bg-stone-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#0F4A3C]" />
            <span className="hidden sm:inline">Edit Details</span>
          </button>

          <button
            onClick={() => onOpenStatement(party.id)}
            title="View Consolidated Statement"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-stone-200/90 text-stone-700 hover:text-[#0F4A3C] text-xs font-semibold shadow-2xs hover:bg-stone-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F4A3C]" />
            <span className="hidden sm:inline">Statement</span>
          </button>

          <button
            onClick={() => setShowPartyInfo(!showPartyInfo)}
            className="w-8 h-8 rounded-xl bg-white border border-stone-200/90 text-stone-600 flex items-center justify-center hover:bg-stone-50 text-xs font-bold"
            title="Party details"
          >
            ℹ️
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

      {/* Expandable Party Contact Details */}
      {showPartyInfo && (
        <div className="p-3.5 rounded-2xl bg-white/95 border border-stone-200 text-xs space-y-2.5 animate-fadeIn shadow-xs">
          <div className="flex items-center justify-between font-bold text-stone-900 border-b border-stone-100 pb-2">
            <div>
              <span className="text-sm block">{party.name}</span>
              {party.companyName && (
                <span className="text-xs text-stone-500 font-normal">
                  {party.companyName}
                </span>
              )}
            </div>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              {party.accounts.length} Accounts Configured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>{party.phone}</span>
            </div>
            {party.address && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{party.address}</span>
              </div>
            )}
            {party.email && (
              <div className="flex items-center gap-1.5 truncate col-span-full">
                <span className="text-stone-400">✉️</span>
                <span className="truncate">{party.email}</span>
              </div>
            )}
            {party.notes && (
              <div className="col-span-full text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-100">
                <span className="font-semibold text-stone-700">Notes: </span>
                {party.notes}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPartyInfo(false);
                setShowEditModal(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#0F4A3C] border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Change {isCustomer ? 'Customer' : 'Supplier'} Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPartyInfo(false);
                setShowEditModal(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Data / Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Multi-Account Selector Tabs (Crucial Feature) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
            {t.accounts} ({party.accounts.length})
          </span>
          <button
            onClick={() => onOpenNewAccount(party.id)}
            className="text-xs font-bold text-[#0F4A3C] hover:underline flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" />
            <span>{t.createNewAccount}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Combined Option */}
          <button
            onClick={() => setSelectedAccountId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedAccountId === 'all'
                ? 'bg-[#0F4A3C] text-white shadow-xs'
                : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
            }`}
          >
            {t.combinedAll}
          </button>

          {/* Individual Named Accounts */}
          {party.accounts.map((acc) => {
            const accBal = getAccountBalance(party.id, acc.id);
            const isSelected = selectedAccountId === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0F4A3C] text-white shadow-xs'
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
                }`}
              >
                <span>{acc.name}</span>
                <span
                  className={`text-[10px] font-bold tabular-nums px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : accBal > 0
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {formatPKR(Math.abs(accBal))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Card: Current Balance (Soft Peach/Warm Cream background matching the board) */}
      <div className="rounded-3xl bg-[#FFF5F1] border border-rose-200/70 p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-xs font-bold tracking-wider text-rose-900/80 uppercase">
          <span>
            {selectedAccountId === 'all'
              ? isCustomer
                ? t.currentBalanceDue
                : t.currentBalanceOwed
              : `${getAccountName(selectedAccountId).toUpperCase()} BALANCE`}
          </span>
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
            {currentBalance > 0
              ? isCustomer
                ? `${t.due} from customer`
                : `${t.owed} to supplier`
              : currentBalance < 0
              ? 'Advance Credit'
              : 'Zero Balance'}
          </span>
        </div>

        <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-rose-600 tabular-nums">
          {formatPKR(Math.abs(currentBalance))}
        </div>

        {/* Breakdown of Given vs Paid */}
        <div className="mt-4 pt-3 border-t border-rose-200/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-stone-500 block">
              {isCustomer ? 'Total Billed/Sales' : 'Total Purchases'}
            </span>
            <span className="font-bold text-stone-900 tabular-nums">
              {formatPKR(totalGiven)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-stone-500 block">
              {isCustomer ? 'Total Payments Received' : 'Total Paid'}
            </span>
            <span className="font-bold text-emerald-700 tabular-nums">
              {formatPKR(totalPaid)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Touch Actions: Receive Payment & Add Entry */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() =>
            onOpenReceivePayment(
              party.id,
              selectedAccountId === 'all' ? undefined : selectedAccountId
            )
          }
          className="flex items-center justify-center gap-2 h-13 rounded-2xl bg-[#0F4A3C] text-white font-bold text-sm shadow-md shadow-[#0F4A3C]/20 hover:bg-[#135747] active:scale-[0.98] transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>
            {isCustomer ? t.receivePayment : 'Make Payment'}
          </span>
        </button>

        <button
          onClick={() =>
            onOpenAddEntry(
              party.id,
              selectedAccountId === 'all' ? undefined : selectedAccountId
            )
          }
          className="flex items-center justify-center gap-2 h-13 rounded-2xl bg-white text-stone-800 font-bold text-sm border border-stone-200/90 shadow-xs hover:bg-stone-50 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 text-[#0F4A3C]" />
          <span>{t.addEntry}</span>
        </button>
      </div>

      {/* Transaction History Section matching the design board */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-800 tracking-tight">
            {t.transactionHistory}
          </h2>
          <span className="text-xs text-stone-500">
            {entries.length} transactions
          </span>
        </div>

        {Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center py-10 bg-white/80 rounded-2xl border border-stone-200/70 p-6">
            <CreditCard className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">
              No transactions recorded for this account
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Tap + Add Entry or + Receive Payment to record your first entry.
            </p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([dateGroup, items]) => (
            <div key={dateGroup} className="space-y-1.5">
              {/* Date Group Header */}
              <div className="text-[11px] font-bold text-stone-500 tracking-wider uppercase px-2 pt-1">
                {dateGroup}
              </div>

              {/* Transactions in this group */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-2xs">
                {items.map((entry) => {
                  const isDebit =
                    entry.type === 'sale' ||
                    entry.type === 'debit' ||
                    entry.type === 'purchase';
                  const isPayment =
                    entry.type === 'payment_received' ||
                    entry.type === 'payment_made';
                  const isReversal = entry.type === 'reversal';

                  return (
                    <div
                      key={entry.id}
                      className={`p-3.5 flex items-start justify-between gap-3 hover:bg-stone-50/70 transition-colors ${
                        entry.isReversed ? 'opacity-60 bg-stone-50/50' : ''
                      }`}
                    >
                      {/* Left: Dot & Description */}
                      <div className="flex items-start gap-2.5 min-w-0">
                        {/* Colored bullet dot matching the board */}
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            isPayment
                              ? 'bg-emerald-500'
                              : isReversal
                              ? 'bg-stone-400'
                              : 'bg-rose-500'
                          }`}
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-sm text-stone-900 ${
                                entry.isReversed ? 'line-through text-stone-500' : ''
                              }`}
                            >
                              {entry.description}
                            </span>
                            {entry.isReversed && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-stone-200 text-stone-700">
                                {t.reversed}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{formatTimeOnly(entry.date)}</span>
                            {entry.referenceId && (
                              <>
                                <span>·</span>
                                <span className="font-semibold text-stone-700">
                                  {entry.referenceId}
                                </span>
                              </>
                            )}
                            {selectedAccountId === 'all' && (
                              <>
                                <span>·</span>
                                <span className="text-[#0F4A3C] font-medium bg-emerald-50 px-1.5 py-0.2 rounded-sm">
                                  {entry.accountName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Audit Reversal button */}
                      <div className="text-right shrink-0">
                        <div
                          className={`text-sm sm:text-base font-extrabold tabular-nums ${
                            isPayment
                              ? 'text-emerald-700'
                              : isReversal
                              ? 'text-stone-500'
                              : 'text-rose-600'
                          }`}
                        >
                          {isPayment
                            ? `- ${formatPKR(entry.amount)}`
                            : isReversal
                            ? `- ${formatPKR(entry.amount)}`
                            : `+ ${formatPKR(entry.amount)}`}
                        </div>

                        <div className="flex items-center gap-2 justify-end mt-1">
                          {!entry.isReversed && !entry.reversalOfId && (
                            <button
                              onClick={() => setReversalModalEntry(entry)}
                              title="Reverse entry with audit trail"
                              className="text-[10px] text-stone-600 hover:text-rose-600 hover:underline flex items-center gap-0.5"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>{t.reverse}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setEntryToDelete(entry)}
                            title="Delete this entry permanently"
                            className="text-[10px] text-stone-400 hover:text-rose-600 hover:underline flex items-center gap-0.5"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Entry Deletion Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-3.5">
            <div className="flex items-center gap-2.5 text-rose-600">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base text-stone-900">
                {t.deleteEntry}
              </h3>
            </div>

            <p className="text-xs text-stone-600">
              {t.deleteEntryConfirm}
            </p>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <div className="font-semibold text-stone-900">
                {entryToDelete.description}
              </div>
              <div className="text-stone-600 font-bold">
                Amount: {formatPKR(entryToDelete.amount)}
              </div>
              <div className="text-stone-400 text-[11px]">
                Account: {entryToDelete.accountName} · Date: {formatDate(entryToDelete.date)}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteLedgerEntry(entryToDelete.id);
                  setEntryToDelete(null);
                  setToastFeedback('Transaction entry removed successfully.');
                  setTimeout(() => setToastFeedback(null), 2500);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-Destructive Reversal Modal */}
      {reversalModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base text-stone-900">
                Audit Trail Reversal
              </h3>
            </div>

            <p className="text-xs text-stone-600">
              In accordance with strict ledger audit compliance, financial
              entries are never silently deleted. A reverse entry for{' '}
              <span className="font-bold text-stone-900">
                {formatPKR(reversalModalEntry.amount)}
              </span>{' '}
              will be recorded to neutralize this transaction.
            </p>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <span className="text-stone-500 block">Original Entry:</span>
              <span className="font-semibold text-stone-900">
                {reversalModalEntry.description}
              </span>
              <div className="text-stone-500 mt-1">
                Account: {reversalModalEntry.accountName}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Reason for Reversal (Optional)
              </label>
              <input
                type="text"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="e.g. Return of goods, erroneous entry, wrong account"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0F4A3C]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setReversalModalEntry(null);
                  setReversalReason('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmReversal}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
              >
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Party Modal */}
      {showEditModal && (
        <EditPartyModal
          party={party}
          onClose={() => setShowEditModal(false)}
          onPartyUpdated={() => {
            setShowEditModal(false);
            setToastFeedback(t.customerUpdated);
            setTimeout(() => setToastFeedback(null), 2500);
          }}
          onPartyDeleted={() => {
            setShowEditModal(false);
            onBack();
          }}
        />
      )}
    </div>
  );
};
