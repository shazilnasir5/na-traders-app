/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SalesView } from './components/SalesView';
import { InvoicesView } from './components/InvoicesView';
import { KhataView } from './components/KhataView';
import { LedgerDetailView } from './components/LedgerDetailView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { InvoiceModal } from './components/InvoiceModal';
import { AddPartyModal } from './components/AddPartyModal';
import { AddAccountModal } from './components/AddAccountModal';
import { AddProductModal } from './components/AddProductModal';
import { AddEntryModal } from './components/AddEntryModal';
import { ReceivePaymentModal } from './components/ReceivePaymentModal';
import { StatementModal } from './components/StatementModal';
import { WorkflowVerificationModal } from './components/WorkflowVerificationModal';
import { PartyType } from './types';

function MainApp() {
  const { settings } = useApp();
  const isUrdu = settings.language === 'ur';

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low_stock'>('all');

  // Modal States
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [showAddPartyModal, setShowAddPartyModal] = useState<PartyType | null>(null);
  const [addAccountPartyId, setAddAccountPartyId] = useState<string | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [addEntryParams, setAddEntryParams] = useState<{
    partyId?: string;
    accountId?: string;
  } | null>(null);
  const [receivePaymentParams, setReceivePaymentParams] = useState<{
    partyId?: string;
    accountId?: string;
  } | null>(null);
  const [activeStatementPartyId, setActiveStatementPartyId] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Navigate to customer detail ledger
  const handleSelectParty = (partyId: string) => {
    setSelectedPartyId(partyId);
  };

  const handleBackFromLedger = () => {
    setSelectedPartyId(null);
  };

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#F4F6F2] text-[#192420] flex flex-col font-sans transition-colors ${
        isUrdu ? 'lang-ur' : ''
      }`}
    >
      {/* Top Header Bar */}
      <Header
        activeTab={activeTab}
        onOpenSettings={() => {
          setSelectedPartyId(null);
          setActiveTab('settings');
        }}
        onOpenVerification={() => setShowVerificationModal(true)}
      />

      {/* Main Content Area: Responsive mobile-first canvas */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3 sm:px-4 pt-2">
        {selectedPartyId ? (
          <LedgerDetailView
            partyId={selectedPartyId}
            onBack={handleBackFromLedger}
            onOpenReceivePayment={(pId, accId) =>
              setReceivePaymentParams({ partyId: pId, accountId: accId })
            }
            onOpenAddEntry={(pId, accId) =>
              setAddEntryParams({ partyId: pId, accountId: accId })
            }
            onOpenStatement={(pId) => setActiveStatementPartyId(pId)}
            onOpenNewAccount={(pId) => setAddAccountPartyId(pId)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateToSale={() => setActiveTab('sales')}
                onNavigateToAddProduct={() => setShowAddProductModal(true)}
                onNavigateToInvoice={() => setActiveTab('invoices')}
                onNavigateToReceivePayment={() =>
                  setReceivePaymentParams({})
                }
                onNavigateToKhata={() => setActiveTab('khata')}
                onNavigateToInventory={(filter) => {
                  setInventoryFilter(filter || 'all');
                  setActiveTab('inventory');
                }}
                onSelectCustomer={(pId) => handleSelectParty(pId)}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                initialFilter={inventoryFilter}
                onOpenAddProduct={() => setShowAddProductModal(true)}
              />
            )}

            {activeTab === 'sales' && (
              <SalesView
                onOpenInvoiceModal={(invId) => setActiveInvoiceId(invId)}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoicesView
                onSelectInvoice={(invId) => setActiveInvoiceId(invId)}
                onOpenCreateInvoice={() => setActiveTab('sales')}
              />
            )}

            {activeTab === 'khata' && (
              <KhataView
                onSelectParty={handleSelectParty}
                onOpenAddParty={(type) => setShowAddPartyModal(type)}
                onOpenAddEntry={(pId) => setAddEntryParams({ partyId: pId })}
              />
            )}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'settings' && (
              <SettingsView
                onOpenVerification={() => setShowVerificationModal(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Navigation (hidden during active invoice/receipt print) */}
      <BottomNav
        activeTab={selectedPartyId ? 'khata' : activeTab}
        onSelectTab={(tab) => {
          setSelectedPartyId(null);
          setInventoryFilter('all');
          setActiveTab(tab);
        }}
      />

      {/* Modals & Dialogs */}
      {activeInvoiceId && (
        <InvoiceModal
          invoiceId={activeInvoiceId}
          onClose={() => setActiveInvoiceId(null)}
          onOpenCustomerLedger={(pId) => {
            setActiveInvoiceId(null);
            setSelectedPartyId(pId);
          }}
        />
      )}

      {showAddPartyModal && (
        <AddPartyModal
          initialType={showAddPartyModal}
          onClose={() => setShowAddPartyModal(null)}
          onPartyCreated={(pId) => {
            setShowAddPartyModal(null);
            setSelectedPartyId(pId);
          }}
        />
      )}

      {addAccountPartyId && (
        <AddAccountModal
          partyId={addAccountPartyId}
          onClose={() => setAddAccountPartyId(null)}
        />
      )}

      {showAddProductModal && (
        <AddProductModal onClose={() => setShowAddProductModal(false)} />
      )}

      {addEntryParams !== null && (
        <AddEntryModal
          initialPartyId={addEntryParams.partyId}
          initialAccountId={addEntryParams.accountId}
          onClose={() => setAddEntryParams(null)}
        />
      )}

      {receivePaymentParams !== null && (
        <ReceivePaymentModal
          initialPartyId={receivePaymentParams.partyId}
          initialAccountId={receivePaymentParams.accountId}
          onClose={() => setReceivePaymentParams(null)}
        />
      )}

      {activeStatementPartyId && (
        <StatementModal
          partyId={activeStatementPartyId}
          onClose={() => setActiveStatementPartyId(null)}
        />
      )}

      {showVerificationModal && (
        <WorkflowVerificationModal
          onClose={() => setShowVerificationModal(false)}
          onOpenCustomerProfile={(pId) => {
            setShowVerificationModal(false);
            setSelectedPartyId(pId);
          }}
          onOpenStatement={(pId) => {
            setShowVerificationModal(false);
            setActiveStatementPartyId(pId);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
