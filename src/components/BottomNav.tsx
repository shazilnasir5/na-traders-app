import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users2,
  BarChart3,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'inventory'
  | 'sales'
  | 'invoices'
  | 'khata'
  | 'reports'
  | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { settings } = useApp();
  const t = translations[settings.language];

  const tabs: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'sales', label: t.sales, icon: ShoppingCart },
    { id: 'invoices', label: t.invoices, icon: FileText },
    { id: 'khata', label: t.khata, icon: Users2 },
    { id: 'reports', label: t.reports, icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-200/80 shadow-lg shadow-stone-900/5 transition-all">
      <div className="max-w-md mx-auto grid grid-cols-6 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-all relative ${
                isActive
                  ? 'text-[#0F4A3C] font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#0F4A3C]/10 scale-105' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-2'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 truncate max-w-full px-0.5 ${
                  isActive ? 'font-bold text-[#0F4A3C]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#0F4A3C] absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
