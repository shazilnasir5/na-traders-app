import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Party, PartyType } from '../types';
import {
  Users2,
  Building2,
  X,
  Trash2,
  Plus,
  AlertTriangle,
  RotateCcw,
  Check,
  Building,
  Phone,
  MapPin,
  Mail,
  FileText,
} from 'lucide-react';

interface EditPartyModalProps {
  party: Party;
  onClose: () => void;
  onPartyUpdated?: (updated: Party) => void;
  onPartyDeleted?: (partyId: string) => void;
}

export const EditPartyModal: React.FC<EditPartyModalProps> = ({
  party,
  onClose,
  onPartyUpdated,
  onPartyDeleted,
}) => {
  const {
    updateParty,
    deleteParty,
    clearPartyData,
    settings,
    getPartyBalance,
  } = useApp();
  const t = translations[settings.language];

  const [type, setType] = useState<PartyType>(party.type);
  const [name, setName] = useState(party.name);
  const [companyName, setCompanyName] = useState(party.companyName || '');
  const [phone, setPhone] = useState(party.phone);
  const [address, setAddress] = useState(party.address || '');
  const [email, setEmail] = useState(party.email || '');
  const [notes, setNotes] = useState(party.notes || '');

  // Account management state
  const [accounts, setAccounts] = useState(
    party.accounts.map((a) => ({ id: a.id, name: a.name }))
  );
  const [newAccountInput, setNewAccountInput] = useState('');

  // Confirmation states
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmDeleteParty, setConfirmDeleteParty] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const balance = getPartyBalance(party.id);

  const handleAddAccount = () => {
    if (newAccountInput.trim()) {
      setAccounts((prev) => [
        ...prev,
        { id: `acc-${Date.now()}`, name: newAccountInput.trim() },
      ]);
      setNewAccountInput('');
    }
  };

  const handleAccountNameChange = (accId: string, newName: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accId ? { ...a, name: newName } : a))
    );
  };

  const handleRemoveAccount = (accId: string) => {
    if (accounts.length > 1) {
      setAccounts((prev) => prev.filter((a) => a.id !== accId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build updated accounts array
    const now = new Date().toISOString();
    const updatedAccounts = accounts.map((acc, index) => {
      const existing = party.accounts.find((a) => a.id === acc.id);
      return {
        id: acc.id,
        partyId: party.id,
        name: acc.name.trim() || `Account ${index + 1}`,
        isDefault: index === 0,
        createdAt: existing ? existing.createdAt : now,
      };
    });

    const updatedData: Partial<Party> = {
      type,
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      phone: phone.trim() || '0300-0000000',
      address: address.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      accounts: updatedAccounts,
    };

    updateParty(party.id, updatedData);

    const mergedParty: Party = {
      ...party,
      ...updatedData,
      accounts: updatedAccounts,
    };

    if (onPartyUpdated) {
      onPartyUpdated(mergedParty);
    }

    onClose();
  };

  const handleClearHistoryConfirm = () => {
    clearPartyData(party.id);
    setConfirmClearHistory(false);
    setToastMessage('All transaction history cleared for this customer.');
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleDeletePartyConfirm = () => {
    deleteParty(party.id, true);
    setConfirmDeleteParty(false);
    if (onPartyDeleted) {
      onPartyDeleted(party.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 my-auto max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0F4A3C] flex items-center justify-center font-bold">
              {type === 'customer' ? (
                <Users2 className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                {type === 'customer' ? t.editCustomer : t.editSupplier}
              </h3>
              <p className="text-xs text-stone-500">
                Update party info, contact details & manage accounts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Party Type Toggle */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Party Category
            </label>
            <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('customer')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  type === 'customer'
                    ? 'bg-[#0F4A3C] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Customer (گاہک)
              </button>
              <button
                type="button"
                onClick={() => setType('supplier')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  type === 'supplier'
                    ? 'bg-[#0F4A3C] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Supplier (سپلائر)
              </button>
            </div>
          </div>

          {/* Name & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {type === 'customer' ? 'Customer' : 'Supplier'} Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Al-Madina Sweets, Tariq Mehmood"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold focus:outline-hidden focus:border-[#0F4A3C] focus:ring-1 focus:ring-[#0F4A3C]"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Company / Shop Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Bakery & Confectionery"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0F4A3C] focus:ring-1 focus:ring-[#0F4A3C]"
              />
            </div>
          </div>

          {/* Contact Details: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 font-mono focus:outline-hidden focus:border-[#0F4A3C] focus:ring-1 focus:ring-[#0F4A3C]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0F4A3C] focus:ring-1 focus:ring-[#0F4A3C]"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Shop Address / Location
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shop #4, Main Market, Lahore"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0F4A3C] focus:ring-1 focus:ring-[#0F4A3C]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Remarks / Notes
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Credit terms, delivery instructions, reference..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#0F4A3C] focus:ring-1 focus:ring-[#0F4A3C]"
              />
            </div>
          </div>

          {/* Accounts Management */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 block">
                  Named Khata Accounts ({accounts.length})
                </span>
                <span className="text-[11px] text-stone-500">
                  Multiple branches or sub-ledgers for this {type}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {accounts.map((acc, idx) => (
                <div key={acc.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-400 w-4 text-center">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={acc.name}
                    onChange={(e) =>
                      handleAccountNameChange(acc.id, e.target.value)
                    }
                    placeholder="Account name"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-medium text-xs focus:outline-hidden focus:border-[#0F4A3C]"
                  />
                  {accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(acc.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove this account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add another account */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newAccountInput}
                onChange={(e) => setNewAccountInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAccount();
                  }
                }}
                placeholder="+ Add another sub-account (e.g. Warehouse 2)"
                className="flex-1 px-3 py-1.5 rounded-lg border border-dashed border-stone-300 bg-white text-xs focus:outline-hidden focus:border-[#0F4A3C]"
              />
              <button
                type="button"
                onClick={handleAddAccount}
                disabled={!newAccountInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-300 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons: Save & Cancel */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#0F4A3C] text-white font-bold shadow-xs hover:bg-[#135747] active:scale-[0.99] transition-all"
            >
              Save Customer Details
            </button>
          </div>
        </form>

        {/* Danger Zone: Option to Remove Data / Delete Customer */}
        <div className="mt-6 pt-4 border-t border-rose-100 rounded-2xl bg-rose-50/60 p-3.5 border space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Danger Zone · Remove Data</span>
          </div>

          <p className="text-[11px] text-stone-600">
            Options to clear transactions or permanently delete this {type} and their ledger records.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* Clear History Button */}
            {!confirmClearHistory ? (
              <button
                type="button"
                onClick={() => setConfirmClearHistory(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Khata Records</span>
              </button>
            ) : (
              <div className="p-2.5 bg-white rounded-xl border border-rose-300 space-y-2">
                <p className="text-[11px] text-rose-700 font-bold">
                  Wipe all transactions and reset balance to Rs 0?
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfirmClearHistory(false)}
                    className="flex-1 py-1 rounded-lg border border-stone-200 text-[10px] font-bold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearHistoryConfirm}
                    className="flex-1 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                  >
                    Yes, Clear Data
                  </button>
                </div>
              </div>
            )}

            {/* Delete Customer Button */}
            {!confirmDeleteParty ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteParty(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {type === 'customer' ? 'Customer' : 'Supplier'}</span>
              </button>
            ) : (
              <div className="p-2.5 bg-white rounded-xl border border-rose-400 space-y-2">
                <p className="text-[11px] text-rose-800 font-bold">
                  Permanently remove {name} and all ledger history?
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteParty(false)}
                    className="flex-1 py-1 rounded-lg border border-stone-200 text-[10px] font-bold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePartyConfirm}
                    className="flex-1 py-1 rounded-lg bg-rose-700 text-white text-[10px] font-bold hover:bg-rose-800"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
