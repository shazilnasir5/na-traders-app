import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Plus, X, Layers } from 'lucide-react';

interface AddAccountModalProps {
  partyId: string;
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  partyId,
  onClose,
}) => {
  const { parties, addPartyAccount, settings } = useApp();
  const t = translations[settings.language];
  const party = parties.find((p) => p.id === partyId);

  const [accountName, setAccountName] = useState('');
  const [notes, setNotes] = useState('');

  if (!party) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;

    addPartyAccount(partyId, accountName.trim(), notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F4A3C] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Create New Sub-Account
              </h3>
              <p className="text-[11px] text-stone-500">For {party.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-600">
          Transactions and balance in this account will be kept 100% separate
          from other accounts, while rolling up into {party.name}’s consolidated
          total.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Account Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Warehouse Account, Branch 2, Credit Line"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold focus:outline-hidden focus:border-[#0F4A3C]"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. For bulk orders dispatched to depot"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-stone-300 font-bold text-stone-700"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#0F4A3C] text-white font-bold shadow-xs hover:bg-[#135747]"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
