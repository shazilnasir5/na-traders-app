import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/formatters';
import { PaymentMethod } from '../types';
import { Wallet, X, CheckCircle2 } from 'lucide-react';

interface ReceivePaymentModalProps {
  initialPartyId?: string;
  initialAccountId?: string;
  onClose: () => void;
  onPaymentRecorded?: () => void;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  initialPartyId,
  initialAccountId,
  onClose,
  onPaymentRecorded,
}) => {
  const { parties, receivePayment, makePayment, getAccountBalance, settings } =
    useApp();
  const t = translations[settings.language];

  const [selectedPartyId, setSelectedPartyId] = useState<string>(
    initialPartyId || parties[0]?.id || ''
  );

  const party = parties.find((p) => p.id === selectedPartyId);
  const isCustomer = party?.type !== 'supplier';

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    initialAccountId || party?.accounts[0]?.id || ''
  );

  const handlePartyChange = (id: string) => {
    setSelectedPartyId(id);
    const p = parties.find((item) => item.id === id);
    if (p && p.accounts.length > 0) {
      setSelectedAccountId(p.accounts[0].id);
    }
  };

  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');

  const currentAccBal =
    party && selectedAccountId
      ? getAccountBalance(party.id, selectedAccountId)
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId || !selectedAccountId || !amount) return;

    if (isCustomer) {
      receivePayment({
        partyId: selectedPartyId,
        accountId: selectedAccountId,
        amount: Number(amount),
        paymentMethod,
        referenceId: referenceId.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      makePayment({
        partyId: selectedPartyId,
        accountId: selectedAccountId,
        amount: Number(amount),
        paymentMethod,
        referenceId: referenceId.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    if (onPaymentRecorded) {
      onPaymentRecorded();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F4A3C] flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                {isCustomer ? t.receivePayment : 'Make Supplier Payment'}
              </h3>
              <p className="text-xs text-stone-500">
                Direct balance credit to account
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
              Select {isCustomer ? 'Customer' : 'Supplier'} *
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
          {party && (
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Account to Credit *
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold bg-white"
              >
                {party.accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-between items-center text-[11px] text-stone-500 mt-1">
                <span>Account Current Due:</span>
                <span className="font-bold text-rose-600 tabular-nums">
                  {formatPKR(Math.abs(currentAccBal))}
                </span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-stone-700">Amount (PKR) *</label>
              {currentAccBal > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentAccBal)}
                  className="text-[10px] font-bold text-emerald-800 underline hover:text-emerald-950"
                >
                  Pay Full Balance
                </button>
              )}
            </div>
            <input
              type="number"
              min="1"
              required
              placeholder="Rs 0"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-extrabold text-base text-[#0F4A3C] tabular-nums"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
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

          {/* Reference # */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Receipt # / Bank Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Raast Ref 849204 or Cash Receipt"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Paid at shop counter by Bilal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
