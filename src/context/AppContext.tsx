import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialBusinessProfile,
  initialInvoices,
  initialLedgerEntries,
  initialParties,
  initialProducts,
  initialSales,
  initialSettings,
  demoBusinessProfile,
  demoInvoices,
  demoLedgerEntries,
  demoParties,
  demoProducts,
  demoSales,
  demoSettings,
} from '../data/initialData';
import {
  AppSettings,
  BusinessProfile,
  Invoice,
  LedgerEntry,
  LedgerEntryType,
  Party,
  PartyAccount,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
} from '../types';
import { getEntryDelta } from '../utils/formatters';

interface AppContextType {
  // Data
  parties: Party[];
  products: Product[];
  sales: Sale[];
  invoices: Invoice[];
  ledgerEntries: LedgerEntry[];
  businessProfile: BusinessProfile;
  settings: AppSettings;

  // Actions
  addParty: (
    party: Omit<Party, 'id' | 'createdAt' | 'accounts'>,
    accountNames?: string[]
  ) => Party;
  updateParty: (id: string, updates: Partial<Party>) => void;
  deleteParty: (id: string, deleteAssociatedData?: boolean) => void;
  clearPartyData: (partyId: string) => void;
  addPartyAccount: (
    partyId: string,
    name: string,
    notes?: string
  ) => PartyAccount;
  updatePartyAccount: (
    partyId: string,
    accountId: string,
    name: string,
    notes?: string
  ) => void;
  deletePartyAccount: (partyId: string, accountId: string) => void;
  deleteLedgerEntry: (entryId: string) => void;
  deleteSale: (saleId: string) => void;
  deleteInvoice: (invoiceId: string) => void;
  clearAllCustomerData: () => void;
  clearAllData: () => void;
  
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  archiveProduct: (id: string) => void;
  adjustStock: (productId: string, quantity: number, reason?: string) => void;

  addSale: (saleData: {
    customerId: string;
    accountId: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    generateInvoice?: boolean;
    date?: string;
  }) => { sale: Sale; invoice?: Invoice };

  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status'], paidAmount?: number) => void;

  addLedgerEntry: (entry: {
    partyId: string;
    accountId: string;
    type: LedgerEntryType;
    amount: number;
    date?: string;
    description: string;
    referenceId?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }) => LedgerEntry;

  reverseLedgerEntry: (entryId: string, reason?: string) => LedgerEntry | null;

  receivePayment: (params: {
    partyId: string;
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    referenceId?: string;
    date?: string;
  }) => LedgerEntry;

  makePayment: (params: {
    partyId: string;
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    referenceId?: string;
    date?: string;
  }) => LedgerEntry;

  // Calculations & Selectors
  getAccountBalance: (partyId: string, accountId: string) => number;
  getPartyBalance: (partyId: string) => number;
  getAccountEntries: (partyId: string, accountId: string) => LedgerEntry[];
  getPartyEntries: (partyId: string) => LedgerEntry[];
  
  getTotalCustomerDues: () => number;
  getTotalSupplierDues: () => number;
  getTodaySalesTotal: () => number;
  getTodayCashReceived: () => number;
  getLowStockProducts: () => Product[];
  getStockValue: () => number;
  getEstProfit: (timeframe?: 'today' | 'week' | 'month' | 'all') => number;

  // Settings & Utilities
  setLanguage: (lang: 'en' | 'ur') => void;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetDemoData: () => void;
  backupData: () => string;
  restoreData: (jsonData: string) => boolean;
  triggerSync: () => void;
}

