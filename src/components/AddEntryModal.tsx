import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { LedgerEntryType, PaymentMethod } from '../types';
import { Plus, X, BookOpen, Layers } from 'lucide-react';

interface AddEntryModalProps {
  initialPartyId?: string;
  initialAccountId?: string;
  onClose: () => void;
  onEntryAdded?: () => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  initialPartyId,
  initialAccountId,
  onClose,
  onEntryAdded,
}) => {
  const { parties, addLedgerEntry, settings } = useApp();
  const t = translations[settings.language];

  const [selectedPartyId, setSelectedPartyId] = useState<string>(
    initialPartyId || parties[0]?.id || ''
  );

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    initialAccountId || selectedParty?.accounts[0]?.id || ''
  );

  const handlePartyChange = (id: string) => {
    setSelectedPartyId(id);
    const p = parties.find((party) => party.id === id);
    if (p && p.accounts.length > 0) {
      setSelectedAccountId(p.accounts[0].id);
    }
  };

  const isCustomer = selectedParty?.type !== 'supplier';

  const [entryType, setEntryType] = useState<LedgerEntryType>(
    isCustomer ? 'payment_received' : 'payment_made'
  );
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId || !selectedAccountId || !amount) return;

    addLedgerEntry({
      partyId: selectedPartyId,
      accountId: selectedAccountId,
      type: entryType,
      amount: Number(amount),
      date: new Date(date).toISOString(),
      description:
        description.trim() ||
        `${entryType.replace('_', ' ').toUpperCase()} · ${formatEntryLabel(entryType)}`,
      referenceId: referenceId.trim() || undefined,
      paymentMethod,
    });

    if (onEntryAdded) {
      onEntryAdded();
    }
    onClose();
  };

  const formatEntryLabel = (type: LedgerEntryType) => {
    switch (type) {
      case 'sale':
        return 'Sale (Customer owes you more)';
      case 'purchase':
        return 'Purchase (You owe supplier more)';
      case 'payment_received':
        return 'Payment Received (Customer paid you)';
      case 'payment_made':
        return 'Payment Made (You paid supplier)';
      case 'credit':
        return 'Credit (+)';
      case 'debit':
        return 'Debit (-)';
      case 'adjustment':
        return 'Balance Adjustment';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F4A3C] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                {t.addEntry}
              </h3>
              <p className="text-xs text-stone-500">
                Manual ledger entry with audit trail
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

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Party Selector */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Select Customer or Supplier *
            </label>
            <select
              value={selectedPartyId}
              onChange={(e) => handlePartyChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold bg-white"
            >
              <optgroup label="Customers">
                {parties
                  .filter((p) => p.type === 'customer')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.companyName ? `(${p.companyName})` : ''}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Suppliers">
                {parties
                  .filter((p) => p.type === 'supplier')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Account Selector */}
          {selectedParty && (
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Specific Account *
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold bg-white"
              >
                {selectedParty.accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Entry Type */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Entry Type *
            </label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as LedgerEntryType)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold bg-white text-stone-900"
            >
              {isCustomer ? (
                <>
                  <option value="payment_received">
                    Payment Received (- Due decreases)
                  </option>
                  <option value="sale">
                    Sale / Goods Given (+ Due increases)
                  </option>
                  <option value="credit">Credit Note (- Due decreases)</option>
                  <option value="debit">Debit Note (+ Due increases)</option>
                  <option value="adjustment">
                    Balance Adjustment (+ / -)
                  </option>
                </>
              ) : (
                <>
                  <option value="payment_made">
                    Payment Made (- Owed decreases)
                  </option>
                  <option value="purchase">
                    Purchase / Stock Received (+ Owed increases)
                  </option>
                  <option value="debit">Debit Note (- Owed decreases)</option>
                  <option value="credit">Credit Note (+ Owed increases)</option>
                  <option value="adjustment">
                    Balance Adjustment (+ / -)
                  </option>
                </>
              )}
            </select>
          </div>

          {/* Amount & Method */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Amount (PKR) *
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="Rs 0"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-extrabold text-sm text-[#0F4A3C]"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white capitalize"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank / Raast</option>
                <option value="other">Cheque / Other</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {t.date} & Time
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
            />
          </div>

          {/* Description & Reference */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Description / Reason *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Counter cash, Goods dispatch, Monthly settlement"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Invoice or Receipt # (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. INV-1043 or REC-590"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

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
              Record Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
