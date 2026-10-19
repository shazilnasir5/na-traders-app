export type PartyType = 'customer' | 'supplier';

export interface PartyAccount {
  id: string;
  partyId: string;
  name: string; // e.g. "Main Store", "Warehouse", "Credit Account"
  isDefault: boolean;
  notes?: string;
  createdAt: string;
}

export interface Party {
  id: string;
  type: PartyType;
  name: string;
  companyName?: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
  accounts: PartyAccount[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  weight?: string; // e.g. "1 kg", "500 g", "5 kg", "1 tin", "1 bottle"
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string; // e.g. "per pack", "per bag", "per bottle", "per bar", "per kg"
  supplierId?: string;
  supplierName?: string;
  isArchived?: boolean;
  imageUrl?: string;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'bank' | 'other';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface SaleItem {
  productId: string;
  productName: string;
  sku?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  purchasePrice?: number;
  total: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId: string;
  customerName: string;
  accountId: string;
  accountName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  date: string;
  invoiceId?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-1042"
  saleId?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  accountId: string;
  accountName: string;
  issueDate: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type LedgerEntryType =
  | 'sale'
  | 'purchase'
  | 'payment_received'
  | 'payment_made'
  | 'credit'
  | 'debit'
  | 'adjustment'
  | 'reversal';

export interface LedgerEntry {
  id: string;
  partyId: string;
  partyName: string;
  accountId: string;
  accountName: string;
  type: LedgerEntryType;
  amount: number;
  date: string;
  description: string;
  referenceId?: string; // invoice or sale number
  paymentMethod?: PaymentMethod;
  isReversed?: boolean;
  reversalOfId?: string;
  notes?: string;
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  taxNtn: string;
  currency: string;
  currencySymbol: string;
}

export interface AppSettings {
  language: 'en' | 'ur';
  currency: 'PKR';
  currencySymbol: 'Rs';
  taxEnabled: boolean;
  defaultTaxRate: number;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncedAt: string;
}