const STORAGE_KEY = 'natraders_ledger_v3_clean';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Clear legacy storage keys once so old mock numbers don't persist
  useEffect(() => {
    try {
      const oldPrefixes = ['natraders_ledger_v2', 'natraders_ledger_v1', 'dailyledger_app_state'];
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && oldPrefixes.some((p) => k.startsWith(p))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }, []);

  // Load state from LocalStorage or clean empty arrays
  const [parties, setParties] = useState<Party[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_parties`);
      return saved ? JSON.parse(saved) : initialParties;
    } catch {
      return initialParties;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
      return saved ? JSON.parse(saved) : initialSales;
    } catch {
      return initialSales;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
      return saved ? JSON.parse(saved) : initialInvoices;
    } catch {
      return initialInvoices;
    }
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ledgerEntries`);
      return saved ? JSON.parse(saved) : initialLedgerEntries;
    } catch {
      return initialLedgerEntries;
    }
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`) || localStorage.getItem('dailyledger_app_state_v1_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ownerName?.toLowerCase() === 'adeel') parsed.ownerName = 'Nasir';
        if (parsed.name === 'Adeel General Store' || parsed.name === 'Nasir General Store') parsed.name = 'N.A Traders';
        if (parsed.email?.includes('adeel')) parsed.email = parsed.email.replace(/adeel/gi, 'nasir');
        return parsed;
      }
      return initialBusinessProfile;
    } catch {
      return initialBusinessProfile;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_parties`, JSON.stringify(parties));
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
      localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
      localStorage.setItem(
        `${STORAGE_KEY}_ledgerEntries`,
        JSON.stringify(ledgerEntries)
      );
      localStorage.setItem(
        `${STORAGE_KEY}_profile`,
        JSON.stringify(businessProfile)
      );
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [parties, products, sales, invoices, ledgerEntries, businessProfile, settings]);

  // Sync state simulator
  const triggerSync = () => {
    setSettings((prev) => ({ ...prev, syncStatus: 'syncing' }));
    setTimeout(() => {
      setSettings((prev) => ({
        ...prev,
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
      }));
    }, 900);
  };

  // Add Party (Customer or Supplier) with Accounts
  const addParty = (
    partyData: Omit<Party, 'id' | 'createdAt' | 'accounts'>,
    accountNames?: string[]
  ): Party => {
    const partyId = `party-${Date.now()}`;
    const now = new Date().toISOString();

    const createdAccounts: PartyAccount[] = (accountNames && accountNames.length > 0
      ? accountNames
      : ['Main Account']
    ).map((name, index) => ({
      id: `acc-${Date.now()}-${index}`,
      partyId,
      name,
      isDefault: index === 0,
      createdAt: now,
    }));

    const newParty: Party = {
      ...partyData,
      id: partyId,
      accounts: createdAccounts,
      createdAt: now,
    };

    setParties((prev) => [newParty, ...prev]);
    return newParty;
  };

  const updateParty = (id: string, updates: Partial<Party>) => {
    setParties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    // If party name or details are updated, synchronize related ledger entries, sales and invoices
    if (updates.name) {
      const newName = updates.name;
      setLedgerEntries((prev) =>
        prev.map((e) => (e.partyId === id ? { ...e, partyName: newName } : e))
      );
      setSales((prev) =>
        prev.map((s) => (s.customerId === id ? { ...s, customerName: newName } : s))
      );
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.customerId === id
            ? {
                ...inv,
                customerName: newName,
                customerPhone: updates.phone !== undefined ? updates.phone : inv.customerPhone,
                customerAddress: updates.address !== undefined ? updates.address : inv.customerAddress,
              }
            : inv
        )
      );
    } else if (updates.phone !== undefined || updates.address !== undefined) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.customerId === id
            ? {
                ...inv,
                customerPhone: updates.phone !== undefined ? updates.phone : inv.customerPhone,
                customerAddress: updates.address !== undefined ? updates.address : inv.customerAddress,
              }
            : inv
        )
      );
    }
  };

  const deleteParty = (id: string, deleteAssociatedData = true) => {
    setParties((prev) => prev.filter((p) => p.id !== id));
    if (deleteAssociatedData) {
      setLedgerEntries((prev) => prev.filter((e) => e.partyId !== id));
      setSales((prev) => prev.filter((s) => s.customerId !== id));
      setInvoices((prev) => prev.filter((i) => i.customerId !== id));
    }
  };

  const clearPartyData = (partyId: string) => {
    setLedgerEntries((prev) => prev.filter((e) => e.partyId !== partyId));
    setSales((prev) => prev.filter((s) => s.customerId !== partyId));
    setInvoices((prev) => prev.filter((i) => i.customerId !== partyId));
  };

  const addPartyAccount = (
    partyId: string,
    name: string,
    notes?: string
  ): PartyAccount => {
    const newAccount: PartyAccount = {
      id: `acc-${Date.now()}`,
      partyId,
      name,
      isDefault: false,
      notes,
      createdAt: new Date().toISOString(),
    };

    setParties((prev) =>
      prev.map((p) => {
        if (p.id !== partyId) return p;
        return {
          ...p,
          accounts: [...p.accounts, newAccount],
        };
      })
    );

    return newAccount;
  };

  const updatePartyAccount = (
    partyId: string,
    accountId: string,
    name: string,
    notes?: string
  ) => {
    setParties((prev) =>
      prev.map((p) => {
        if (p.id !== partyId) return p;
        return {
          ...p,
          accounts: p.accounts.map((a) =>
            a.id === accountId ? { ...a, name, notes: notes !== undefined ? notes : a.notes } : a
          ),
        };
      })
    );
    setLedgerEntries((prev) =>
      prev.map((e) =>
        e.partyId === partyId && e.accountId === accountId
          ? { ...e, accountName: name }
          : e
      )
    );
  };

  const deletePartyAccount = (partyId: string, accountId: string) => {
    setParties((prev) =>
      prev.map((p) => {
        if (p.id !== partyId) return p;
        if (p.accounts.length <= 1) return p; // Keep at least one account
        return {
          ...p,
          accounts: p.accounts.filter((a) => a.id !== accountId),
        };
      })
    );
  };

  // Product Actions
  const addProduct = (
    productData: Omit<Product, 'id' | 'createdAt'>
  ): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const archiveProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isArchived: !p.isArchived } : p))
    );
  };

  const adjustStock = (productId: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + quantity) } : p
      )
    );
  };

  // Add Sale
  const addSale = (saleData: {
    customerId: string;
    accountId: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    generateInvoice?: boolean;
    date?: string;
  }): { sale: Sale; invoice?: Invoice } => {
    const now = saleData.date || new Date().toISOString();
    const customer = parties.find((p) => p.id === saleData.customerId);
    const account = customer?.accounts.find((a) => a.id === saleData.accountId);

    const saleNumber = `SALE-${1000 + sales.length + 1}`;
    const invoiceNumber = `INV-${1000 + invoices.length + 1}`;
    const balanceDue = Math.max(0, saleData.totalAmount - saleData.paidAmount);

    let status: Sale['status'] = 'unpaid';
    if (saleData.paidAmount >= saleData.totalAmount) {
      status = 'paid';
    } else if (saleData.paidAmount > 0) {
      status = 'partial';
    }

    // 1. Deduct stock for each item
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = saleData.items.find((it) => it.productId === prod.id);
        if (soldItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - soldItem.quantity),
          };
        }
        return prod;
      })
    );

    let createdInvoice: Invoice | undefined;

    if (saleData.generateInvoice) {
      createdInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        customerId: saleData.customerId,
        customerName: customer?.name || 'Customer',
        customerPhone: customer?.phone,
        customerAddress: customer?.address,
        accountId: saleData.accountId,
        accountName: account?.name || 'Main Account',
        issueDate: now.split('T')[0],
        items: saleData.items.map((it, idx) => ({
          id: `item-${idx}`,
          productId: it.productId,
          description: `${it.productName} (${it.quantity} ${it.unit})`,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
        })),
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        taxRate: saleData.taxRate,
        taxAmount: saleData.taxAmount,
        totalAmount: saleData.totalAmount,
        paidAmount: saleData.paidAmount,
        remainingBalance: balanceDue,
        status,
        paymentMethod: saleData.paymentMethod,
        notes: saleData.notes,
        createdAt: now,
      };

      setInvoices((prev) => [createdInvoice!, ...prev]);
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      saleNumber,
      customerId: saleData.customerId,
      customerName: customer?.name || 'Customer',
      accountId: saleData.accountId,
      accountName: account?.name || 'Main Account',
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      taxRate: saleData.taxRate,
      taxAmount: saleData.taxAmount,
      totalAmount: saleData.totalAmount,
      paidAmount: saleData.paidAmount,
      balanceDue,
      paymentMethod: saleData.paymentMethod,
      status,
      notes: saleData.notes,
      date: now,
      invoiceId: createdInvoice?.id,
      createdAt: now,
    };

    setSales((prev) => [newSale, ...prev]);

    // 2. Automatically record in Ledger for this customer & specific account!
    // Accounting rules:
    // Entry 1: Sale of totalAmount (Debit to customer account)
    const saleEntry: LedgerEntry = {
      id: `led-${Date.now()}-sale`,
      partyId: saleData.customerId,
      partyName: customer?.name || 'Customer',
      accountId: saleData.accountId,
      accountName: account?.name || 'Main Account',
      type: 'sale',
      amount: saleData.totalAmount,
      date: now,
      description: `Sale · ${saleData.items.map((i) => `${i.productName} × ${i.quantity}`).join(', ')}`,
      referenceId: createdInvoice?.invoiceNumber || saleNumber,
      createdAt: now,
    };

    const newEntries = [saleEntry];

    // Entry 2: If payment was received, record credit to customer account
    if (saleData.paidAmount > 0) {
      const paymentEntry: LedgerEntry = {
        id: `led-${Date.now()}-pay`,
        partyId: saleData.customerId,
        partyName: customer?.name || 'Customer',
        accountId: saleData.accountId,
        accountName: account?.name || 'Main Account',
        type: 'payment_received',
        amount: saleData.paidAmount,
        date: now,
        description: `Payment received · ${saleData.paymentMethod.toUpperCase()}`,
        referenceId: createdInvoice?.invoiceNumber || saleNumber,
        paymentMethod: saleData.paymentMethod,
        createdAt: new Date(Date.now() + 10).toISOString(),
      };
      newEntries.push(paymentEntry);
    }

    setLedgerEntries((prev) => [...newEntries, ...prev]);

    return { sale: newSale, invoice: createdInvoice };
  };

  // Create Invoice
  const createInvoice = (
    invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>
  ): Invoice => {
    const invoiceNumber = `INV-${1000 + invoices.length + 1}`;
    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      createdAt: now,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Record in ledger
    const customer = parties.find((p) => p.id === invoiceData.customerId);
    const account = customer?.accounts.find((a) => a.id === invoiceData.accountId);

    const saleEntry: LedgerEntry = {
      id: `led-${Date.now()}-inv`,
      partyId: invoiceData.customerId,
      partyName: customer?.name || invoiceData.customerName,
      accountId: invoiceData.accountId,
      accountName: account?.name || invoiceData.accountName,
      type: 'sale',
      amount: invoiceData.totalAmount,
      date: now,
      description: `Invoice #${invoiceNumber} · ${invoiceData.items.length} items`,
      referenceId: invoiceNumber,
      createdAt: now,
    };

    const entriesToAdd = [saleEntry];

    if (invoiceData.paidAmount > 0) {
      const paymentEntry: LedgerEntry = {
        id: `led-${Date.now()}-invpay`,
        partyId: invoiceData.customerId,
        partyName: customer?.name || invoiceData.customerName,
        accountId: invoiceData.accountId,
        accountName: account?.name || invoiceData.accountName,
        type: 'payment_received',
        amount: invoiceData.paidAmount,
        date: now,
        description: `Payment received against #${invoiceNumber} (${invoiceData.paymentMethod.toUpperCase()})`,
        referenceId: invoiceNumber,
        paymentMethod: invoiceData.paymentMethod,
        createdAt: new Date(Date.now() + 10).toISOString(),
      };
      entriesToAdd.push(paymentEntry);
    }

    setLedgerEntries((prev) => [...entriesToAdd, ...prev]);
    return newInvoice;
  };

  const updateInvoiceStatus = (
    id: string,
    status: Invoice['status'],
    paidAmount?: number
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const newPaid = paidAmount !== undefined ? paidAmount : inv.paidAmount;
        const newRemaining = Math.max(0, inv.totalAmount - newPaid);
        return {
          ...inv,
          status,
          paidAmount: newPaid,
          remainingBalance: newRemaining,
        };
      })
    );
  };

  // Add generic ledger entry
  const addLedgerEntry = (entry: {
    partyId: string;
    accountId: string;
    type: LedgerEntryType;
    amount: number;
    date?: string;
    description: string;
    referenceId?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }): LedgerEntry => {
    const customer = parties.find((p) => p.id === entry.partyId);
    const account = customer?.accounts.find((a) => a.id === entry.accountId);
    const now = entry.date || new Date().toISOString();

    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      partyId: entry.partyId,
      partyName: customer?.name || 'Party',
      accountId: entry.accountId,
      accountName: account?.name || 'Main Account',
      type: entry.type,
      amount: Math.abs(entry.amount),
      date: now,
      description: entry.description,
      referenceId: entry.referenceId,
      paymentMethod: entry.paymentMethod,
      notes: entry.notes,
      createdAt: now,
    };

    setLedgerEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  // Reversal audit trail (never silent delete)
  const reverseLedgerEntry = (
    entryId: string,
    reason?: string
  ): LedgerEntry | null => {
    const original = ledgerEntries.find((e) => e.id === entryId);
    if (!original || original.isReversed) return null;

    const party = parties.find((p) => p.id === original.partyId);
    const isCustomer = party?.type !== 'supplier';

    // Mark original as reversed
    setLedgerEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, isReversed: true } : e))
    );

    // Opposite entry type for audit trail
    let reversalType: LedgerEntryType = 'reversal';

    const now = new Date().toISOString();
    const reversalEntry: LedgerEntry = {
      id: `led-${Date.now()}-rev`,
      partyId: original.partyId,
      partyName: original.partyName,
      accountId: original.accountId,
      accountName: original.accountName,
      type: reversalType,
      amount: original.amount,
      date: now,
      description: `Reversal of: ${original.description}${reason ? ` (${reason})` : ''}`,
      referenceId: original.referenceId || original.id,
      reversalOfId: original.id,
      createdAt: now,
    };

    setLedgerEntries((prev) => [reversalEntry, ...prev]);
    return reversalEntry;
  };

  // Quick Payment Receive for customer
  const receivePayment = ({
    partyId,
    accountId,
    amount,
    paymentMethod,
    notes,
    referenceId,
    date,
  }: {
    partyId: string;
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    referenceId?: string;
    date?: string;
  }): LedgerEntry => {
    return addLedgerEntry({
      partyId,
      accountId,
      type: 'payment_received',
      amount,
      paymentMethod,
      description: `Payment received · ${paymentMethod.toUpperCase()}${notes ? ` - ${notes}` : ''}`,
      referenceId: referenceId || `REC-${Math.floor(100 + Math.random() * 900)}`,
      notes,
      date,
    });
  };

  // Quick Payment Made for supplier
  const makePayment = ({
    partyId,
    accountId,
    amount,
    paymentMethod,
    notes,
    referenceId,
    date,
  }: {
    partyId: string;
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    referenceId?: string;
    date?: string;
  }): LedgerEntry => {
    return addLedgerEntry({
      partyId,
      accountId,
      type: 'payment_made',
      amount,
      paymentMethod,
      description: `Payment made · ${paymentMethod.toUpperCase()}${notes ? ` - ${notes}` : ''}`,
      referenceId: referenceId || `PAY-${Math.floor(100 + Math.random() * 900)}`,
      notes,
      date,
    });
  };

  // Accurate ledger arithmetic
  const getAccountEntries = (partyId: string, accountId: string) => {
    return ledgerEntries.filter(
      (e) => e.partyId === partyId && e.accountId === accountId
    );
  };

  const getPartyEntries = (partyId: string) => {
    return ledgerEntries.filter((e) => e.partyId === partyId);
  };

  const getAccountBalance = (partyId: string, accountId: string): number => {
    const party = parties.find((p) => p.id === partyId);
    const partyType = party?.type || 'customer';
    const entries = getAccountEntries(partyId, accountId);

    return entries.reduce((acc, entry) => {
      // Reversals: if an entry is marked reversed, its opposite reversal entry is also in the list,
      // or we can just compute delta.
      const delta = getEntryDelta(entry.type, entry.amount, partyType);
      return acc + delta;
    }, 0);
  };

  const getPartyBalance = (partyId: string): number => {
    const party = parties.find((p) => p.id === partyId);
    if (!party) return 0;
    return party.accounts.reduce(
      (sum, acc) => sum + getAccountBalance(partyId, acc.id),
      0
    );
  };

  const getTotalCustomerDues = (): number => {
    const customers = parties.filter((p) => p.type === 'customer');
    return customers.reduce((sum, customer) => {
      const bal = getPartyBalance(customer.id);
      return sum + (bal > 0 ? bal : 0);
    }, 0);
  };

  const getTotalSupplierDues = (): number => {
    const suppliers = parties.filter((p) => p.type === 'supplier');
    return suppliers.reduce((sum, supplier) => {
      const bal = getPartyBalance(supplier.id);
      return sum + (bal > 0 ? bal : 0);
    }, 0);
  };

  const getTodaySalesTotal = (): number => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter((s) => s.date.startsWith(todayStr));
    return todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  };

  const getTodayCashReceived = (): number => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCashSales = sales
      .filter((s) => s.date.startsWith(todayStr) && s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.paidAmount, 0);
    const todayCashPayments = ledgerEntries
      .filter(
        (e) =>
          e.date.startsWith(todayStr) &&
          e.type === 'payment_received' &&
          e.paymentMethod === 'cash'
      )
      .reduce((sum, e) => sum + e.amount, 0);
    return todayCashSales + todayCashPayments;
  };

  const getLowStockProducts = (): Product[] => {
    return products.filter((p) => !p.isArchived && p.stock <= p.minStockAlert);
  };

  const getStockValue = (): number => {
    return products
      .filter((p) => !p.isArchived)
      .reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);
  };

  const getEstProfit = (_timeframe: 'today' | 'week' | 'month' | 'all' = 'month'): number => {
    if (sales.length === 0) return 0;
    return sales.reduce((acc, s) => {
      const cost = s.items.reduce((c, it) => {
        const prod = products.find((p) => p.id === it.productId);
        return c + (prod ? prod.purchasePrice * it.quantity : 0);
      }, 0);
      return acc + (s.totalAmount - cost);
    }, 0);
  };

  const setLanguage = (lang: 'en' | 'ur') => {
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile((prev) => ({ ...prev, ...profile }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetDemoData = () => {
    setParties(demoParties);
    setProducts(demoProducts);
    setSales(demoSales);
    setInvoices(demoInvoices);
    setLedgerEntries(demoLedgerEntries);
    setBusinessProfile(demoBusinessProfile);
    setSettings(demoSettings);
    localStorage.clear();
  };

  const backupData = (): string => {
    const payload = {
      parties,
      products,
      sales,
      invoices,
      ledgerEntries,
      businessProfile,
      settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  };

  const restoreData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.parties && data.products) {
        setParties(data.parties);
        setProducts(data.products);
        if (data.sales) setSales(data.sales);
        if (data.invoices) setInvoices(data.invoices);
        if (data.ledgerEntries) setLedgerEntries(data.ledgerEntries);
        if (data.businessProfile) setBusinessProfile(data.businessProfile);
        if (data.settings) setSettings(data.settings);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse backup JSON:', e);
      return false;
    }
  };

  const deleteLedgerEntry = (entryId: string) => {
    setLedgerEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const deleteSale = (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  const deleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
  };

  const clearAllCustomerData = () => {
    setParties([]);
    setLedgerEntries([]);
    setSales([]);
    setInvoices([]);
  };

  const clearAllData = () => {
    setParties([]);
    setLedgerEntries([]);
    setSales([]);
    setInvoices([]);
    setProducts([]);
  };

  return (
    <AppContext.Provider
      value={{
        parties,
        products,
        sales,
        invoices,
        ledgerEntries,
        businessProfile,
        settings,
        addParty,
        updateParty,
        deleteParty,
        clearPartyData,
        addPartyAccount,
        updatePartyAccount,
        deletePartyAccount,
        deleteLedgerEntry,
        deleteSale,
        deleteInvoice,
        clearAllCustomerData,
        clearAllData,
        addProduct,
        updateProduct,
        archiveProduct,
        adjustStock,
        addSale,
        createInvoice,
        updateInvoiceStatus,
        addLedgerEntry,
        reverseLedgerEntry,
        receivePayment,
        makePayment,
        getAccountBalance,
        getPartyBalance,
        getAccountEntries,
        getPartyEntries,
        getTotalCustomerDues,
        getTotalSupplierDues,
        getTodaySalesTotal,
        getTodayCashReceived,
        getLowStockProducts,
        getStockValue,
        getEstProfit,
        setLanguage,
        updateBusinessProfile,
        updateSettings,
        resetDemoData,
        backupData,
        restoreData,
        triggerSync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
