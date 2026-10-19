/**
 * Formatting and financial calculations helper
 */

export function formatPKR(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded).toLocaleString('en-PK');
  return `Rs ${formatted}`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const time = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const date = d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
    return `${date}, ${time}`;
  } catch {
    return dateStr;
  }
}

export function formatTimeOnly(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '10:00 AM';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '10:00 AM';
  }
}

export function getInitials(name: string): string {
  if (!name) return 'DL';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Computes the financial delta of a ledger entry based on party type.
 * For CUSTOMERS:
 *  - Sale, Debit, Adjustment (+): increases amount customer owes you (+amount)
 *  - Payment Received, Credit (-): decreases amount customer owes you (-amount)
 * 
 * For SUPPLIERS:
 *  - Purchase, Credit from supplier (+): increases amount you owe supplier (+amount)
 *  - Payment Made, Debit (-): decreases amount you owe supplier (-amount)
 */
export function getEntryDelta(
  entryType: string,
  amount: number,
  partyType: 'customer' | 'supplier' = 'customer'
): number {
  const absAmount = Math.abs(amount);
  if (partyType === 'customer') {
    switch (entryType) {
      case 'sale':
      case 'debit':
        return absAmount;
      case 'payment_received':
      case 'credit':
        return -absAmount;
      case 'reversal':
        return -absAmount;
      case 'adjustment':
        return amount; // can be positive or negative
      default:
        return absAmount;
    }
  } else {
    // Supplier
    switch (entryType) {
      case 'purchase':
      case 'credit':
        return absAmount;
      case 'payment_made':
      case 'debit':
        return -absAmount;
      case 'reversal':
        return -absAmount;
      case 'adjustment':
        return amount;
      default:
        return absAmount;
    }
  }
}
