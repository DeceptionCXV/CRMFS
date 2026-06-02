/**
 * paymentDisplay.ts
 *
 * Simple, clear payment logic:
 *
 * OBLIGATION ROW (registration, renewal, etc.):
 *   Due = full amount  |  Paid = —  |  Outstanding = full amount
 *   (This is the invoice. It never changes. It just says "you owe this.")
 *
 * RECEIPT ROW (payment_type === 'receipt'):
 *   Due = —  |  Paid = amount on this row  |  Outstanding = running balance after this payment
 *   (This is money that came in. Outstanding = total owed minus all receipts so far.)
 *
 * SUMMARY TOTALS:
 *   Due = sum of all obligations
 *   Paid = sum of all receipts
 *   Outstanding = Due - Paid (floored at 0)
 */

export interface PaymentAmountRow {
  due: number;
  paid: number;
  outstanding: number;
}

export interface MemberPaymentSummary {
  totalDue: number;
  totalPaid: number;
  outstanding: number;
  hasCompletedPayment: boolean;
}

export const PAYMENT_OVERDUE_DAYS = 30;

export type PaymentLike = {
  id?: string;
  payment_type?: string | null;
  payment_status?: string | null;
  total_amount?: number | string | null;
  payment_date?: string | null;
  created_at?: string | null;
};

export type MemberPaymentDisplayStatus =
  | { kind: 'clear' }
  | { kind: 'due'; outstanding: number }
  | { kind: 'failed'; outstanding: number };

// ---------------------------------------------------------------------------
// Basic helpers
// ---------------------------------------------------------------------------

/** A receipt row = money received. Everything else is an obligation (invoice). */
export function isReceiptPayment(payment: { payment_type?: string | null }): boolean {
  return payment.payment_type === 'receipt';
}

export function isObligationPayment(payment: { payment_type?: string | null }): boolean {
  return !isReceiptPayment(payment);
}

function toNumber(val: number | string | null | undefined): number {
  return Number(val || 0);
}

/** True when payment_date is a calendar date without a meaningful time (form date picker, etc.). */
function isDateOnlyPaymentDate(raw: string): boolean {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return true;
  return /^\d{4}-\d{2}-\d{2}T00:00:00(\.000)?Z?$/.test(trimmed);
}

/**
 * Single timestamp for sort + overdue: matches the Date/Time column users see.
 * Date-only payment_date uses that calendar day + clock time from created_at.
 */
function getEffectivePaymentTimestamp(payment: PaymentLike): number {
  const paymentDate = payment.payment_date?.trim();
  const createdAt = payment.created_at;

  if (!paymentDate) {
    return createdAt ? new Date(createdAt).getTime() : 0;
  }

  if (isDateOnlyPaymentDate(paymentDate) && createdAt) {
    const [y, m, d] = paymentDate.slice(0, 10).split('-').map(Number);
    const created = new Date(createdAt);
    return new Date(
      y,
      m - 1,
      d,
      created.getHours(),
      created.getMinutes(),
      created.getSeconds(),
      created.getMilliseconds()
    ).getTime();
  }

  return new Date(paymentDate).getTime();
}

function getPaymentSortTime(payment: PaymentLike): number {
  return getEffectivePaymentTimestamp(payment);
}

/** Secondary key when two payments share the same effective timestamp. */
function getPaymentTiebreakTime(payment: PaymentLike): number {
  return payment.created_at ? new Date(payment.created_at).getTime() : 0;
}

function comparePaymentsChronologically(a: PaymentLike, b: PaymentLike): number {
  const byDate = getPaymentSortTime(a) - getPaymentSortTime(b);
  if (byDate !== 0) return byDate;
  return getPaymentTiebreakTime(a) - getPaymentTiebreakTime(b);
}

/** Display order: newest due/received payments first. */
export function sortPaymentsNewestFirst(payments: PaymentLike[]): PaymentLike[] {
  return payments.slice().sort((a, b) => -comparePaymentsChronologically(a, b));
}

/** Running-balance order: oldest obligations/receipts first. */
export function sortPaymentsOldestFirst(payments: PaymentLike[]): PaymentLike[] {
  return payments.slice().sort(comparePaymentsChronologically);
}

// ---------------------------------------------------------------------------
// Summary (used by summary cards + activation checks)
// ---------------------------------------------------------------------------

/**
 * Member-level totals across all payments.
 * Due = sum of obligations, Paid = sum of receipts, Outstanding = Due - Paid.
 */
export function getMemberPaymentSummary(payments: PaymentLike[]): MemberPaymentSummary {
  const obligations = payments.filter(isObligationPayment);
  const receipts = payments.filter(isReceiptPayment);

  const totalDue = obligations.reduce((sum, p) => sum + toNumber(p.total_amount), 0);
  const totalPaid = receipts.reduce((sum, p) => sum + toNumber(p.total_amount), 0);
  const outstanding = Math.max(0, totalDue - totalPaid);

  return {
    totalDue,
    totalPaid,
    outstanding,
    hasCompletedPayment: totalPaid > 0,
  };
}

// ---------------------------------------------------------------------------
// Per-row display amounts for the payment history table
// ---------------------------------------------------------------------------

/**
 * Returns { due, paid, outstanding } for a single row in the payment history table.
 *
 * Both obligation and receipt rows show a running balance — like a bank statement.
 *
 * Obligation row:  due = amount, paid = —, outstanding = cumulative obligations so far minus all receipts so far
 * Receipt row:     due = —,     paid = amount, outstanding = running balance after this receipt
 *
 * Everything sorted chronologically (oldest first) to calculate the running balance correctly.
 */
