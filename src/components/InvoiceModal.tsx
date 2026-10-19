import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import { formatPKR, formatDate } from '../utils/formatters';
import {
  Printer,
  Share2,
  CheckCircle2,
  X,
  Building,
  Receipt,
  Download,
  Copy,
} from 'lucide-react';

interface InvoiceModalProps {
  invoiceId: string;
  onClose: () => void;
  onOpenCustomerLedger?: (partyId: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoiceId,
  onClose,
  onOpenCustomerLedger,
}) => {
  const { invoices, businessProfile, updateInvoiceStatus } = useApp();
  const invoice = invoices.find((inv) => inv.id === invoiceId);

  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const isPaid = invoice.status === 'paid';
  const isPartial = invoice.status === 'partial';

  const handlePrint = () => {
    window.print();
  };

  const generateShareText = () => {
    return `*INVOICE: ${invoice.invoiceNumber}*\n*From:* ${businessProfile.name}\n*To:* ${invoice.customerName} (${invoice.accountName})\n*Date:* ${formatDate(invoice.issueDate)}\n-----------------------------\n${invoice.items
      .map(
        (it) =>
          `• ${it.description}: ${it.quantity} × ${formatPKR(it.unitPrice)} = ${formatPKR(it.total)}`
      )
      .join('\n')}\n-----------------------------\n*Total:* ${formatPKR(invoice.totalAmount)}\n*Paid:* ${formatPKR(invoice.paidAmount)}\n*Balance Due:* ${formatPKR(invoice.remainingBalance)}\n\nThank you for doing business with us!`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText());
    const phone = invoice.customerPhone
      ? invoice.customerPhone.replace(/[^0-9]/g, '')
      : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#0F4A3C]">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800'
                  : isPartial
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              title="Print Invoice"
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#0F4A3C] shadow-2xs hover:bg-stone-50 active:scale-95"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleWhatsAppShare}
              title="Share on WhatsApp"
              className="p-2 rounded-xl bg-white border border-stone-200 text-emerald-700 hover:bg-emerald-50 shadow-2xs active:scale-95"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-200/70 text-stone-600 hover:bg-stone-300 active:scale-95 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 space-y-5 text-stone-800 printable-area bg-white">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#0F4A3C]">
                {businessProfile.name}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 max-w-xs">
                {businessProfile.address}
              </p>
              <p className="text-xs text-stone-500">
                Phone: {businessProfile.phone}
              </p>
              {businessProfile.taxNtn && (
                <p className="text-[11px] text-stone-400 font-medium">
                  {businessProfile.taxNtn}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                INVOICE
              </span>
              <span className="text-base font-extrabold text-stone-900 block tabular-nums">
                {invoice.invoiceNumber}
              </span>
              <span className="text-xs text-stone-500 mt-1 block">
                Date: {formatDate(invoice.issueDate)}
              </span>
            </div>
          </div>

          {/* Bill To & Account Details */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs flex justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                BILL TO (CUSTOMER)
              </span>
              <span className="font-extrabold text-stone-900 text-sm mt-0.5 block">
                {invoice.customerName}
              </span>
              {invoice.customerAddress && (
                <span className="text-stone-500 block mt-0.5">
                  {invoice.customerAddress}
                </span>
              )}
              {invoice.customerPhone && (
                <span className="text-stone-500 block">
                  {invoice.customerPhone}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                LEDGER ACCOUNT
              </span>
              <span className="font-bold text-[#0F4A3C] text-xs bg-emerald-100/70 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {invoice.accountName}
              </span>
              <span className="text-[10px] text-stone-600 block mt-1">
                Payment: {invoice.paymentMethod?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[10px]">
                  <th className="py-2 text-left">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2.5 font-semibold text-stone-900">
                      {item.description}
                    </td>
                    <td className="py-2.5 text-center tabular-nums text-stone-600">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-stone-600">
                      {formatPKR(item.unitPrice)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-stone-900 tabular-nums">
                      {formatPKR(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatPKR(invoice.subtotal)}
              </span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Discount</span>
                <span className="font-semibold text-rose-600 tabular-nums">
                  - {formatPKR(invoice.discount)}
                </span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>GST Tax ({invoice.taxRate}%)</span>
                <span className="font-semibold tabular-nums">
                  {formatPKR(invoice.taxAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
              <span className="text-sm font-black text-stone-900">
                Total Amount
              </span>
              <span className="text-base font-black text-[#0F4A3C] tabular-nums">
                {formatPKR(invoice.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between text-emerald-800 font-bold pt-1">
              <span>Amount Paid</span>
              <span className="tabular-nums">
                {formatPKR(invoice.paidAmount)}
              </span>
            </div>

            <div className="flex justify-between font-black text-rose-600 pt-1 border-t border-stone-100">
              <span>Balance Due</span>
              <span className="tabular-nums">
                {formatPKR(invoice.remainingBalance)}
              </span>
            </div>
          </div>

          {/* Notes & Signature */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <div>
              <p className="italic">
                {invoice.notes || 'Goods once sold cannot be returned.'}
              </p>
              <p className="mt-0.5 font-medium text-stone-400">
                Generated via DailyLedger
              </p>
            </div>
            <div className="text-right">
              <div className="w-24 border-b border-stone-300 pb-1 mb-1" />
              <span className="text-[10px] text-stone-400">
                Authorized Signature
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden when printing) */}
        <div className="no-print p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            {onOpenCustomerLedger && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCustomerLedger(invoice.customerId);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
              >
                Open Customer Ledger →
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0F4A3C] text-white text-xs font-bold hover:bg-[#135747]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
