import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { PartyType } from '../types';
import { Users2, Building2, Plus, Trash2, X } from 'lucide-react';

interface AddPartyModalProps {
  initialType?: PartyType;
  onClose: () => void;
  onPartyCreated?: (partyId: string) => void;
}

export const AddPartyModal: React.FC<AddPartyModalProps> = ({
  initialType = 'customer',
  onClose,
  onPartyCreated,
}) => {
  const { addParty, settings } = useApp();
  const t = translations[settings.language];

  const [type, setType] = useState<PartyType>(initialType);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Initial named accounts (starts with 2 accounts for easy workflow verification!)
  const [accounts, setAccounts] = useState<string[]>([
    'Main Store',
    'Credit / Wholesale',
  ]);
  const [newAccountInput, setNewAccountInput] = useState('');

  const handleAddAccount = () => {
    if (newAccountInput.trim()) {
      setAccounts((prev) => [...prev, newAccountInput.trim()]);
      setNewAccountInput('');
    }
  };

  const handleRemoveAccount = (index: number) => {
    if (accounts.length > 1) {
      setAccounts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = addParty(
      {
        type,
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        phone: phone.trim() || '0300-0000000',
        address: address.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      accounts.length > 0 ? accounts : ['Main Account']
    );

    if (onPartyCreated) {
      onPartyCreated(created.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F4A3C] flex items-center justify-center font-bold">
              {type === 'customer' ? (
                <Users2 className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Add New {type === 'customer' ? 'Customer' : 'Supplier'}
              </h3>
              <p className="text-xs text-stone-500">
                Create party profile & named accounts
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

        {/* Party Type Switcher */}
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
            Customer
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
            Supplier
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {t.customerName} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kamran Textiles, Tariq Mahmood"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-semibold text-sm focus:outline-hidden focus:border-[#0F4A3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Company / Trade Name
              </label>
              <input
                type="text"
                placeholder="e.g. Kamran Traders Pvt Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {t.phoneNumber}
              </label>
              <input
                type="text"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {t.address}
            </label>
            <input
              type="text"
              placeholder="e.g. Shop 5, Anarkali Bazaar, Lahore"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

          {/* Multiple Named Accounts Setup */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-800 block text-xs">
                  Named Sub-Accounts (Separate Ledgers)
                </span>
                <span className="text-[10px] text-stone-500">
                  Keep transactions and balances separate for each branch or account
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {accounts.map((acc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-xs"
                >
                  <span className="font-semibold text-stone-800">
                    {index + 1}. {acc}
                  </span>
                  {accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(index)}
                      className="text-stone-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new account input */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                placeholder="New account name (e.g. Warehouse, Branch 2)..."
                value={newAccountInput}
                onChange={(e) => setNewAccountInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAccount();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
              />
              <button
                type="button"
                onClick={handleAddAccount}
                className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-300"
              >
                + Add
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Remarks / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Credit limit Rs 50,000, 15 days terms"
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
              {t.save} Party & Accounts
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