export function getPaymentTableRowAmounts(
  payment: PaymentLike,
  allPayments: PaymentLike[]
): PaymentAmountRow {
  const sorted = sortPaymentsOldestFirst(allPayments);

  let runningBalance = 0;
  const thisId = payment.id;

  for (const row of sorted) {
    if (isObligationPayment(row)) {
      // Each obligation adds to what's owed
      runningBalance += toNumber(row.total_amount);
    } else {
      // Each receipt reduces the balance
      runningBalance = Math.max(0, runningBalance - toNumber(row.total_amount));
    }

    if (row.id && row.id === thisId) {
      if (isObligationPayment(payment)) {
        return { due: toNumber(payment.total_amount), paid: 0, outstanding: runningBalance };
      } else {
        return { due: 0, paid: toNumber(payment.total_amount), outstanding: runningBalance };
      }
    }
  }

  // Fallback — shouldn't normally reach here
  const due = toNumber(payment.total_amount);
  if (isObligationPayment(payment)) {
    return { due, paid: 0, outstanding: due };
  }

  const paid = toNumber(payment.total_amount);
  return { due: 0, paid, outstanding: 0 };
}

/**
 * Totals row at the bottom of the table (simple sum of all row amounts).
 * Due = total obligated, Paid = total received, Outstanding = difference.
 */
export function sumPaymentAmounts(payments: PaymentLike[]): PaymentAmountRow {
  const summary = getMemberPaymentSummary(payments);
  return {
    due: summary.totalDue,
    paid: summary.totalPaid,
    outstanding: summary.outstanding,
  };
}

// ---------------------------------------------------------------------------
// Internal allocation (used by activation checks + obligation status updates)
// ---------------------------------------------------------------------------

/**
 * Allocates receipts against obligations in chronological order.
 * Returns a map of obligation ID → { due, paid, outstanding }.
 * Used internally to work out which obligations are still partially/fully unpaid.
 */
export function allocateObligationAmounts(
  payments: PaymentLike[]
): Map<string, PaymentAmountRow> {
  const map = new Map<string, PaymentAmountRow>();

  const obligations = sortPaymentsOldestFirst(payments.filter(isObligationPayment));

  const totalReceived = payments
    .filter(isReceiptPayment)
    .reduce((sum, p) => sum + toNumber(p.total_amount), 0);

  let receiptPool = totalReceived;

  for (const obligation of obligations) {
    if (!obligation.id) continue;
    const due = toNumber(obligation.total_amount);
    const paid = Math.min(due, receiptPool);
    receiptPool = Math.max(0, receiptPool - paid);
    map.set(obligation.id, { due, paid, outstanding: Math.max(0, due - paid) });
  }

  return map;
}

/**
 * Used by activation checks. Returns amounts for a single payment
 * using the allocation model above.
 */
export function getPaymentAmounts(
  payment: PaymentLike,
  allPayments: PaymentLike[] = []
): PaymentAmountRow {
  if (isReceiptPayment(payment)) {
    return { due: 0, paid: toNumber(payment.total_amount), outstanding: 0 };
  }

  const allocations = allocateObligationAmounts(allPayments);
  const row = payment.id ? allocations.get(payment.id) : undefined;
  if (row) return row;

  const due = toNumber(payment.total_amount);
  return { due, paid: 0, outstanding: due };
}

/** Obligation rows with remaining outstanding balance. */
export function getOutstandingObligations(payments: PaymentLike[]): PaymentLike[] {
  const allocations = allocateObligationAmounts(payments);
  return payments.filter((p) => {
    if (!isObligationPayment(p) || !p.id) return false;
    const row = allocations.get(p.id);
    return row ? row.outstanding > 0 : false;
  });
}

// ---------------------------------------------------------------------------
// Overdue detection
// ---------------------------------------------------------------------------

export function getObligationIssueDate(payment: PaymentLike): Date {
  const ts = getEffectivePaymentTimestamp(payment);
  return ts ? new Date(ts) : new Date(0);
}

export function hasOverdueOutstanding(
  payments: PaymentLike[],
  days: number = PAYMENT_OVERDUE_DAYS
): boolean {
  const allocations = allocateObligationAmounts(payments);
  const thresholdMs = days * 24 * 60 * 60 * 1000;
  const now = Date.now();

  for (const payment of payments) {
    if (!isObligationPayment(payment) || !payment.id) continue;
    const row = allocations.get(payment.id);
    if (!row || row.outstanding <= 0) continue;
    const issued = getObligationIssueDate(payment);
    if (now - issued.getTime() > thresholdMs) return true;
  }

  return false;
}

export function getMemberPaymentDisplayStatus(
  payments: PaymentLike[]
): MemberPaymentDisplayStatus {
  const summary = getMemberPaymentSummary(payments);
  if (summary.outstanding <= 0) return { kind: 'clear' };
  if (hasOverdueOutstanding(payments)) return { kind: 'failed', outstanding: summary.outstanding };
  return { kind: 'due', outstanding: summary.outstanding };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatPaymentDateTime(payment: {
  payment_date?: string | null;
  created_at?: string | null;
}): string {
  const created = payment.created_at ? new Date(payment.created_at) : null;
  const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;
  const base = paymentDate || created;
  if (!base) return '—';

  const datePart = base.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (created) {
    const timePart = created.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart}, ${timePart}`;
  }

  return datePart;
}

export function formatPaymentReason(
  payment: {
    payment_type?: string | null;
    payment_status?: string | null;
    id?: string;
  },
  _allPayments: PaymentLike[] = []
): string {
  if (isReceiptPayment(payment)) return 'Payment received';
  if (!payment.payment_type) return '—';
  return payment.payment_type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatPaymentMethod(method?: string | null): string {
  if (!method) return '—';
  return method
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatMoney(amount: number): string {
  return `£${amount.toFixed(2)}`;
}