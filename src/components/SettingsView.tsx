import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import {
  Building2,
  Globe,
  Coins,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  onOpenVerification?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenVerification,
}) => {
  const {
    businessProfile,
    settings,
    setLanguage,
    updateBusinessProfile,
    updateSettings,
    resetDemoData,
    clearAllCustomerData,
    clearAllData,
    backupData,
    restoreData,
    triggerSync,
  } = useApp();

  const t = translations[settings.language];
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState(businessProfile);
  const [backupCopied, setBackupCopied] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<'clearCustomers' | 'clearAll' | 'resetDemo' | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    const dataStr = backupData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `natraders-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupCopied(true);
    setTimeout(() => setBackupCopied(false), 3000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = restoreData(content);
      if (success) {
        setRestoreFeedback('Data restored successfully!');
      } else {
        setRestoreFeedback('Error: Invalid backup file format.');
      }
      setTimeout(() => setRestoreFeedback(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(profileForm);
    setShowProfileModal(false);
  };

  return (
    <div className="space-y-4 pb-24 pt-2 animate-fadeIn">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
          {t.settings}
        </h1>
        <p className="text-xs text-stone-500">
          Profile, localization, backup and cloud sync
        </p>
      </div>

      {/* Business Section matching design board */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-2">
          BUSINESS
        </span>

        <div
          onClick={() => {
            setProfileForm(businessProfile);
            setShowProfileModal(true);
          }}
          className="p-4 rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-stone-300 transition-all active:scale-[0.99]"
        >
          <div>
            <h3 className="font-bold text-sm text-stone-900">
              {t.businessProfile}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {businessProfile.name}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>
      </div>

      {/* Preferences Section matching design board */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-2">
          PREFERENCES
        </span>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {/* Currency */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-stone-900 block">
                {t.currency}
              </span>
              <span className="text-xs text-stone-500">
                Pakistani Rupee formatting
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200/60">
              <Coins className="w-3.5 h-3.5 text-[#0F4A3C]" />
              <span>PKR · Rs</span>
            </div>
          </div>

          {/* Language Selector */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-stone-900 block">
                {t.language}
              </span>
              <span className="text-xs text-stone-500">
                English / اردو (Bilingual UI)
              </span>
            </div>
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.language === 'en'
                    ? 'bg-white text-[#0F4A3C] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ur')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.language === 'ur'
                    ? 'bg-[#0F4A3C] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                اردو
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Your Data Section matching design board */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-2">
          YOUR DATA
        </span>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {/* Backup & Export */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-stone-900 block">
                {t.backupExport}
              </span>
              <span className="text-xs text-stone-500">
                JSON snapshots of all ledgers and stock
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-[#0F4A3C] font-bold text-xs hover:bg-stone-50 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-200 cursor-pointer active:scale-95 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Offline & Sync Status */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-stone-900 block">
                {t.offlineSync}
              </span>
              <span className="text-xs text-stone-500">
                Full offline functionality enabled
              </span>
            </div>
            <button
              onClick={triggerSync}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-emerald-600 ${
                  settings.syncStatus === 'syncing' ? 'animate-spin' : ''
                }`}
              />
              <span>{t.synced}</span>
            </button>
          </div>
        </div>

        {/* Feedback messages */}
        {backupCopied && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Backup JSON downloaded successfully.</span>
          </div>
        )}

        {restoreFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{restoreFeedback}</span>
          </div>
        )}
      </div>

      {/* Verification & Testing Helper */}
      {onOpenVerification && (
        <div className="p-4 rounded-3xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Prompt Workflow Verification</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full">
              7/7 Steps
            </span>
          </div>
          <p className="text-xs text-emerald-800">
            Run the automated end-to-end verification verifying two-account
            customers, partial payments, isolated balances, invoices, and
            consolidated reports.
          </p>
          <button
            onClick={onOpenVerification}
            className="w-full py-2.5 rounded-xl bg-[#0F4A3C] text-white text-xs font-bold shadow-xs hover:bg-[#135747] active:scale-95 transition-all"
          >
            Launch Interactive Verification Modal
          </button>
        </div>
      )}

      {/* Data Management & Removal Options */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-2">
          DATA MANAGEMENT & REMOVAL
        </span>

        {actionSuccessMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {/* Clear Customer & Khata Data */}
          <div className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
            <div className="space-y-0.5 max-w-[70%]">
              <span className="font-bold text-sm text-stone-900 block flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-amber-600" />
                Clear Customer & Khata Data
              </span>
              <span className="text-xs text-stone-500">
                Removes all customers, suppliers, khata ledger entries, sales and invoices. Keeps your product catalog and business profile.
              </span>
            </div>
            <button
              onClick={() => setConfirmModal('clearCustomers')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-50 active:scale-95 transition-all shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          {/* Wipe All Data (Fresh Start) */}
          <div className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
            <div className="space-y-0.5 max-w-[70%]">
              <span className="font-bold text-sm text-rose-600 block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Wipe All Data (Fresh Start)
              </span>
              <span className="text-xs text-stone-500">
                Permanently wipes all customer data, transactions, and product items for a complete blank slate.
              </span>
            </div>
            <button
              onClick={() => setConfirmModal('clearAll')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-300 text-rose-600 text-xs font-bold hover:bg-rose-50 active:scale-95 transition-all shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
            <div className="space-y-0.5 max-w-[70%]">
              <span className="font-bold text-sm text-stone-800 block">
                Reset Demo Data
              </span>
              <span className="text-xs text-stone-500">
                Restore sample figures from the N.A Traders design board
              </span>
            </div>
            <button
              onClick={() => setConfirmModal('resetDemo')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 active:scale-95 transition-all shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* About / Help */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-stone-900 block">
                {t.helpSupport}
              </span>
              <span className="text-xs text-stone-500">
                N.A Traders Ledger v1.0 · Designed for Pakistani SMEs
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
        </div>
      </div>

      {/* Business Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900">
                Edit Business Profile
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.ownerName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, ownerName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Store / Office Address
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Sales Tax NTN / STRN (Optional)
                </label>
                <input
                  type="text"
                  value={profileForm.taxNtn}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, taxNtn: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0F4A3C] text-white font-bold shadow-xs hover:bg-[#135747]"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Data Removal & Reset */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              {confirmModal === 'resetDemo' ? (
                <RotateCcw className="w-6 h-6 text-stone-700" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              )}
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-stone-900">
                {confirmModal === 'clearCustomers' && 'Clear Customer & Khata Data?'}
                {confirmModal === 'clearAll' && 'Wipe All Data (Fresh Start)?'}
                {confirmModal === 'resetDemo' && 'Restore Demo Figures?'}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {confirmModal === 'clearCustomers' &&
                  'This will permanently remove all customers, suppliers, accounts, khata ledger entries, sales, and invoices. Your product catalog and business profile will remain intact.'}
                {confirmModal === 'clearAll' &&
                  'This will completely erase ALL records: customers, suppliers, ledgers, invoices, and product inventory items. You will start with a 100% clean slate.'}
                {confirmModal === 'resetDemo' &&
                  'This will restore the original sample figures and bakery inventory items from the N.A Traders design board.'}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-700 text-xs hover:bg-stone-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal === 'clearCustomers') {
                    clearAllCustomerData();
                    setActionSuccessMsg('All customer records and khata ledgers have been removed.');
                  } else if (confirmModal === 'clearAll') {
                    clearAllData();
                    setActionSuccessMsg('All application data has been wiped. Clean slate ready.');
                  } else if (confirmModal === 'resetDemo') {
                    resetDemoData();
                    setActionSuccessMsg('Sample demo figures restored successfully.');
                  }
                  setConfirmModal(null);
                  setTimeout(() => setActionSuccessMsg(null), 3500);
                }}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all ${
                  confirmModal === 'resetDemo'
                    ? 'bg-[#0F4A3C] hover:bg-[#135747]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmModal === 'clearCustomers' && 'Yes, Remove Data'}
                {confirmModal === 'clearAll' && 'Yes, Wipe Everything'}
                {confirmModal === 'resetDemo' && 'Yes, Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
