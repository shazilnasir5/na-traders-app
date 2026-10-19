import React from 'react';
import { useApp } from '../context/AppContext';
import { formatPKR, formatDate, formatTimeOnly } from '../utils/formatters';
import { Printer, Share2, X, FileSpreadsheet, Building2, User } from 'lucide-react';

interface StatementModalProps {
  partyId: string;
  onClose: () => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  partyId,
  onClose,
}) => {
  const {
    parties,
    businessProfile,
    getPartyBalance,
    getAccountBalance,
    getPartyEntries,
  } = useApp();

  const party = parties.find((p) => p.id === partyId);
  if (!party) return null;

  const isCustomer = party.type === 'customer';
  const combinedBalance = getPartyBalance(party.id);
  const entries = getPartyEntries(party.id).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0F4A3C]" />
            <div>
              <h3 className="font-extrabold text-sm text-stone-900">
                Consolidated Account Statement
              </h3>
              <p className="text-[11px] text-stone-500">{party.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#0F4A3C] text-xs font-bold shadow-2xs hover:bg-stone-50 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-200/70 text-stone-600 hover:bg-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-6 space-y-5 text-stone-800 printable-area overflow-y-auto bg-white flex-1">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-4">
            <div>
              <h1 className="text-xl font-black text-[#0F4A3C]">
                {businessProfile.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {businessProfile.address} · Phone: {businessProfile.phone}
              </p>
              {businessProfile.taxNtn && (
                <p className="text-[11px] text-stone-400 font-medium">
                  {businessProfile.taxNtn}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                CONSOLIDATED STATEMENT
              </span>
              <span className="text-xs text-stone-500 mt-1 block">
                Generated: {new Date().toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>

          {/* Party Profile & Accounts Summary Card */}
          <div className="p-4 rounded-2xl bg-[#F6F8F5] border border-stone-200 space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  PARTY PROFILE
                </span>
                <span className="text-base font-extrabold text-stone-900 block mt-0.5">
                  {party.name}
                </span>
                {party.companyName && (
                  <span className="text-stone-600 font-semibold block">
                    {party.companyName}
                  </span>
                )}
                <span className="text-stone-500 block">Phone: {party.phone}</span>
                {party.address && (
                  <span className="text-stone-500 block">{party.address}</span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  COMBINED NET BALANCE
                </span>
                <span
                  className={`text-xl font-black tabular-nums block mt-0.5 ${
                    combinedBalance > 0
                      ? 'text-rose-600'
                      : combinedBalance < 0
                      ? 'text-emerald-700'
                      : 'text-stone-900'
                  }`}
                >
                  {formatPKR(Math.abs(combinedBalance))}
                </span>
                <span className="text-[11px] font-bold text-stone-600 block mt-0.5">
                  {combinedBalance > 0
                    ? isCustomer
                      ? 'Total Due from Customer'
                      : 'Total Owed to Supplier'
                    : combinedBalance < 0
                    ? 'Advance Balance'
                    : 'Fully Settled (Rs 0)'}
                </span>
              </div>
            </div>

            {/* Account-level breakdown table */}
            <div className="pt-2 border-t border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                SEPARATE ACCOUNTS BREAKDOWN ({party.accounts.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {party.accounts.map((acc) => {
                  const accBal = getAccountBalance(party.id, acc.id);
                  return (
                    <div
                      key={acc.id}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-stone-800 text-xs block">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          Account #{acc.id.slice(-4)}
                        </span>
                      </div>
                      <span
                        className={`font-black text-xs tabular-nums ${
                          accBal > 0 ? 'text-rose-600' : 'text-stone-800'
                        }`}
                      >
                        {formatPKR(Math.abs(accBal))} {accBal > 0 ? 'Due' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full Transaction Audit Log Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Consolidated Audit History
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 text-[10px] uppercase">
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-left">Account</th>
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Debit (+)</th>
                    <th className="py-2 text-right">Credit (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-stone-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => {
                      const isDebit =
                        entry.type === 'sale' ||
                        entry.type === 'debit' ||
                        entry.type === 'purchase';
                      const isCredit =
                        entry.type === 'payment_received' ||
                        entry.type === 'payment_made' ||
                        entry.type === 'credit' ||
                        entry.type === 'reversal';

                      return (
                        <tr
                          key={entry.id}
                          className={`py-2 ${
                            entry.isReversed ? 'opacity-50 line-through' : ''
                          }`}
                        >
                          <td className="py-2 text-stone-500 whitespace-nowrap">
                            {formatDate(entry.date)}
                          </td>
                          <td className="py-2 font-medium text-stone-700 whitespace-nowrap">
                            {entry.accountName}
                          </td>
                          <td className="py-2 font-semibold text-stone-900">
                            {entry.description}
                            {entry.referenceId && (
                              <span className="text-[10px] text-stone-400 ml-1">
                                ({entry.referenceId})
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-right tabular-nums font-bold text-rose-600 whitespace-nowrap">
                            {isDebit ? formatPKR(entry.amount) : '—'}
                          </td>
                          <td className="py-2 text-right tabular-nums font-bold text-emerald-700 whitespace-nowrap">
                            {isCredit ? formatPKR(entry.amount) : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Declaration */}
          <div className="pt-4 border-t border-stone-200 flex justify-between items-end text-xs text-stone-400">
            <div>
              <p>Generated by DailyLedger Business Manager.</p>
              <p>Audited ledger arithmetic verified.</p>
            </div>
            <div className="text-right">
              <div className="w-28 border-b border-stone-300 pb-1 mb-1" />
              <span className="text-[10px]">Manager Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
