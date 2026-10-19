import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Globe, RefreshCw, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onOpenSettings: () => void;
  onOpenVerification?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenVerification,
}) => {
  const { settings, setLanguage, triggerSync } = useApp();
  const t = translations[settings.language];
  const isUrdu = settings.language === 'ur';

  const toggleLanguage = () => {
    setLanguage(isUrdu ? 'en' : 'ur');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-stone-200/80 px-4 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#0F4A3C] text-white flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm shadow-[#0F4A3C]/20 shrink-0">
            NA
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-[#0F4A3C] leading-none">
                {t.appName}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-stone-500 uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200/60">
                PKR · {settings.language.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 truncate max-w-[200px] sm:max-w-xs mt-0.5">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Workflow Test Verification button */}
          {onOpenVerification && (
            <button
              onClick={onOpenVerification}
              title="Verify Required 7-Step Workflow"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Verify Workflow</span>
              <span className="md:hidden">Verify</span>
            </button>
          )}

          {/* Sync status button */}
          <button
            onClick={triggerSync}
            title={settings.syncStatus === 'syncing' ? t.syncing : t.synced}
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-stone-500 ${
                settings.syncStatus === 'syncing' ? 'animate-spin text-[#0F4A3C]' : ''
              }`}
            />
            <span className="hidden sm:inline">
              {settings.syncStatus === 'syncing' ? t.syncing : t.synced}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#0F4A3C]/10 text-[#0F4A3C] hover:bg-[#0F4A3C]/15 active:scale-95 transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:scale-95 transition-all"
            aria-label="Settings"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
