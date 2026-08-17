import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Landmark,
  Layers3,
  Loader2,
  LogOut,
  PencilLine,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import BrandLogo from '../../components/ui/BrandLogo';
import Dropdown from '../../components/ui/Dropdown';
import QRCode from '../../components/ui/QRCode';
import IpWhitelistCard from '../../components/admin/IpWhitelistCard';
import { useAuth } from '../../contexts/AuthContext';
import {
  DEFAULT_BRANDING,
  getBrandReferencePrefix,
  type BrandingSettings,
  type BrandingUpdate,
  useBranding,
} from '../../contexts/BrandingContext';
import { supabase } from '../../lib/supabase';
import { fetchLiveMarketData } from '../../lib/exchangeRates';
import { getCryptoPaymentRequest } from '../../lib/cryptoPayment';
import {
  getBalanceStatusClasses,
  getBalanceStatusLabel,
  normalizeBalanceStatus,
  type BalanceAvailabilityStatus,
} from '../../lib/balanceStatus';
import { getCrmRoleLabel, normalizeCrmRole, type CrmRole } from '../../lib/crmRoles';
import {
  isMissingIbanColumnError,
  normalizeIbanRow,
  toLegacyIbanPayload,
} from '../../lib/ibanCompatibility';
import {
  TAX_STATUS_OPTIONS,
  normalizeTaxStatus,
  summarizeTaxAmounts,
  type TaxStatus,
} from '../../lib/taxStatus';
import {
  DEFAULT_TAX_CURRENCY,
  formatTaxCurrency,
  normalizeTaxCurrency,
} from '../../lib/taxCurrency';

type KycStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

type ProfileRecord = {
  id: string;
  full_name: string;
  email: string;
  account_iban: string | null;
  created_at: string;
  updated_at: string;
  kyc_status: KycStatus;
  crm_role: CrmRole;
  is_admin: boolean;
  assigned_manager_id: string | null;
  assigned_agent_id: string | null;
  plain_password: string | null;
  show_account_created_at: boolean;
};

type AdminRow = {
  id: string;
  [key: string]: unknown;
};

type TransactionSourceTable = 'transactions' | 'crypto_transactions';
type TransferSourceTable = 'bank_transfers' | 'crypto_transfers';
type ActivitySourceTable = TransactionSourceTable | TransferSourceTable;
type BalanceSourceTable = 'fiat_balances' | 'crypto_balances';
type WalletSourceTable = 'crypto_wallets' | 'tax_wallet_addresses';
type ExchangeHistorySourceTable = 'currency_exchanges' | 'crypto_transactions';

type TransactionRow = AdminRow & {
  __source_table: TransactionSourceTable;
  __source_id: string;
  __source_label: string;
  __transaction_kind: 'banking' | 'crypto';
  __record_type: 'transaction';
};

type TransferRow = AdminRow & {
  __source_table: TransferSourceTable;
  __source_id: string;
  __source_label: string;
  __transaction_kind: 'banking' | 'crypto';
  __record_type: 'transfer';
};

type ActivityRow = AdminRow & {
  __source_table: ActivitySourceTable;
  __source_id: string;
  __source_label: string;
  __transaction_kind: 'banking' | 'crypto';
  __record_type: 'transaction' | 'transfer';
};

type WalletRow = AdminRow & {
  __source_table: WalletSourceTable;
  __source_id: string;
  __source_label: string;
  __transaction_kind: 'crypto' | 'tax';
};

type ExchangeHistoryRow = AdminRow & {
  __source_table: ExchangeHistorySourceTable;
  __source_id: string;
  __source_label: string;
  __transaction_kind: 'banking' | 'crypto';
};

type BalanceRow = AdminRow & {
  source_table: BalanceSourceTable;
  source_id: string;
  balance_kind: 'fiat' | 'crypto';
  asset_code: string;
  asset_name: string;
  __has_display_order: boolean;
  display_order: number;
  balance: number;
  status: BalanceAvailabilityStatus;
};

type BalanceStatusControlValue = BalanceAvailabilityStatus | 'mixed';

type BalanceDraft = {
  kind: 'fiat' | 'crypto';
  code: string;
  name: string;
  balance: string;
  status: BalanceAvailabilityStatus;
};

type DraftField = {
  id: string;
  key: string;
  value: string;
};

type ProfileSavePayload = {
  full_name: string;
  email: string;
  account_iban: string;
  kyc_status: KycStatus;
  crm_role: CrmRole;
  assigned_manager_id: string | null;
  assigned_agent_id: string | null;
  password: string;
  account_created_date: string;
  show_account_created_at: boolean;
};

type NewUserDraft = {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  account_iban: string;
  kyc_status: KycStatus;
  crm_role: CrmRole;
  assigned_manager_id: string;
  assigned_agent_id: string;
  email_confirm: boolean;
  account_created_date: string;
  show_account_created_at: boolean;
};

type CreateUserResponse = {
  error?: string;
  rollback_warning?: string | null;
  profile?: ProfileRecord;
  user?: {
    id?: string;
    email?: string;
    email_confirmed?: boolean;
  };
};

type DeleteUserResponse = {
  error?: string;
  hint?: string;
  storage_cleanup_warning?: string | null;
};

type BrandingForm = BrandingUpdate;
type DirectoryRoleFilter = 'all' | CrmRole;

const PROFILE_RECORD_SELECT = 'id, full_name, email, account_iban, created_at, updated_at, kyc_status, crm_role, is_admin, assigned_manager_id, assigned_agent_id, plain_password, show_account_created_at';

function getTodayDateInputValue() {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().slice(0, 10);
}

function accountDateInputToIso(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const parsedDate = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) return null;
  return parsedDate.toISOString();
}

function accountDateIsoToInputValue(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return getTodayDateInputValue();

  const offsetMilliseconds = parsedDate.getTimezoneOffset() * 60_000;
  return new Date(parsedDate.getTime() - offsetMilliseconds).toISOString().slice(0, 10);
}

function waitForProfileTrigger(delayMs = 200) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, delayMs));
}

async function insertAdminRow(tableName: string, payload: Record<string, unknown>) {
  let result = await supabase.from(tableName).insert(payload).select().single();

  if (isMissingIbanColumnError(result.error, tableName)) {
    result = await supabase
      .from(tableName)
      .insert(toLegacyIbanPayload(tableName, payload))
      .select()
      .single();
  }

  return {
    ...result,
    data: result.data ? normalizeIbanRow(tableName, result.data as AdminRow) : result.data,
  };
}

async function updateAdminRow(
  tableName: string,
  rowId: string,
  payload: Record<string, unknown>,
) {
  let result = await supabase.from(tableName).update(payload).eq('id', rowId).select().single();

  if (isMissingIbanColumnError(result.error, tableName)) {
    result = await supabase
      .from(tableName)
      .update(toLegacyIbanPayload(tableName, payload))
      .eq('id', rowId)
      .select()
      .single();
  }

  return {
    ...result,
    data: result.data ? normalizeIbanRow(tableName, result.data as AdminRow) : result.data,
  };
}

type TableConfig = {
  name: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  scope: 'user' | 'global';
  filterColumn?: string;
  orderColumn?: string;
  timestampColumn?: string;
};

const USER_TABLES: TableConfig[] = [
  { name: 'transactions', label: 'Transactions', icon: Wallet, scope: 'user', filterColumn: 'user_id' },
  { name: 'fiat_balances', label: 'Fiat Balances', icon: Landmark, scope: 'user', filterColumn: 'user_id' },
  { name: 'crypto_balances', label: 'Crypto Balances', icon: Landmark, scope: 'user', filterColumn: 'user_id' },
  { name: 'cards', label: 'Cards', icon: CreditCard, scope: 'user', filterColumn: 'user_id' },
  { name: 'bill_payments', label: 'Bill Payments', icon: Database, scope: 'user', filterColumn: 'user_id' },
  { name: 'currency_exchanges', label: 'Currency Exchange', icon: RefreshCw, scope: 'user', filterColumn: 'user_id' },
  { name: 'loans', label: 'Loans', icon: Landmark, scope: 'user', filterColumn: 'user_id' },
  { name: 'crypto_transactions', label: 'Crypto Transactions', icon: Database, scope: 'user', filterColumn: 'user_id' },
  { name: 'crypto_wallets', label: 'Crypto Wallets', icon: Wallet, scope: 'user', filterColumn: 'user_id' },
  { name: 'crypto_transfers', label: 'Crypto Transfers', icon: RefreshCw, scope: 'user', filterColumn: 'user_id' },
  { name: 'taxes', label: 'Taxes', icon: Database, scope: 'user', filterColumn: 'user_id' },
  { name: 'tax_wallet_addresses', label: 'Tax Wallets', icon: Wallet, scope: 'user', filterColumn: 'user_id' },
  { name: 'bank_transfers', label: 'Bank Transfers', icon: RefreshCw, scope: 'user', filterColumn: 'user_id' },
  { name: 'crypto_deposits', label: 'Add Funds (Crypto)', icon: Layers3, scope: 'user', filterColumn: 'user_id' },
];

const GLOBAL_TABLES: TableConfig[] = [];

const TRANSACTIONS_TABLE_NAME = 'all_transactions';
const TRANSACTION_SOURCE_TABLES: TransactionSourceTable[] = ['transactions', 'crypto_transactions'];
const TRANSACTIONS_TABLE: TableConfig = {
  name: TRANSACTIONS_TABLE_NAME,
  label: 'Transactions',
  description: 'Manage banking and crypto transaction records in separate sections.',
  icon: Wallet,
  scope: 'user',
  filterColumn: 'user_id',
};
const TRANSFERS_TABLE_NAME = 'all_transfers';
const TRANSFER_SOURCE_TABLES: TransferSourceTable[] = ['bank_transfers', 'crypto_transfers'];
const TRANSFERS_TABLE: TableConfig = {
  name: TRANSFERS_TABLE_NAME,
  label: 'Transfers',
  description: 'Manage bank and crypto transfer records in a dedicated activity card.',
  icon: RefreshCw,
  scope: 'user',
  filterColumn: 'user_id',
};
const ACTIVITY_TABLE_NAME = 'all_activity';
const ACTIVITY_SOURCE_TABLES: ActivitySourceTable[] = [
  ...TRANSACTION_SOURCE_TABLES,
  ...TRANSFER_SOURCE_TABLES,
];
const BALANCES_TABLE_NAME = 'balances';
const BALANCE_SOURCE_TABLES: BalanceSourceTable[] = ['fiat_balances', 'crypto_balances'];
const BALANCES_TABLE: TableConfig = {
  name: BALANCES_TABLE_NAME,
  label: 'Balances',
  description: 'Manage fiat and crypto balances together with a simpler balance-only editor.',
  icon: Landmark,
  scope: 'user',
};
const WALLETS_TABLE_NAME = 'all_wallets';
const WALLET_SOURCE_TABLES: WalletSourceTable[] = ['crypto_wallets', 'tax_wallet_addresses'];
const TAX_SUMMARY_CARDS_TABLE_NAME = 'tax_summary_cards';
const WALLETS_TABLE: TableConfig = {
  name: WALLETS_TABLE_NAME,
  label: 'Wallets',
  description: 'Manage crypto and tax wallet records together in one combined wallet view.',
  icon: Wallet,
  scope: 'user',
  filterColumn: 'user_id',
};
const TAX_SUMMARY_CARDS_TABLE: TableConfig = {
  name: TAX_SUMMARY_CARDS_TABLE_NAME,
  label: 'Tax Summary Cards',
  icon: Database,
  scope: 'user',
  filterColumn: 'user_id',
};
const ALL_TABLES = [...USER_TABLES, ...GLOBAL_TABLES];
const DATA_FETCH_TABLES = [...ALL_TABLES, TAX_SUMMARY_CARDS_TABLE];
const TAB_TABLES = [
  ...USER_TABLES.flatMap((table) => {
    if (table.name === 'transactions') return [TRANSACTIONS_TABLE];
    if (table.name === 'crypto_transactions') return [];
    if (table.name === 'bank_transfers') return [TRANSFERS_TABLE];
    if (table.name === 'crypto_transfers') return [];
    if (table.name === 'fiat_balances') return [BALANCES_TABLE];
    if (table.name === 'crypto_balances') return [];
    if (table.name === 'crypto_wallets') return [WALLETS_TABLE];
    if (table.name === 'tax_wallet_addresses') return [];
    return [table];
  }),
  ...GLOBAL_TABLES,
];
const DEFAULT_TABLE = TAB_TABLES[0]?.name ?? '';

type CrmAdminViewState = {
  selectedUserId?: string;
  activeTable?: string;
  search?: string;
  scrollTop?: number;
  directoryRoleFilter?: DirectoryRoleFilter;
  directoryPage?: number;
  directoryPageSize?: number;
};

const CRM_ADMIN_VIEW_STATE_KEY = 'crm-admin:view-state';
const DIRECTORY_PAGE_SIZES = [5, 10, 20, 50] as const;
const DIRECTORY_ROLE_FILTERS: Array<{ value: DirectoryRoleFilter; label: string }> = [
  { value: 'all', label: 'All users' },
  { value: 'customer', label: 'Customers' },
  { value: 'agent', label: 'Agents' },
  { value: 'superior_manager', label: 'Superior managers' },
  { value: 'admin', label: 'Admins' },
];

function normalizeDirectoryRoleFilter(value: unknown): DirectoryRoleFilter {
  return value === 'customer' || value === 'agent' || value === 'superior_manager' || value === 'admin'
    ? value
    : 'all';
}

function normalizeDirectoryPageSize(value: unknown) {
  const numericValue = Number(value);
  return DIRECTORY_PAGE_SIZES.includes(numericValue as (typeof DIRECTORY_PAGE_SIZES)[number])
    ? numericValue
    : DIRECTORY_PAGE_SIZES[0];
}

function getCrmRoleClasses(role: CrmRole) {
  switch (role) {
    case 'admin':
      return 'border-[#006446]/18 bg-[#006446] text-white';
    case 'superior_manager':
      return 'border-[#0f766e]/18 bg-[#0f766e]/10 text-[#0f766e]';
    case 'agent':
      return 'border-[#1d4ed8]/18 bg-[#1d4ed8]/10 text-[#1d4ed8]';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

function getProfileDisplayName(profile: Pick<ProfileRecord, 'full_name' | 'email' | 'id'> | null | undefined) {
  if (!profile) return 'Unassigned';
  return profile.full_name || profile.email || profile.id;
}

function readCrmAdminViewState(): CrmAdminViewState {
  try {
    const raw = window.sessionStorage.getItem(CRM_ADMIN_VIEW_STATE_KEY);
    if (!raw) return {};

    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? (value as CrmAdminViewState) : {};
  } catch {
    return {};
  }
}

function updateCrmAdminViewState(patch: CrmAdminViewState) {
  try {
    window.sessionStorage.setItem(
      CRM_ADMIN_VIEW_STATE_KEY,
      JSON.stringify({ ...readCrmAdminViewState(), ...patch })
    );
  } catch {
    // Session storage can be unavailable in private or restricted browser contexts.
  }
}

const kycOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];
const FIAT_BALANCE_FORMATTING_CODES = new Set(['USD', 'EUR', 'CAD', 'CHF']);

function toSentenceCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bIban\b/g, 'IBAN');
}

function formatDayMonthYear(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Empty';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return value.toLocaleString('en-US');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatBalanceAmount(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 8,
  });
}

function getTaxStatusLabel(status: TaxStatus) {
  return TAX_STATUS_OPTIONS.find((option) => option.value === status)?.label || toSentenceCase(status);
}

function getTaxSummaryEditId(status: TaxStatus) {
  return `tax-summary-${status}`;
}

function parseTaxAmountInput(value: string) {
  const normalizedValue = normalizeFiatBalanceInput(value) ?? value.trim();
  const amount = Number(normalizedValue);

  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

function buildTaxSummaryAmountPayload(status: TaxStatus, amount: number) {
  if (status === 'paid') {
    return {
      status,
      amount_owed: amount,
      amount_paid: amount,
      filed_date: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    status,
    amount_owed: amount,
    amount_paid: 0,
    filed_date: null,
  };
}

function buildTaxSummaryInsertPayload(userId: string, status: TaxStatus, amount: number) {
  const currentDate = new Date().toISOString().slice(0, 10);

  return {
    user_id: userId,
    tax_type: 'summary',
    tax_year: new Date().getFullYear(),
    description: `${getTaxStatusLabel(status)} tax amount`,
    due_date: currentDate,
    reference_number: `tax_summary_${status}`,
    notes: 'Managed from CRM tax summary.',
    ...buildTaxSummaryAmountPayload(status, amount),
  };
}

function getNumericTaxAmount(value: unknown) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
}

function normalizeTaxSummaryCardRow(row: AdminRow) {
  const status = normalizeTaxStatus(row.status);
  const amount = getNumericTaxAmount(row.amount);

  return {
    ...row,
    status,
    amount_owed: amount,
    amount_paid: status === 'paid' ? amount : 0,
  };
}

function shouldNormalizeFiatBalanceInput(row: Pick<BalanceRow, 'balance_kind' | 'asset_code'>) {
  return row.balance_kind === 'fiat' && FIAT_BALANCE_FORMATTING_CODES.has(row.asset_code.trim().toUpperCase());
}

function normalizeFiatBalanceInput(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;

  const isNegative = trimmedValue.startsWith('-');
  const unsignedValue = trimmedValue.replace(/^-/, '');
  const cleanedValue = unsignedValue.replace(/[^\d.,]/g, '');

  if (!cleanedValue || !/\d/.test(cleanedValue)) return null;

  const lastDotIndex = cleanedValue.lastIndexOf('.');
  const lastCommaIndex = cleanedValue.lastIndexOf(',');
  const lastSeparatorIndex = Math.max(lastDotIndex, lastCommaIndex);

  if (lastSeparatorIndex === -1) {
    const digitsOnly = cleanedValue.replace(/[.,]/g, '');
    return digitsOnly ? `${isNegative ? '-' : ''}${digitsOnly}` : null;
  }

  const decimalDigits = cleanedValue.slice(lastSeparatorIndex + 1).replace(/[.,]/g, '');
  const hasCurrencyDecimalPart = decimalDigits.length > 0 && decimalDigits.length <= 2;

  if (!hasCurrencyDecimalPart) {
    const digitsOnly = cleanedValue.replace(/[.,]/g, '');
    return digitsOnly ? `${isNegative ? '-' : ''}${digitsOnly}` : null;
  }

  const integerDigits = cleanedValue.slice(0, lastSeparatorIndex).replace(/[.,]/g, '');
  const normalizedInteger = integerDigits || '0';

  return `${isNegative ? '-' : ''}${normalizedInteger}.${decimalDigits}`;
}

function isBalancesTable(tableName?: string | null) {
  return tableName === BALANCES_TABLE_NAME;
}

function isTaxesTable(tableName?: string | null) {
  return tableName === 'taxes';
}

function isActivityTable(tableName?: string | null) {
  return tableName === ACTIVITY_TABLE_NAME;
}

function isTransactionsTable(tableName?: string | null) {
  return tableName === TRANSACTIONS_TABLE_NAME;
}

function isTransfersTable(tableName?: string | null) {
  return tableName === TRANSFERS_TABLE_NAME;
}

function isWalletsTable(tableName?: string | null) {
  return tableName === WALLETS_TABLE_NAME;
}

function getDataTableConfig(tableName: string) {
  return ALL_TABLES.find((table) => table.name === tableName);
}

function isTransactionSourceTable(tableName: string): tableName is TransactionSourceTable {
  return TRANSACTION_SOURCE_TABLES.includes(tableName as TransactionSourceTable);
}

function isTransferSourceTable(tableName: string): tableName is TransferSourceTable {
  return TRANSFER_SOURCE_TABLES.includes(tableName as TransferSourceTable);
}

function isActivitySourceTableName(tableName: string): tableName is ActivitySourceTable {
  return isTransactionSourceTable(tableName) || isTransferSourceTable(tableName);
}

function isTransactionActivityRow(row: ActivityRow): row is TransactionRow {
  return row.__record_type === 'transaction' && isTransactionSourceTable(row.__source_table);
}

function isTransferActivityRow(row: ActivityRow): row is TransferRow {
  return row.__record_type === 'transfer' && isTransferSourceTable(row.__source_table);
}

function getActivitySourceLabel(sourceTable: ActivitySourceTable) {
  switch (sourceTable) {
    case 'transactions':
      return 'Banking Transaction';
    case 'crypto_transactions':
      return 'Crypto Transaction';
    case 'bank_transfers':
      return 'Bank Transfer';
    case 'crypto_transfers':
      return 'Crypto Transfer';
  }
}

function getActivityCreateTitle(sourceTable: ActivitySourceTable) {
  switch (sourceTable) {
    case 'transactions':
      return 'a banking transaction';
    case 'crypto_transactions':
      return 'a crypto transaction';
    case 'bank_transfers':
      return 'a bank transfer';
    case 'crypto_transfers':
      return 'a crypto transfer';
  }
}

function getActivityCreateMessage(sourceTable: ActivitySourceTable) {
  switch (sourceTable) {
    case 'transactions':
      return 'Creates a row in `transactions`.';
    case 'crypto_transactions':
      return 'Creates a row in `crypto_transactions`.';
    case 'bank_transfers':
      return 'Creates a row in `bank_transfers`.';
    case 'crypto_transfers':
      return 'Creates a row in `crypto_transfers`.';
  }
}

function getActivityCreatedLabel(sourceTable: ActivitySourceTable) {
  switch (sourceTable) {
    case 'transactions':
      return 'Banking transaction';
    case 'crypto_transactions':
      return 'Crypto transaction';
    case 'bank_transfers':
      return 'Bank transfer';
    case 'crypto_transfers':
      return 'Crypto transfer';
  }
}

function getTableRowCount(tableName: string, tableData: Record<string, AdminRow[]>) {
  if (isActivityTable(tableName)) {
    return ACTIVITY_SOURCE_TABLES.reduce((total, sourceTable) => total + (tableData[sourceTable]?.length || 0), 0);
  }

  if (isTransactionsTable(tableName)) {
    return TRANSACTION_SOURCE_TABLES.reduce((total, sourceTable) => total + (tableData[sourceTable]?.length || 0), 0);
  }

  if (isTransfersTable(tableName)) {
    return TRANSFER_SOURCE_TABLES.reduce((total, sourceTable) => total + (tableData[sourceTable]?.length || 0), 0);
  }

  if (isBalancesTable(tableName)) {
    return BALANCE_SOURCE_TABLES.reduce((total, sourceTable) => total + (tableData[sourceTable]?.length || 0), 0);
  }

  if (isWalletsTable(tableName)) {
    return WALLET_SOURCE_TABLES.reduce((total, sourceTable) => total + (tableData[sourceTable]?.length || 0), 0);
  }

  return tableData[tableName]?.length || 0;
}

function isInternalRowField(key: string) {
  return key.startsWith('__');
}

function isReadOnlyRowField(key: string) {
  return ['id', 'user_id', 'created_at', 'updated_at'].includes(key) || isInternalRowField(key);
}

function isActivityDateField(row: AdminRow, key: string) {
  const sourceTable = String(row.__source_table || '');
  return (
    ['created_at', 'submitted_at'].includes(key) &&
    [...TRANSACTION_SOURCE_TABLES, ...TRANSFER_SOURCE_TABLES].includes(sourceTable as ActivitySourceTable)
  );
}

function normalizeTransactionRow(row: AdminRow, sourceTable: TransactionSourceTable): TransactionRow {
  return {
    ...row,
    id: `${sourceTable}:${String(row.id)}`,
    __source_table: sourceTable,
    __source_id: String(row.id),
    __source_label: getActivitySourceLabel(sourceTable),
    __transaction_kind: sourceTable === 'transactions' ? 'banking' : 'crypto',
    __record_type: 'transaction',
  };
}

function normalizeTransferRow(row: AdminRow, sourceTable: TransferSourceTable): TransferRow {
  const normalizedRow = normalizeIbanRow(sourceTable, row);
  return {
    ...normalizedRow,
    id: `${sourceTable}:${String(row.id)}`,
    __source_table: sourceTable,
    __source_id: String(row.id),
    __source_label: getActivitySourceLabel(sourceTable),
    __transaction_kind: sourceTable === 'bank_transfers' ? 'banking' : 'crypto',
    __record_type: 'transfer',
  };
}

function normalizeBalanceRow(row: AdminRow, sourceTable: BalanceSourceTable): BalanceRow {
  const assetCode = sourceTable === 'fiat_balances'
    ? String(row.currency || 'Fiat')
    : String(row.symbol || 'Crypto');
  const assetName = sourceTable === 'fiat_balances'
    ? String(row.name || getDefaultFiatAssetName(assetCode))
    : String(row.name || assetCode);
  const nextBalance = Number(row.balance ?? 0);

  return {
    ...row,
    id: `${sourceTable}:${String(row.id)}`,
    source_id: String(row.id),
    source_table: sourceTable,
    balance_kind: sourceTable === 'fiat_balances' ? 'fiat' : 'crypto',
    asset_code: assetCode,
    asset_name: assetName,
    __has_display_order: Object.prototype.hasOwnProperty.call(row, 'display_order'),
    display_order: Number(row.display_order || 0),
    balance: Number.isNaN(nextBalance) ? 0 : nextBalance,
    status: normalizeBalanceStatus(row.status),
  };
}

function getDefaultFiatAssetName(assetCode: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'currency' }).of(assetCode) || `${assetCode} Balance`;
  } catch {
    return `${assetCode} Balance`;
  }
}

function normalizeWalletRow(row: AdminRow, sourceTable: WalletSourceTable): WalletRow {
  return {
    ...row,
    id: `${sourceTable}:${String(row.id)}`,
    __source_table: sourceTable,
    __source_id: String(row.id),
    __source_label: sourceTable === 'crypto_wallets' ? 'Crypto' : 'Tax',
    __transaction_kind: sourceTable === 'crypto_wallets' ? 'crypto' : 'tax',
  };
}

function normalizeExchangeHistoryRow(row: AdminRow, sourceTable: ExchangeHistorySourceTable): ExchangeHistoryRow {
  return {
    ...row,
    id: `${sourceTable}:${String(row.id)}`,
    __source_table: sourceTable,
    __source_id: String(row.id),
    __source_label: sourceTable === 'currency_exchanges' ? 'Fiat Exchange' : 'Crypto Swap',
    __transaction_kind: sourceTable === 'currency_exchanges' ? 'banking' : 'crypto',
  };
}

function buildTransactionRows(tableData: Record<string, AdminRow[]>) {
  const regularRows = (tableData.transactions || []).map((row) => normalizeTransactionRow(row, 'transactions'));
  const cryptoRows = (tableData.crypto_transactions || []).map((row) => normalizeTransactionRow(row, 'crypto_transactions'));

  return [...regularRows, ...cryptoRows].sort((left, right) => {
    const leftTimestamp = getRowTimestampValue(left, getDataTableConfig(left.__source_table));
    const rightTimestamp = getRowTimestampValue(right, getDataTableConfig(right.__source_table));
    const leftTime = leftTimestamp ? new Date(leftTimestamp).getTime() : 0;
    const rightTime = rightTimestamp ? new Date(rightTimestamp).getTime() : 0;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.__source_label.localeCompare(right.__source_label);
  });
}

function buildTransferRows(tableData: Record<string, AdminRow[]>) {
  const bankRows = (tableData.bank_transfers || []).map((row) => normalizeTransferRow(row, 'bank_transfers'));
  const cryptoRows = (tableData.crypto_transfers || []).map((row) => normalizeTransferRow(row, 'crypto_transfers'));

  return [...bankRows, ...cryptoRows].sort((left, right) => {
    const leftTimestamp = getRowTimestampValue(left, getDataTableConfig(left.__source_table));
    const rightTimestamp = getRowTimestampValue(right, getDataTableConfig(right.__source_table));
    const leftTime = leftTimestamp ? new Date(leftTimestamp).getTime() : 0;
    const rightTime = rightTimestamp ? new Date(rightTimestamp).getTime() : 0;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.__source_label.localeCompare(right.__source_label);
  });
}

function buildActivityRows(tableData: Record<string, AdminRow[]>) {
  const transactionRows = (tableData.transactions || []).map((row) => normalizeTransactionRow(row, 'transactions'));
  const cryptoTransactionRows = (tableData.crypto_transactions || []).map((row) => normalizeTransactionRow(row, 'crypto_transactions'));
  const transferRows = (tableData.bank_transfers || []).map((row) => normalizeTransferRow(row, 'bank_transfers'));
  const cryptoTransferRows = (tableData.crypto_transfers || []).map((row) => normalizeTransferRow(row, 'crypto_transfers'));

  return [
    ...transactionRows,
    ...cryptoTransactionRows,
    ...transferRows,
    ...cryptoTransferRows,
  ].sort((left, right) => {
    const leftTimestamp = getRowTimestampValue(left, getDataTableConfig(left.__source_table));
    const rightTimestamp = getRowTimestampValue(right, getDataTableConfig(right.__source_table));
    const leftTime = leftTimestamp ? new Date(leftTimestamp).getTime() : 0;
    const rightTime = rightTimestamp ? new Date(rightTimestamp).getTime() : 0;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    if (left.__record_type !== right.__record_type) {
      return left.__record_type.localeCompare(right.__record_type);
    }

    return left.__source_label.localeCompare(right.__source_label);
  }) as ActivityRow[];
}

function buildBalanceRows(tableData: Record<string, AdminRow[]>) {
  const fiatRows = (tableData.fiat_balances || []).map((row) => normalizeBalanceRow(row, 'fiat_balances'));
  const cryptoRows = (tableData.crypto_balances || []).map((row) => normalizeBalanceRow(row, 'crypto_balances'));

  return [...fiatRows, ...cryptoRows].sort((left, right) => {
    if (left.balance_kind !== right.balance_kind) {
      return left.balance_kind === 'fiat' ? -1 : 1;
    }

    if (left.__has_display_order && right.__has_display_order && left.display_order !== right.display_order) {
      return left.display_order - right.display_order;
    }

    const leftCreatedAt = new Date(String(left.created_at || '')).getTime();
    const rightCreatedAt = new Date(String(right.created_at || '')).getTime();

    if (Number.isFinite(leftCreatedAt) && Number.isFinite(rightCreatedAt) && leftCreatedAt !== rightCreatedAt) {
      return leftCreatedAt - rightCreatedAt;
    }

    return left.asset_code.localeCompare(right.asset_code);
  });
}

function getSharedBalanceStatus(rows: BalanceRow[]): BalanceStatusControlValue {
  if (rows.length === 0) {
    return 'available';
  }

  const [firstRow, ...restRows] = rows;
  return restRows.every((row) => row.status === firstRow.status) ? firstRow.status : 'mixed';
}

function buildWalletRows(tableData: Record<string, AdminRow[]>) {
  const cryptoRows = (tableData.crypto_wallets || []).map((row) => normalizeWalletRow(row, 'crypto_wallets'));
  const taxRows = (tableData.tax_wallet_addresses || []).map((row) => normalizeWalletRow(row, 'tax_wallet_addresses'));

  return [...cryptoRows, ...taxRows].sort((left, right) => {
    const leftTimestamp = getRowTimestampValue(left, getDataTableConfig(left.__source_table));
    const rightTimestamp = getRowTimestampValue(right, getDataTableConfig(right.__source_table));
    const leftTime = leftTimestamp ? new Date(leftTimestamp).getTime() : 0;
    const rightTime = rightTimestamp ? new Date(rightTimestamp).getTime() : 0;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.__source_label.localeCompare(right.__source_label);
  });
}

function buildExchangeHistoryRows(tableData: Record<string, AdminRow[]>) {
  const fiatRows = (tableData.currency_exchanges || []).map((row) => normalizeExchangeHistoryRow(row, 'currency_exchanges'));
  const cryptoSwapRows = (tableData.crypto_transactions || [])
    .filter((row) => row.type === 'swap')
    .map((row) => normalizeExchangeHistoryRow(row, 'crypto_transactions'));

  return [...fiatRows, ...cryptoSwapRows].sort((left, right) => {
    const leftTimestamp = getRowTimestampValue(left, getDataTableConfig(left.__source_table));
    const rightTimestamp = getRowTimestampValue(right, getDataTableConfig(right.__source_table));
    const leftTime = leftTimestamp ? new Date(leftTimestamp).getTime() : 0;
    const rightTime = rightTimestamp ? new Date(rightTimestamp).getTime() : 0;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.__source_label.localeCompare(right.__source_label);
  });
}

function getRowTimestampValue(row: AdminRow, table?: TableConfig) {
  const candidateColumns = [
    table?.timestampColumn,
    table?.orderColumn,
    'created_at',
    'submitted_at',
    'updated_at',
    'reviewed_at',
  ].filter(Boolean) as string[];

  for (const column of candidateColumns) {
    const value = row[column];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

function getRowTimestampLabel(row: AdminRow, table?: TableConfig) {
  const timestamp = getRowTimestampValue(row, table);

  if (!timestamp) {
    return 'No timestamp column';
  }

  const label = table?.timestampColumn === 'submitted_at' || (!table?.timestampColumn && 'submitted_at' in row)
    ? 'Submitted'
    : 'Created';

  return `${label} ${formatDayMonthYear(timestamp)}`;
}

function formatDateTimeInputValue(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function normalizeDateForSave(value: unknown, fallback: unknown) {
  if (typeof value !== 'string' || !value.trim()) return fallback;

  const dateParts = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (dateParts) {
    const day = Number(dateParts[1]);
    const month = Number(dateParts[2]);
    const year = Number(dateParts[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date.toISOString();
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toISOString();
}

function isActivityDraftDateField(sourceTable: ActivitySourceTable, key: string) {
  return isActivitySourceTableName(sourceTable) && key.trim().toLowerCase() === 'created_at';
}

function shouldShowTransferCreateField(sourceTable: TransferSourceTable, key: string) {
  const normalizedKey = key.trim().toLowerCase();

  if (normalizedKey === 'transfer_type') return false;
  if (sourceTable === 'bank_transfers' && normalizedKey === 'target_currency') return false;
  if (sourceTable === 'crypto_transfers' && normalizedKey === 'target_symbol') return false;

  return true;
}

function enforceExternalTransferCreatePayload(
  sourceTable: TransferSourceTable,
  payload: Record<string, unknown>
) {
  payload.transfer_type = 'external';

  if (sourceTable === 'bank_transfers') {
    payload.target_currency = null;
  } else {
    payload.target_symbol = '';
  }
}

function normalizeActivityCreateDate(payload: Record<string, unknown>) {
  const normalizedDate = normalizeDateForSave(payload.created_at, null);

  if (typeof normalizedDate !== 'string') return false;

  payload.created_at = normalizedDate;
  return true;
}

function summariseEntries(row: AdminRow) {
  return Object.entries(row)
    .filter(([key]) => !isReadOnlyRowField(key))
    .slice(0, 4);
}

function sanitizePayload(row: AdminRow) {
  const payload: Record<string, unknown> = { ...row };
  delete payload.id;
  delete payload.user_id;
  if (!isActivityDateField(row, 'created_at')) {
    delete payload.created_at;
  }
  if (!isActivityDateField(row, 'submitted_at')) {
    delete payload.submitted_at;
  }
  delete payload.updated_at;
  Object.keys(payload).forEach((key) => {
    if (isInternalRowField(key)) {
      delete payload[key];
    }
  });
  return payload;
}

function sanitizeInsertPayload(row: AdminRow) {
  const payload: Record<string, unknown> = { ...row };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;
  Object.keys(payload).forEach((key) => {
    if (isInternalRowField(key)) {
      delete payload[key];
    }
  });
  return payload;
}

function normalizeWalletAdminPayload(payload: Record<string, unknown>) {
  return {
    ...payload,
    symbol: String(payload.symbol || '').trim().toUpperCase(),
    network: String(payload.network || '').trim(),
    wallet_address: String(payload.wallet_address || '').trim(),
    payment_uri: String(payload.payment_uri || '').trim(),
    ...(Object.prototype.hasOwnProperty.call(payload, 'name')
      ? { name: String(payload.name || '').trim() }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(payload, 'label')
      ? { label: String(payload.label || '').trim() || 'Tax Payment Wallet' }
      : {}),
  };
}

function buildTaxSummaryCardUpsertRows(
  rows: AdminRow[],
  userId: string,
  targetStatus: TaxStatus,
  targetAmount: number,
  currency: string
) {
  const amounts = new Map<TaxStatus, number>();

  rows.forEach((row) => {
    amounts.set(normalizeTaxStatus(row.status), getNumericTaxAmount(row.amount));
  });

  return TAX_STATUS_OPTIONS.map(({ value: status }) => ({
    user_id: userId,
    status,
    amount: status === targetStatus ? targetAmount : amounts.get(status) || 0,
    currency,
    updated_at: new Date().toISOString(),
  }));
}

function shouldRetryTaxSummaryWithoutRpc(error: { code?: string; message?: string } | null) {
  if (!error) return false;

  const message = (error.message || '').toLowerCase();
  return error.code === 'P0001'
    || error.code === 'PGRST202'
    || error.code === '42883'
    || error.code === '42501'
    || message.includes('admin access required')
    || message.includes('could not find the function')
    || message.includes('permission denied');
}

function isLongField(key: string, value: unknown) {
  const longKeys = ['comment', 'description', 'details', 'notes', 'review_notes', 'address', 'wallet_address', 'payment_uri', 'tx_hash'];
  return typeof value === 'string' && (value.length > 48 || longKeys.some((part) => key.includes(part)));
}

function coerceValueForSave(originalValue: unknown, nextValue: unknown) {
  if (typeof originalValue === 'number') {
    if (nextValue === '') return 0;
    const numericValue = Number(nextValue);
    return Number.isNaN(numericValue) ? originalValue : numericValue;
  }

  if (typeof originalValue === 'boolean') {
    return Boolean(nextValue);
  }

  return nextValue;
}

function normalizeTransferSavePayload(sourceTable: TransferSourceTable, row: AdminRow) {
  const payload: AdminRow = { ...row };
  const transferType = String(payload.transfer_type || '');

  if (sourceTable === 'bank_transfers') {
    if (payload.status === 'approved') {
      payload.status = 'completed';
    }

    if (transferType === 'internal') {
      payload.recipient_name = '';
      payload.bank_name = '';
      payload.iban = '';
      delete payload.routing_number;
      payload.account_number = '';
      payload.swift_code = '';
    }

    if (transferType === 'external') {
      payload.target_currency = null;
    }
  }

  if (sourceTable === 'crypto_transfers') {
    if (transferType === 'internal') {
      payload.direction = 'send';
      payload.recipient_address = '';
      payload.sender_address = '';
      payload.tx_hash = '';
      payload.fee = 0;
    }

    if (transferType === 'external') {
      payload.target_symbol = '';
    }
  }

  return payload;
}

function statusClasses(kind: 'success' | 'error') {
  return kind === 'success'
    ? 'border-[#006446]/20 bg-[#006446]/[0.06] text-[#006446]'
    : 'border-red-200 bg-red-50 text-red-700';
}

function buildCreateTemplate(table: TableConfig, userId: string, sampleRow?: AdminRow) {
  const payload = sampleRow
    ? sanitizeInsertPayload(sampleRow)
    : table.name === 'transactions'
    ? {
        user_id: userId,
        type: 'debit',
        amount: '',
        description: '',
        reference: '',
        notes: '',
        status: 'completed',
      }
    : table.name === 'crypto_transactions'
    ? {
        user_id: userId,
        type: 'buy',
        symbol: '',
        name: '',
        amount: 0,
        price_per_unit: 0,
        total_value: 0,
        fee: 0,
        from_symbol: '',
        to_symbol: '',
        wallet_address: '',
        tx_hash: '',
        status: 'completed',
        description: '',
        comment: '',
      }
    : table.name === 'crypto_wallets'
    ? {
        user_id: userId,
        symbol: '',
        name: '',
        wallet_address: '',
        network: '',
        payment_uri: '',
      }
    : table.name === 'tax_wallet_addresses'
    ? {
        user_id: userId,
        label: 'Tax Payment Wallet',
        symbol: '',
        network: '',
        wallet_address: '',
        payment_uri: '',
      }
    : table.name === 'taxes'
    ? {
        user_id: userId,
        tax_type: 'income',
        tax_year: new Date().getFullYear(),
        description: '',
        amount_owed: 0,
        amount_paid: 0,
        due_date: new Date().toISOString().slice(0, 10),
        status: 'pending',
        filed_date: null,
        reference_number: '',
        notes: '',
      }
    : {};

  if (table.scope === 'user' && table.filterColumn && userId) {
    payload[table.filterColumn] = payload[table.filterColumn] ?? userId;
  }

  if (table.name === 'bank_transfers' || table.name === 'crypto_transfers') {
    payload.status = 'pending';
    enforceExternalTransferCreatePayload(table.name, payload);
  }

  if (isActivitySourceTableName(table.name)) {
    payload.created_at = new Date().toISOString();
  }

  return payload;
}

function toDraftFields(table: TableConfig, userId: string, sampleRow?: AdminRow): DraftField[] {
  const payload = buildCreateTemplate(table, userId, sampleRow);
  const entries = Object.entries(payload);

  if (entries.length === 0) {
    return [{ id: crypto.randomUUID(), key: '', value: '' }];
  }

  return entries.map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value: value === null || value === undefined ? '' : String(value),
  }));
}

function parseDraftValue(value: string) {
  const trimmed = value.trim();

  if (trimmed === '') return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (!Number.isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);

  return value;
}

export function ProfileEditorCard({
  profile,
  saving,
  onSave,
}: {
  profile: ProfileRecord;
  saving: boolean;
  onSave: (updates: ProfileSavePayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    full_name: profile.full_name,
    email: profile.email,
    account_iban: profile.account_iban || '',
    kyc_status: profile.kyc_status,
    crm_role: profile.crm_role,
    assigned_manager_id: profile.assigned_manager_id || '',
    assigned_agent_id: profile.assigned_agent_id || '',
    password: profile.plain_password || '',
    account_created_date: accountDateIsoToInputValue(profile.created_at),
    show_account_created_at: profile.show_account_created_at !== false,
  });

  useEffect(() => {
    setForm({
      full_name: profile.full_name,
      email: profile.email,
      account_iban: profile.account_iban || '',
      kyc_status: profile.kyc_status,
      crm_role: profile.crm_role,
      assigned_manager_id: profile.assigned_manager_id || '',
      assigned_agent_id: profile.assigned_agent_id || '',
      password: '',
      account_created_date: accountDateIsoToInputValue(profile.created_at),
      show_account_created_at: profile.show_account_created_at !== false,
    });
  }, [profile]);

  return (
    <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#006446]">Profile Control</p>
          <h2 className="mt-2 text-2xl font-serif font-bold text-slate-950">{profile.full_name || 'Unnamed profile'}</h2>
          <p className="mt-1 text-sm text-slate-500">{profile.email || 'No email stored'} · {profile.id}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#006446]/12 bg-[#006446]/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#006446]">
            KYC {form.kyc_status}
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getCrmRoleClasses(normalizeCrmRole(form.crm_role, profile.crm_role))}`}>
            {getCrmRoleLabel(normalizeCrmRole(form.crm_role, profile.crm_role))}
          </span>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Full Name</span>
          <input
            value={form.full_name}
            onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
            className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Account IBAN</span>
          <input
            value={form.account_iban}
            onChange={(event) => setForm((prev) => ({ ...prev, account_iban: event.target.value }))}
            placeholder="Enter customer IBAN"
            className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">KYC Status</span>
          <Dropdown
            value={form.kyc_status}
            options={kycOptions}
            onChange={(value) => setForm((prev) => ({ ...prev, kyc_status: value as KycStatus }))}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">New Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Leave empty to keep current password"
            className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
          />
        </label>

      </div>

      <div className="flex flex-col gap-3 border-t border-[#006446]/10 bg-[#006446]/[0.03] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Auth + Profile Sync</p>
          <p className="text-sm text-slate-500">Email and password changes update Supabase Auth for the selected user too.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getCrmRoleClasses(normalizeCrmRole(form.crm_role, profile.crm_role))}`}>
            {getCrmRoleLabel(normalizeCrmRole(form.crm_role, profile.crm_role))}
          </div>

          <button
            type="button"
            onClick={() => void onSave({
              ...form,
              crm_role: normalizeCrmRole(form.crm_role, profile.crm_role),
              assigned_manager_id: form.assigned_manager_id || null,
              assigned_agent_id: form.assigned_agent_id || null,
            })}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateUserDialog({
  profiles,
  viewerId,
  viewerRole,
  creating,
  error,
  onCancel,
  onCreate,
}: {
  profiles: ProfileRecord[];
  viewerId: string;
  viewerRole: CrmRole;
  creating: boolean;
  error: string;
  onCancel: () => void;
  onCreate: (draft: NewUserDraft) => Promise<void>;
}) {
  const [form, setForm] = useState<NewUserDraft>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    account_iban: '',
    kyc_status: 'pending',
    crm_role: 'customer',
    assigned_manager_id: '',
    assigned_agent_id: '',
    email_confirm: true,
    account_created_date: getTodayDateInputValue(),
    show_account_created_at: true,
  });
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const roleOptions = useMemo(
    () => {
      const allowedRoles: CrmRole[] = viewerRole === 'admin'
        ? ['customer', 'agent', 'superior_manager', 'admin']
        : viewerRole === 'superior_manager'
        ? ['customer', 'agent']
        : ['customer'];

      return allowedRoles.map((role) => ({ value: role, label: getCrmRoleLabel(role) }));
    },
    [viewerRole]
  );
  const managerOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...profiles
        .filter((profile) => profile.crm_role === 'superior_manager')
        .map((profile) => ({ value: profile.id, label: getProfileDisplayName(profile) })),
    ],
    [profiles]
  );
  const agentOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...profiles
        .filter(
          (profile) =>
            profile.crm_role === 'agent' &&
            (viewerRole === 'admin' || profile.assigned_manager_id === viewerId) &&
            (!form.assigned_manager_id || profile.assigned_manager_id === form.assigned_manager_id)
        )
        .map((profile) => ({ value: profile.id, label: getProfileDisplayName(profile) })),
    ],
    [form.assigned_manager_id, profiles, viewerId, viewerRole]
  );

  const handleRoleChange = (value: string) => {
    const nextRole = normalizeCrmRole(value, 'customer');
    setForm((current) => ({
      ...current,
      crm_role: nextRole,
      assigned_manager_id:
        nextRole === 'admin' || nextRole === 'superior_manager' ? '' : current.assigned_manager_id,
      assigned_agent_id: nextRole === 'customer' ? current.assigned_agent_id : '',
    }));
  };

  const handleManagerChange = (managerId: string) => {
    setForm((current) => {
      const currentAgent = profiles.find((profile) => profile.id === current.assigned_agent_id);
      const keepAgent =
        !currentAgent || !managerId || currentAgent.assigned_manager_id === managerId;
      return {
        ...current,
        assigned_manager_id: managerId,
        assigned_agent_id: keepAgent ? current.assigned_agent_id : '',
      };
    });
  };

  const handleAgentChange = (agentId: string) => {
    const agent = profiles.find((profile) => profile.id === agentId);
    setForm((current) => ({
      ...current,
      assigned_agent_id: agentId,
      assigned_manager_id: agent?.assigned_manager_id || current.assigned_manager_id,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError('');

    if (!form.full_name.trim()) {
      setValidationError('Full name is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setValidationError('Enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setValidationError('The password confirmation does not match.');
      return;
    }
    if (!accountDateInputToIso(form.account_created_date)) {
      setValidationError('Choose a valid account creation date.');
      return;
    }

    void onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-slate-950/55 p-4">
      <button
        type="button"
        onClick={creating ? undefined : onCancel}
        aria-label="Close create user dialog"
        className="absolute inset-0 cursor-default"
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
        className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-[#006446]/14 bg-white shadow-[0_32px_100px_-38px_rgba(0,100,70,0.65)]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#006446]/10 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Account setup</p>
            <h2 id="create-user-title" className="mt-1 text-2xl font-serif font-bold text-slate-950">Create new user</h2>
            <p className="mt-1 text-sm text-slate-500">Create the login, CRM profile, balances, and wallets in one operation.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={creating}
            aria-label="Close create user dialog"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#006446]/12 text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Full name *</span>
            <input
              value={form.full_name}
              onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
              disabled={creating}
              autoFocus
              autoComplete="name"
              className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15 disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              disabled={creating}
              autoComplete="email"
              className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15 disabled:bg-slate-50"
            />
          </label>

          <div className="space-y-2">
            <label htmlFor="create-user-password" className="block text-sm font-medium text-slate-700">Password *</label>
            <div className="relative">
              <input
                id="create-user-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                disabled={creating}
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#006446]/14 bg-white py-3 pl-4 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15 disabled:bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={creating}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-500 transition-colors hover:text-[#006446] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">Use at least 6 characters.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="create-user-confirm-password" className="block text-sm font-medium text-slate-700">Confirm password *</label>
            <div className="relative">
              <input
                id="create-user-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirm_password}
                onChange={(event) => setForm((current) => ({ ...current, confirm_password: event.target.value }))}
                disabled={creating}
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#006446]/14 bg-white py-3 pl-4 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15 disabled:bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                disabled={creating}
                aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                aria-pressed={showConfirmPassword}
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-500 transition-colors hover:text-[#006446] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Account IBAN</span>
            <input
              value={form.account_iban}
              onChange={(event) => setForm((current) => ({ ...current, account_iban: event.target.value }))}
              disabled={creating}
              placeholder="Optional"
              autoComplete="off"
              className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 font-mono text-sm uppercase text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15 disabled:bg-slate-50"
            />
          </label>

          <div className={`space-y-2 ${creating ? 'pointer-events-none opacity-60' : ''}`}>
            <span className="text-sm font-medium text-slate-700">KYC status</span>
            <Dropdown
              value={form.kyc_status}
              options={kycOptions}
              onChange={(value) => setForm((current) => ({ ...current, kyc_status: value as KycStatus }))}
            />
          </div>

          <div className={`space-y-2 ${creating ? 'pointer-events-none opacity-60' : ''}`}>
            <span className="text-sm font-medium text-slate-700">CRM role</span>
            <Dropdown value={form.crm_role} options={roleOptions} onChange={handleRoleChange} />
          </div>

          <div className="space-y-4 rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.03] px-4 py-4 md:col-span-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Client account date</p>
              <p className="mt-1 text-sm text-slate-500">Set the membership date and choose whether the client can see it.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Account created date</span>
                <input
                  type="date"
                  value={form.account_created_date}
                  onChange={(event) => setForm((current) => ({ ...current, account_created_date: event.target.value }))}
                  disabled={creating}
                  required
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15 disabled:bg-slate-50"
                />
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[#006446]/10 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={!form.show_account_created_at}
                  onChange={(event) => setForm((current) => ({ ...current, show_account_created_at: !event.target.checked }))}
                  disabled={creating}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#006446]"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">Hide date from client</span>
                  <span className="mt-1 block text-xs text-slate-500">Removes “Member since” from the client profile card.</span>
                </span>
              </label>
            </div>
          </div>

          {(form.crm_role === 'customer' || form.crm_role === 'agent') && viewerRole !== 'agent' && (
            <div className="space-y-4 rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.03] px-4 py-4 md:col-span-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Hierarchy assignment</p>
                <p className="mt-1 text-sm text-slate-500">Assignments can be left empty and added later.</p>
              </div>
              <div className={`grid gap-4 ${form.crm_role === 'customer' && viewerRole === 'admin' ? 'md:grid-cols-2' : ''} ${creating ? 'pointer-events-none opacity-60' : ''}`}>
                {viewerRole === 'admin' && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Superior manager</span>
                    <Dropdown
                      value={form.assigned_manager_id}
                      options={managerOptions}
                      onChange={handleManagerChange}
                      searchable
                      searchPlaceholder="Search managers..."
                    />
                  </div>
                )}
                {form.crm_role === 'customer' && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Assigned agent</span>
                    <Dropdown
                      value={form.assigned_agent_id}
                      options={agentOptions}
                      onChange={handleAgentChange}
                      searchable
                      searchPlaceholder="Search agents..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.03] px-4 py-4 md:col-span-2">
            <input
              type="checkbox"
              checked={form.email_confirm}
              onChange={(event) => setForm((current) => ({ ...current, email_confirm: event.target.checked }))}
              disabled={creating}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#006446]"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">Mark email as confirmed</span>
              <span className="mt-1 block text-xs text-slate-500">The user can sign in immediately with the password above.</span>
            </span>
          </label>

          {(validationError || error) && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-[#006446]/10 bg-[#f7fbf8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {viewerRole === 'admin'
              ? 'Administrators can create every CRM role.'
              : viewerRole === 'superior_manager'
              ? 'Superior managers can create agents and customers in their team.'
              : 'Agents can create customers assigned directly to themselves.'}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              disabled={creating}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {creating ? 'Creating user...' : 'Create user'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function DeleteUserDialog({
  profile,
  deleting,
  onCancel,
  onConfirm,
}: {
  profile: ProfileRecord;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: (confirmation: string) => Promise<void>;
}) {
  const [confirmation, setConfirmation] = useState('');
  const confirmationTarget = profile.email.trim() || profile.id;
  const confirmationMatches = confirmation.trim().toLowerCase() === confirmationTarget.toLowerCase();

  useEffect(() => {
    setConfirmation('');
  }, [profile.id]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 p-4">
      <button
        type="button"
        onClick={deleting ? undefined : onCancel}
        aria-label="Close delete user confirmation"
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-red-200 bg-white shadow-[0_32px_100px_-38px_rgba(127,29,29,0.65)]"
      >
        <div className="flex items-start gap-4 border-b border-red-100 bg-red-50/70 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">Permanent action</p>
            <h2 id="delete-user-title" className="mt-1 text-2xl font-serif font-bold text-slate-950">
              Delete {profile.full_name || 'this user'}?
            </h2>
            <p className="mt-1 break-all text-sm text-slate-600">{profile.email || profile.id}</p>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-red-200 bg-red-50/60 px-4 py-4 text-sm text-red-900">
            This permanently removes the Supabase Auth login, CRM profile, balances, cards, transactions,
            transfers, exchanges, loans, taxes, KYC records and uploaded KYC documents. This cannot be undone.
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Type <span className="font-mono text-red-700">{confirmationTarget}</span> to confirm
            </span>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={deleting}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm(confirmation)}
            disabled={deleting || !confirmationMatches}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-200"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? 'Deleting user...' : 'Permanently delete user'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSummaryCard({
  profile,
  saving,
  viewerRole,
  viewerId,
  profiles,
  onSave,
}: {
  profile: ProfileRecord;
  saving: boolean;
  viewerRole: CrmRole;
  viewerId: string | null;
  profiles: ProfileRecord[];
  onSave: (updates: ProfileSavePayload) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name,
    email: profile.email,
    account_iban: profile.account_iban || '',
    kyc_status: profile.kyc_status,
    crm_role: profile.crm_role,
    assigned_manager_id: profile.assigned_manager_id || '',
    assigned_agent_id: profile.assigned_agent_id || '',
    password: '',
    account_created_date: accountDateIsoToInputValue(profile.created_at),
    show_account_created_at: profile.show_account_created_at !== false,
  });
  const profileMap = useMemo(() => new Map(profiles.map((entry) => [entry.id, entry])), [profiles]);
  const roleOptions = useMemo(
    () => [
      { value: 'customer', label: getCrmRoleLabel('customer') },
      { value: 'agent', label: getCrmRoleLabel('agent') },
      { value: 'superior_manager', label: getCrmRoleLabel('superior_manager') },
      { value: 'admin', label: getCrmRoleLabel('admin') },
    ],
    []
  );
  const superiorManagerOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...profiles
        .filter((entry) => entry.crm_role === 'superior_manager')
        .map((entry) => ({ value: entry.id, label: getProfileDisplayName(entry) })),
    ],
    [profiles]
  );
  const agentOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...profiles
        .filter((entry) => entry.crm_role === 'agent' && (viewerRole === 'admin' || entry.assigned_manager_id === viewerId))
        .map((entry) => ({ value: entry.id, label: getProfileDisplayName(entry) })),
    ],
    [profiles, viewerId, viewerRole]
  );
  const managerProfile = profile.assigned_manager_id ? profileMap.get(profile.assigned_manager_id) : null;
  const agentProfile = profile.assigned_agent_id ? profileMap.get(profile.assigned_agent_id) : null;
  const canEditRole = viewerRole === 'admin';
  const canEditManagerAssignment = viewerRole === 'admin';
  const canEditAgentAssignment = viewerRole === 'admin' || viewerRole === 'superior_manager';
  const canEditAccountDate = viewerRole === 'admin'
    || viewerRole === 'superior_manager'
    || viewerRole === 'agent';
  const currentFormRole = normalizeCrmRole(form.crm_role, profile.crm_role);
  const accountDateIsValid = Boolean(accountDateInputToIso(form.account_created_date));

  const resetForm = () => {
    setForm({
      full_name: profile.full_name,
      email: profile.email,
      account_iban: profile.account_iban || '',
      kyc_status: profile.kyc_status,
      crm_role: profile.crm_role,
      assigned_manager_id: profile.assigned_manager_id || '',
      assigned_agent_id: profile.assigned_agent_id || '',
      password: profile.plain_password || '',
      account_created_date: accountDateIsoToInputValue(profile.created_at),
      show_account_created_at: profile.show_account_created_at !== false,
    });
  };

  useEffect(() => {
    setForm({
      full_name: profile.full_name,
      email: profile.email,
      account_iban: profile.account_iban || '',
      kyc_status: profile.kyc_status,
      crm_role: profile.crm_role,
      assigned_manager_id: profile.assigned_manager_id || '',
      assigned_agent_id: profile.assigned_agent_id || '',
      password: profile.plain_password || '',
      account_created_date: accountDateIsoToInputValue(profile.created_at),
      show_account_created_at: profile.show_account_created_at !== false,
    });
  }, [profile]);

  const openEditor = () => {
    resetForm();
    setIsOpen(true);
  };

  const closeEditor = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleRoleChange = (nextRoleValue: string) => {
    const nextRole = normalizeCrmRole(nextRoleValue, profile.crm_role);
    setForm((prev) => ({
      ...prev,
      crm_role: nextRole,
      assigned_manager_id: nextRole === 'admin' || nextRole === 'superior_manager' ? '' : prev.assigned_manager_id,
      assigned_agent_id: nextRole === 'customer' ? prev.assigned_agent_id : '',
    }));
  };

  return (
    <>
      <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
        <div className="flex flex-col gap-5 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#006446]">Profile Control</p>
            <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-serif font-bold text-slate-950">{profile.full_name || 'Unnamed profile'}</h2>
                <p className="mt-1 truncate text-sm text-slate-500">{profile.email || 'No email stored'} | {profile.id}</p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <span className="rounded-full border border-[#006446]/12 bg-[#006446]/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#006446]">
                  KYC {profile.kyc_status}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getCrmRoleClasses(profile.crm_role)}`}>
                  {getCrmRoleLabel(profile.crm_role)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Email</p>
                <p className="mt-1 break-all text-sm text-slate-700">{profile.email || 'No email stored'}</p>
              </div>
              <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Account IBAN</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-700">{profile.account_iban || 'No IBAN stored'}</p>
              </div>
              <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Password</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-700">{profile.plain_password || 'No password stored'}</p>
              </div>
              <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">CRM Role</p>
                <p className="mt-1 text-sm text-slate-700">{getCrmRoleLabel(profile.crm_role)}</p>
              </div>
              <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Superior Manager</p>
                <p className="mt-1 text-sm text-slate-700">{profile.assigned_manager_id ? getProfileDisplayName(managerProfile) : 'Unassigned'}</p>
              </div>
              <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Assigned Agent</p>
                <p className="mt-1 text-sm text-slate-700">{profile.assigned_agent_id ? getProfileDisplayName(agentProfile) : 'Unassigned'}</p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={openEditor}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36]"
            >
              <PencilLine className="h-4 w-4" />
              Edit profile
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <button
            type="button"
            onClick={closeEditor}
            aria-label="Close profile editor"
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-[#006446]/14 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.45)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#006446]/10 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#006446]">Profile Control</p>
                <h3 className="mt-2 text-2xl font-serif font-bold text-slate-950">Edit {profile.full_name || 'profile'}</h3>
                <p className="mt-1 text-sm text-slate-500">Update profile details, hierarchy scope, KYC status, and auth credentials.</p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#006446]/12 text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
                aria-label="Close profile editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Full Name</span>
                <input
                  value={form.full_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Account IBAN</span>
                <input
                  value={form.account_iban}
                  onChange={(event) => setForm((prev) => ({ ...prev, account_iban: event.target.value }))}
                  placeholder="Enter customer IBAN"
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">KYC Status</span>
                <Dropdown
                  value={form.kyc_status}
                  options={kycOptions}
                  onChange={(value) => setForm((prev) => ({ ...prev, kyc_status: value as KycStatus }))}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="text"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Current stored password"
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
                <p className="text-xs text-slate-500">Changing this updates both Supabase Auth and `profiles.plain_password`.</p>
              </label>

              <div className="space-y-4 rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.03] px-4 py-4 md:col-span-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Client account date</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Change the profile creation date and control whether it appears on the client profile.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Profile created date</span>
                    <input
                      type="date"
                      value={form.account_created_date}
                      onChange={(event) => setForm((prev) => ({ ...prev, account_created_date: event.target.value }))}
                      disabled={!canEditAccountDate || saving}
                      required
                      className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    />
                    {!accountDateIsValid && (
                      <p className="text-xs font-medium text-red-600">Choose a valid profile creation date.</p>
                    )}
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-[#006446]/10 bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!form.show_account_created_at}
                      onChange={(event) => setForm((prev) => ({ ...prev, show_account_created_at: !event.target.checked }))}
                      disabled={!canEditAccountDate || saving}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#006446] disabled:cursor-not-allowed"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">Hide date from client</span>
                      <span className="mt-1 block text-xs text-slate-500">Removes “Member since” from the client profile card.</span>
                    </span>
                  </label>
                </div>

                <p className="text-xs text-slate-500">
                  CRM staff can change these settings only for profiles inside their assigned scope.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Role</span>
                {canEditRole ? (
                  <Dropdown
                    value={currentFormRole}
                    options={roleOptions}
                    onChange={handleRoleChange}
                  />
                ) : (
                  <div className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getCrmRoleClasses(profile.crm_role)}`}>
                    {getCrmRoleLabel(profile.crm_role)}
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.03] px-4 py-4 md:col-span-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Hierarchy Assignment</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Assign this profile to the right manager or agent from here.
                  </p>
                </div>

                {currentFormRole === 'customer' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Superior Manager</span>
                      {canEditManagerAssignment ? (
                        <Dropdown
                          value={form.assigned_manager_id}
                          options={superiorManagerOptions}
                          onChange={(value) => setForm((prev) => ({ ...prev, assigned_manager_id: value }))}
                        />
                      ) : (
                        <div className="rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-700">
                          {form.assigned_manager_id ? getProfileDisplayName(profileMap.get(form.assigned_manager_id)) : 'Assigned by admin'}
                        </div>
                      )}
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Assigned Agent</span>
                      {canEditAgentAssignment ? (
                        <Dropdown
                          value={form.assigned_agent_id}
                          options={agentOptions}
                          onChange={(value) => setForm((prev) => ({ ...prev, assigned_agent_id: value }))}
                        />
                      ) : (
                        <div className="rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-700">
                          {form.assigned_agent_id ? getProfileDisplayName(profileMap.get(form.assigned_agent_id)) : 'Unassigned'}
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {currentFormRole === 'agent' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Superior Manager</span>
                      {canEditManagerAssignment ? (
                        <Dropdown
                          value={form.assigned_manager_id}
                          options={superiorManagerOptions}
                          onChange={(value) => setForm((prev) => ({ ...prev, assigned_manager_id: value }))}
                        />
                      ) : (
                        <div className="rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-700">
                          {form.assigned_manager_id ? getProfileDisplayName(profileMap.get(form.assigned_manager_id)) : 'Assigned by admin'}
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {(currentFormRole === 'superior_manager' || currentFormRole === 'admin') && (
                  <div className="rounded-xl border border-dashed border-[#006446]/16 bg-white px-4 py-3 text-sm text-slate-600">
                    Customers and agents are assigned from their own profile editor. Set a user to Customer or Agent to assign them here.
                  </div>
                )}
              </div>

            </div>

            <div className="flex flex-col gap-3 border-t border-[#006446]/10 bg-[#006446]/[0.03] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Auth + Profile Sync</p>
                <p className="text-sm text-slate-500">Email and password changes update Supabase Auth for the selected user too.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void onSave({
                    ...form,
                    crm_role: currentFormRole,
                    assigned_manager_id: form.assigned_manager_id || null,
                    assigned_agent_id: form.assigned_agent_id || null,
                  })}
                  disabled={saving || !accountDateIsValid}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function toBrandingForm(branding: BrandingSettings): BrandingForm {
  return {
    brandName: branding.brandName,
    brandKeyword: branding.brandKeyword,
    navbarLogoUrl: branding.navbarLogoUrl,
    footerLogoUrl: branding.footerLogoUrl,
    faviconIcoUrl: branding.faviconIcoUrl,
    favicon16Url: branding.favicon16Url,
    favicon32Url: branding.favicon32Url,
    appleTouchIconUrl: branding.appleTouchIconUrl,
    favicon192Url: branding.favicon192Url,
    favicon512Url: branding.favicon512Url,
    mfiId: branding.mfiId,
    countryCode: branding.countryCode,
    mfiCode: branding.mfiCode,
    institutionalTitle: branding.institutionalTitle,
    institutionalDescription: branding.institutionalDescription,
    mfiIdNote: branding.mfiIdNote,
    depositorProtectionTitle: branding.depositorProtectionTitle,
    depositorProtectionDescription: branding.depositorProtectionDescription,
    depositorProtectionUrl: branding.depositorProtectionUrl,
    legalContactEmail: branding.legalContactEmail,
  };
}

function BrandingSettingsCard({
  form,
  savedBranding,
  syncLogos,
  loading,
  remoteAvailable,
  saving,
  uploadingLogo,
  onFieldChange,
  onSyncLogosChange,
  onUploadLogo,
  onUploadFavicon,
  onSave,
  onReset,
  onRefresh,
}: {
  form: BrandingForm;
  savedBranding: BrandingSettings;
  syncLogos: boolean;
  loading: boolean;
  remoteAvailable: boolean;
  saving: boolean;
  uploadingLogo: 'navbar' | 'footer' | 'favicon' | null;
  onFieldChange: (field: keyof BrandingForm, value: string) => void;
  onSyncLogosChange: (checked: boolean) => void;
  onUploadLogo: (slot: 'navbar' | 'footer', file: File) => Promise<void>;
  onUploadFavicon: (file: File) => Promise<void>;
  onSave: () => Promise<void>;
  onReset: () => void;
  onRefresh: () => Promise<void>;
}) {
  const navbarLogoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const previewBranding: BrandingSettings = {
    brandName: form.brandName.trim() || DEFAULT_BRANDING.brandName,
    brandKeyword: form.brandKeyword.trim() || DEFAULT_BRANDING.brandKeyword,
    navbarLogoUrl: form.navbarLogoUrl.trim() || DEFAULT_BRANDING.navbarLogoUrl,
    footerLogoUrl: form.footerLogoUrl.trim() || DEFAULT_BRANDING.footerLogoUrl,
    faviconIcoUrl: form.faviconIcoUrl.trim() || DEFAULT_BRANDING.faviconIcoUrl,
    favicon16Url: form.favicon16Url.trim() || DEFAULT_BRANDING.favicon16Url,
    favicon32Url: form.favicon32Url.trim() || DEFAULT_BRANDING.favicon32Url,
    appleTouchIconUrl: form.appleTouchIconUrl.trim() || DEFAULT_BRANDING.appleTouchIconUrl,
    favicon192Url: form.favicon192Url.trim() || DEFAULT_BRANDING.favicon192Url,
    favicon512Url: form.favicon512Url.trim() || DEFAULT_BRANDING.favicon512Url,
    mfiId: form.mfiId.trim() || DEFAULT_BRANDING.mfiId,
    countryCode: form.countryCode.trim() || DEFAULT_BRANDING.countryCode,
    mfiCode: form.mfiCode.trim() || DEFAULT_BRANDING.mfiCode,
    institutionalTitle: form.institutionalTitle.trim(),
    institutionalDescription: form.institutionalDescription.trim(),
    mfiIdNote: form.mfiIdNote.trim(),
    depositorProtectionTitle: form.depositorProtectionTitle.trim(),
    depositorProtectionDescription: form.depositorProtectionDescription.trim(),
    depositorProtectionUrl: form.depositorProtectionUrl.trim() || DEFAULT_BRANDING.depositorProtectionUrl,
    legalContactEmail: form.legalContactEmail.trim().toLowerCase() || DEFAULT_BRANDING.legalContactEmail,
    updatedAt: savedBranding.updatedAt,
  };
  const referencePreview = `${getBrandReferencePrefix(previewBranding)}-A1B2C3D4`;
  const updatedLabel = savedBranding.updatedAt
    ? new Date(savedBranding.updatedAt).toLocaleString()
    : 'Default settings';

  const handleFileChange = (slot: 'navbar' | 'footer') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) void onUploadLogo(slot, file);
  };

  const handleFaviconFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) void onUploadFavicon(file);
  };

  const uploadButton = (slot: 'navbar' | 'footer', label: string) => {
    const inputRef = slot === 'navbar' ? navbarLogoInputRef : footerLogoInputRef;

    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={Boolean(uploadingLogo)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 bg-white px-4 py-2 text-sm font-semibold text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploadingLogo === slot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          tabIndex={-1}
          disabled={Boolean(uploadingLogo)}
          onChange={handleFileChange(slot)}
        />
      </>
    );
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 px-6 py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Site Branding</p>
            <h2 className="mt-2 text-3xl font-serif font-bold text-slate-950">Brand and institutional settings</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Save once to update logos, generated favicons, site branding, institutional identification, and dashboard invoices.
            </p>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
              remoteAvailable
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
              <span className={`h-2 w-2 rounded-full ${remoteAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {remoteAvailable ? 'Supabase sync ready' : 'Using local fallback until Supabase responds'}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={loading || saving}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Reset form
            </button>

            <button
              type="button"
              onClick={() => void onSave()}
              disabled={saving || Boolean(uploadingLogo)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save site settings
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 bg-[#f7fbf8] p-5 lg:grid-cols-[1.1fr,0.9fr] sm:p-6">
        <div className="space-y-5 rounded-[28px] border border-[#006446]/12 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Full brand name</span>
              <input
                value={form.brandName}
                onChange={(event) => onFieldChange('brandName', event.target.value)}
                placeholder="Heritage Bank"
                className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Legacy brand replacement</span>
              <input
                value={form.brandKeyword}
                onChange={(event) => onFieldChange('brandKeyword', event.target.value)}
                placeholder="Heritage"
                className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.03] p-4">
            <input
              type="checkbox"
              checked={syncLogos}
              onChange={(event) => onSyncLogosChange(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[#006446]"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">Use the same logo for navbar, dashboard, and footer</span>
              <span className="mt-1 block text-sm text-slate-500">Turn this off if the footer needs a separate logo file or color treatment.</span>
            </span>
          </label>

          <div className="space-y-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Navbar and dashboard logo URL</span>
              <input
                value={form.navbarLogoUrl}
                onChange={(event) => onFieldChange('navbarLogoUrl', event.target.value)}
                placeholder="/urbo.svg or https://..."
                className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>
            {uploadButton('navbar', syncLogos ? 'Upload shared logo' : 'Upload navbar logo')}
          </div>

          {!syncLogos && (
            <div className="space-y-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Footer logo URL</span>
                <input
                  value={form.footerLogoUrl}
                  onChange={(event) => onFieldChange('footerLogoUrl', event.target.value)}
                  placeholder="/urbo.svg or https://..."
                  className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>
              {uploadButton('footer', 'Upload footer logo')}
            </div>
          )}

          <div className="border-t border-[#006446]/10 pt-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Browser favicon and app icon</p>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
                  Upload one square source image. The generator creates ICO plus 16, 32, 180, 192, and 512 pixel assets for browsers, Apple devices, and the web app manifest.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#006446]/12 bg-[linear-gradient(135deg,#f8fafc,#eef7f3)] p-2 shadow-sm">
                  <img
                    src={previewBranding.favicon512Url}
                    alt="Favicon preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={Boolean(uploadingLogo)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 bg-white px-4 py-2 text-sm font-semibold text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploadingLogo === 'favicon' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingLogo === 'favicon' ? 'Generating…' : 'Upload favicon source'}
                </button>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  tabIndex={-1}
                  disabled={Boolean(uploadingLogo)}
                  onChange={handleFaviconFileChange}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['favicon.ico (16/32/48)', '16×16 PNG', '32×32 PNG', '180×180 Apple', '192×192 PWA', '512×512 PWA'].map((size) => (
                <span key={size} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                  {size}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">For the sharpest result, use a transparent square PNG or SVG at least 512×512. Maximum source size: 10 MB.</p>
          </div>

          <div className="border-t border-[#006446]/10 pt-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Institutional identification</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                These values appear in the public footer. They are stored with the branding settings in Supabase.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">MFI ID</span>
                <input
                  value={form.mfiId}
                  onChange={(event) => onFieldChange('mfiId', event.target.value)}
                  placeholder="PL10026"
                  className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Country code</span>
                <input
                  value={form.countryCode}
                  onChange={(event) => onFieldChange('countryCode', event.target.value.toUpperCase())}
                  placeholder="PL"
                  maxLength={8}
                  className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm uppercase text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">MFI code</span>
                <input
                  value={form.mfiCode}
                  onChange={(event) => onFieldChange('mfiCode', event.target.value)}
                  placeholder="10026"
                  className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Section heading</span>
                <input
                  value={form.institutionalTitle}
                  onChange={(event) => onFieldChange('institutionalTitle', event.target.value)}
                  placeholder="Use the translated default"
                  className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Depositor-protection heading</span>
                <input
                  value={form.depositorProtectionTitle}
                  onChange={(event) => onFieldChange('depositorProtectionTitle', event.target.value)}
                  placeholder="Use the translated default"
                  className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-slate-700">Institution description</span>
              <textarea
                value={form.institutionalDescription}
                onChange={(event) => onFieldChange('institutionalDescription', event.target.value)}
                placeholder="Use the translated default"
                rows={3}
                className="w-full resize-y rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-slate-700">MFI note</span>
              <textarea
                value={form.mfiIdNote}
                onChange={(event) => onFieldChange('mfiIdNote', event.target.value)}
                placeholder="Leave blank to generate a translated note from the identifiers"
                rows={2}
                className="w-full resize-y rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-slate-700">Depositor-protection description</span>
              <textarea
                value={form.depositorProtectionDescription}
                onChange={(event) => onFieldChange('depositorProtectionDescription', event.target.value)}
                placeholder="Use the translated default"
                rows={2}
                className="w-full resize-y rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-slate-700">Depositor-protection URL</span>
              <input
                type="url"
                value={form.depositorProtectionUrl}
                onChange={(event) => onFieldChange('depositorProtectionUrl', event.target.value)}
                placeholder="https://www.gov.pl/web/finance/protection-of-depositors"
                className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>

            <div className="mt-5 border-t border-[#006446]/10 pt-5">
              <p className="text-sm font-semibold text-slate-900">Legal contact</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                This single email address appears in Contact Us on the Privacy Policy, Terms of Service, and Disclosures pages.
              </p>
              <label className="mt-4 block space-y-2">
                <span className="text-sm font-medium text-slate-700">Legal contact email</span>
                <input
                  type="email"
                  value={form.legalContactEmail}
                  onChange={(event) => onFieldChange('legalContactEmail', event.target.value)}
                  placeholder="legal@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[#006446]/12 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#006446]" />
              <p className="text-sm font-semibold text-slate-900">Live preview</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#006446]/10 bg-white p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Navbar</p>
                <BrandLogo src={previewBranding.navbarLogoUrl} alt={previewBranding.brandName} className="h-12 max-w-full object-contain" />
              </div>

              <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Footer</p>
                <BrandLogo src={previewBranding.footerLogoUrl} alt={previewBranding.brandName} className="h-12 max-w-full object-contain" />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#006446]/12 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Text replacement preview</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Website label</p>
                <p className="mt-1 font-semibold text-slate-900">Why {previewBranding.brandKeyword}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Legal text</p>
                <p className="mt-1 font-semibold text-slate-900">{previewBranding.brandName} Wealth Management</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Invoice prefix</p>
                <p className="mt-1 font-mono font-semibold text-slate-900">{referencePreview}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Institution identifiers</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {previewBranding.mfiId} · {previewBranding.countryCode} · {previewBranding.mfiCode}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">Last saved: {updatedLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function getRowSourceLabel(row: AdminRow) {
  return typeof row.__source_label === 'string' ? row.__source_label : null;
}

function getRowSourceKind(row: AdminRow) {
  return row.__transaction_kind === 'crypto' ? 'crypto' : row.__transaction_kind === 'banking' ? 'banking' : null;
}

function getDisplayRowId(row: AdminRow) {
  return typeof row.__source_id === 'string' ? row.__source_id : row.id;
}

function isTransactionStatusField(row: AdminRow, key: string) {
  return key === 'status' && ['transactions', 'crypto_transactions'].includes(String(row.__source_table || ''));
}

function isTransferStatusField(row: AdminRow, key: string) {
  return key === 'status' && ['bank_transfers', 'crypto_transfers'].includes(String(row.__source_table || ''));
}

function isBalanceStatusField(row: AdminRow, key: string) {
  return key === 'status' && ['fiat_balances', 'crypto_balances'].includes(String((row as BalanceRow).source_table || ''));
}

function isTaxStatusField(row: AdminRow, tableConfig: TableConfig | undefined, key: string) {
  return key === 'status' && (tableConfig?.name === 'taxes' || ('tax_type' in row && 'amount_owed' in row));
}

function getTransactionStatusOptions(currentValue: unknown) {
  const options = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Successful' },
    { value: 'failed', label: 'Failed' },
  ];

  if (typeof currentValue === 'string' && currentValue && !options.some((option) => option.value === currentValue)) {
    return [{ value: currentValue, label: toSentenceCase(currentValue) }, ...options];
  }

  return options;
}

function getTaxStatusOptions(currentValue: unknown) {
  const options = TAX_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }));
  const normalizedValue = normalizeTaxStatus(currentValue);

  if (
    typeof currentValue === 'string' &&
    currentValue &&
    currentValue !== normalizedValue &&
    !options.some((option) => option.value === currentValue)
  ) {
    return [{ value: currentValue, label: toSentenceCase(currentValue) }, ...options];
  }

  return options;
}

function getBankingTransactionCreateStatusOptions(currentValue: unknown) {
  const options = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Approved' },
    { value: 'failed', label: 'Failed' },
  ];

  if (typeof currentValue === 'string' && currentValue && !options.some((option) => option.value === currentValue)) {
    return [{ value: currentValue, label: toSentenceCase(currentValue) }, ...options];
  }

  return options;
}

function getTransferStatusOptions(row: AdminRow, currentValue: unknown) {
  const sourceTable = String(row.__source_table || '');
  const currentStatus = typeof currentValue === 'string' ? currentValue : '';
  const options = sourceTable === 'bank_transfers'
    ? [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'completed', label: 'Approved' },
        { value: 'failed', label: 'Failed' },
      ]
    : [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'approved', label: 'Approved' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
      ];

  if (currentStatus && !options.some((option) => option.value === currentStatus)) {
    return [{ value: currentStatus, label: toSentenceCase(currentStatus) }, ...options];
  }

  return options;
}

function getBalanceStatusOptions(currentValue: unknown) {
  const options = [
    { value: 'available', label: 'Available' },
    { value: 'pending', label: 'Pending' },
    { value: 'frozen', label: 'Frozen' },
  ];

  if (typeof currentValue === 'string' && currentValue && !options.some((option) => option.value === currentValue)) {
    return [{ value: currentValue, label: toSentenceCase(currentValue) }, ...options];
  }

  return options;
}

function getSharedBalanceStatusOptions(currentValue: BalanceStatusControlValue) {
  if (currentValue === 'mixed') {
    return [
      { value: 'mixed', label: 'Mixed statuses' },
      ...getBalanceStatusOptions('available'),
    ];
  }

  return getBalanceStatusOptions(currentValue);
}

function shouldShowEditableRowField(row: AdminRow, key: string) {
  if (isActivityDateField(row, key)) return true;
  if (isReadOnlyRowField(key)) return false;

  const sourceTable = String(row.__source_table || '');
  const transferType = String(row.transfer_type || '');

  if (sourceTable === 'crypto_wallets' || sourceTable === 'tax_wallet_addresses') {
    return key === 'wallet_address';
  }

  if (sourceTable === 'bank_transfers') {
    const externalFields = ['recipient_name', 'bank_name', 'iban', 'account_number', 'swift_code'];

    if (transferType === 'internal' && externalFields.includes(key)) return false;
    if (transferType === 'external' && key === 'target_currency') return false;
  }

  if (sourceTable === 'crypto_transfers') {
    if (transferType === 'internal' && ['recipient_address', 'sender_address', 'tx_hash', 'fee'].includes(key)) return false;
    if (transferType === 'external' && key === 'target_symbol') return false;
  }

  return true;
}

type RecordTone = 'default' | 'transactions' | 'transfers' | 'crypto';

function getRecordToneClasses(tone: RecordTone) {
  if (tone === 'crypto') {
    return {
      container: 'border-slate-200/90 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]',
      divider: 'border-slate-200/90',
      label: 'text-slate-700',
      panel: 'border-slate-200 bg-slate-50/80',
      panelLabel: 'text-slate-700',
      footer: 'bg-slate-50/80',
      editButton: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      saveButton: 'bg-slate-900 hover:bg-slate-800',
    };
  }

  if (tone === 'transfers') {
    return {
      container: 'border-amber-200/80 shadow-[0_18px_45px_-40px_rgba(180,83,9,0.4)]',
      divider: 'border-amber-200/80',
      label: 'text-amber-700',
      panel: 'border-amber-200/70 bg-amber-50/80',
      panelLabel: 'text-amber-700',
      footer: 'bg-amber-50/70',
      editButton: 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50',
      saveButton: 'bg-amber-600 hover:bg-amber-700',
    };
  }

  return {
    container: 'border-[#006446]/14 shadow-[0_18px_45px_-40px_rgba(0,100,70,0.45)]',
    divider: 'border-[#006446]/10',
    label: 'text-[#006446]',
    panel: 'border-[#006446]/10 bg-[#006446]/[0.03]',
    panelLabel: 'text-[#006446]',
    footer: 'bg-[#006446]/[0.03]',
    editButton: 'border-[#006446]/12 bg-white text-[#006446] hover:bg-[#006446]/[0.05]',
    saveButton: 'bg-[#006446] hover:bg-[#004d36]',
  };
}

function getRecordTableLabelClasses(tone: RecordTone) {
  if (tone === 'transfers') {
    return 'inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700';
  }

  if (tone === 'transactions') {
    return 'inline-flex items-center rounded-full bg-[#006446]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#006446]';
  }

  return 'text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]';
}

function RecordFormCard({
  row,
  tableLabel,
  tableConfig,
  saving,
  deleting,
  onSave,
  onDelete,
  onCancel,
  tone = 'default',
}: {
  row: AdminRow;
  tableLabel: string;
  tableConfig?: TableConfig;
  saving: boolean;
  deleting: boolean;
  onSave: (record: AdminRow) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel?: () => void;
  tone?: RecordTone;
}) {
  const [form, setForm] = useState<AdminRow>(row);

  useEffect(() => {
    setForm(row);
  }, [row]);

  const isWalletRecord = row.__source_table === 'crypto_wallets' || row.__source_table === 'tax_wallet_addresses';
  const previewEntries = isWalletRecord ? [] : summariseEntries(form);
  const sourceLabel = getRowSourceLabel(row);
  const sourceKind = getRowSourceKind(row);
  const toneClasses = getRecordToneClasses(tone);
  const tableLabelClasses = getRecordTableLabelClasses(tone);
  const editableEntries = Object.entries(form).filter(([key]) => shouldShowEditableRowField(form, key));
  const walletPreview = isWalletRecord
    ? {
        wallet_address: String(form.wallet_address || '').trim(),
        symbol: row.__source_table === 'tax_wallet_addresses' ? '' : String(form.symbol || ''),
        network: row.__source_table === 'tax_wallet_addresses' ? '' : String(form.network || ''),
        payment_uri: '',
      }
    : null;
  const walletPaymentRequest = walletPreview ? getCryptoPaymentRequest(walletPreview) : null;

  return (
    <div className={`border bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] ${toneClasses.container}`}>
      <div className={`flex flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:items-center lg:justify-between ${toneClasses.divider}`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className={tableLabelClasses}>{tableLabel}</p>
            {sourceLabel && (
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${sourceKind === 'crypto' ? 'bg-slate-900 text-white' : 'bg-[#006446]/10 text-[#006446]'}`}>
                {sourceLabel}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-500">{getRowTimestampLabel(row, tableConfig)}</div>
      </div>

      {previewEntries.length > 0 && (
        <div className={`grid gap-3 border-b px-5 py-4 md:grid-cols-2 xl:grid-cols-4 ${toneClasses.divider}`}>
          {previewEntries.map(([key, value]) => (
            <div key={key} className={`rounded-2xl border p-3 ${toneClasses.panel}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClasses.panelLabel}`}>{toSentenceCase(key)}</p>
              <p className="mt-2 break-words text-sm text-slate-800">{formatValue(value)}</p>
            </div>
          ))}
        </div>
      )}

      {walletPaymentRequest && walletPreview ? (
        <div className={`mx-5 mt-4 grid gap-4 rounded-2xl border px-4 py-4 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${walletPaymentRequest.valid ? 'border-[#006446]/14 bg-[#006446]/[0.04] text-[#006446]' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          <div className="flex items-start gap-3">
            {walletPaymentRequest.valid ? <Check className="mt-0.5 h-4 w-4 flex-shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
            <div>
              <p className="font-semibold">{walletPaymentRequest.valid ? `QR ready: ${walletPaymentRequest.format}` : 'Wallet is not ready'}</p>
              <p className="mt-1 text-xs opacity-80">
                {walletPaymentRequest.valid
                  ? row.__source_table === 'tax_wallet_addresses'
                    ? 'The tax QR contains the exact wallet address entered below.'
                    : 'The QR uses this wallet record’s stored asset and network automatically.'
                  : walletPaymentRequest.error}
              </p>
            </div>
          </div>
          {walletPaymentRequest.valid ? (
            <div className="w-fit rounded-xl border border-[#006446]/14 bg-white p-2 shadow-sm">
              <QRCode data={walletPaymentRequest.payload} size={112} />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
        {editableEntries.map(([key, value]) => {
          const inputId = `${row.id}-${key}`;

          if (typeof value === 'boolean') {
            return (
              <label key={key} htmlFor={inputId} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${toneClasses.panel}`}>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{toSentenceCase(key)}</p>
                  <p className="mt-1 text-xs text-slate-500">Toggle this field on or off.</p>
                </div>
                <input
                  id={inputId}
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.checked }))}
                  className="h-5 w-5 accent-[#006446]"
                />
              </label>
            );
          }

          if (isActivityDateField(row, key)) {
            const activityLabel = row.__record_type === 'transfer' ? 'Transfer date and time' : 'Transaction date and time';

            return (
              <label key={key} htmlFor={inputId} className="space-y-2">
                <span className="text-sm font-medium text-slate-700">{activityLabel}</span>
                <input
                  id={inputId}
                  type="datetime-local"
                  step="60"
                  value={formatDateTimeInputValue(form[key])}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
                <span className="block text-xs text-slate-500">Saved using your local date and time.</span>
              </label>
            );
          }

          if (isWalletRecord && key === 'wallet_address') {
            return (
              <label key={key} htmlFor={inputId} className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  {row.__source_table === 'tax_wallet_addresses' ? 'Tax wallet address' : 'Receiving wallet address'}
                </span>
                <input
                  id={inputId}
                  value={String(form[key] ?? '')}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  placeholder="Paste the real receiving wallet address"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
                <span className="block text-xs text-slate-500">
                  {row.__source_table === 'tax_wallet_addresses'
                    ? 'The tax QR will contain this exact address.'
                    : 'Asset, network, and QR format are taken automatically from this wallet record.'}
                </span>
              </label>
            );
          }

          if (isLongField(key, value)) {
            return (
              <label key={key} htmlFor={inputId} className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">{toSentenceCase(key)}</span>
                <textarea
                  id={inputId}
                  value={String(form[key] ?? '')}
                  rows={4}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              </label>
            );
          }

          if (isTransactionStatusField(row, key)) {
            return (
              <label key={key} htmlFor={inputId} className="space-y-2">
                <span className="text-sm font-medium text-slate-700">{toSentenceCase(key)}</span>
                <Dropdown
                  value={String(form[key] ?? '')}
                  options={getTransactionStatusOptions(form[key])}
                  onChange={(nextValue) => setForm((prev) => ({ ...prev, [key]: nextValue }))}
                  className="w-full"
                />
              </label>
            );
          }

          if (isTransferStatusField(row, key)) {
            return (
              <label key={key} htmlFor={inputId} className="space-y-2">
                <span className="text-sm font-medium text-slate-700">{toSentenceCase(key)}</span>
                <Dropdown
                  value={String(form[key] ?? '')}
                  options={getTransferStatusOptions(row, form[key])}
                  onChange={(nextValue) => setForm((prev) => ({ ...prev, [key]: nextValue }))}
                  className="w-full"
                />
              </label>
            );
          }

          if (isBalanceStatusField(row, key)) {
            return (
              <label key={key} htmlFor={inputId} className="space-y-2">
                <span className="text-sm font-medium text-slate-700">{toSentenceCase(key)}</span>
                <Dropdown
                  value={String(form[key] ?? '')}
                  options={getBalanceStatusOptions(form[key])}
                  onChange={(nextValue) => setForm((prev) => ({ ...prev, [key]: nextValue }))}
                  className="w-full"
                />
              </label>
            );
          }

          if (isTaxStatusField(row, tableConfig, key)) {
            return (
              <label key={key} htmlFor={inputId} className="space-y-2">
                <span className="text-sm font-medium text-slate-700">{toSentenceCase(key)}</span>
                <Dropdown
                  value={String(form[key] ?? '')}
                  options={getTaxStatusOptions(form[key])}
                  onChange={(nextValue) => setForm((prev) => ({ ...prev, [key]: nextValue }))}
                  className="w-full"
                />
              </label>
            );
          }

          return (
            <label key={key} htmlFor={inputId} className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{toSentenceCase(key)}</span>
              <input
                id={inputId}
                type={typeof value === 'number' ? 'number' : 'text'}
                value={String(form[key] ?? '')}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>
          );
        })}
      </div>

      <div className={`border-t px-5 py-4 ${toneClasses.divider} ${toneClasses.footer}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={saving || deleting}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={deleting || saving}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete record
            </button>
          </div>

          <button
            type="button"
            onClick={() => void onSave(form)}
            disabled={saving || deleting}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${toneClasses.saveButton}`}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save record
          </button>
        </div>
      </div>
    </div>
  );
}

function RecordHistoryBar({
  row,
  tableLabel,
  tableConfig,
  saving = false,
  deleting,
  hidePrimaryId = true,
  onApprove,
  approveLabel = 'Approve',
  onEdit,
  onDelete,
  tone = 'default',
}: {
  row: AdminRow;
  tableLabel: string;
  tableConfig?: TableConfig;
  saving?: boolean;
  deleting: boolean;
  hidePrimaryId?: boolean;
  onApprove?: () => Promise<void>;
  approveLabel?: string;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  tone?: RecordTone;
}) {
  const previewEntries = summariseEntries(row);
  const sourceLabel = getRowSourceLabel(row);
  const sourceKind = getRowSourceKind(row);
  const toneClasses = getRecordToneClasses(tone);
  const tableLabelClasses = getRecordTableLabelClasses(tone);
  const useStackedActions = tone !== 'default';
  const isBusy = saving || deleting;

  return (
    <div className={`border bg-white px-4 py-4 sm:px-5 ${toneClasses.container}`}>
      <div className={useStackedActions ? 'grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start' : 'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={tableLabelClasses}>{tableLabel}</p>
            {sourceLabel && (
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${sourceKind === 'crypto' ? 'bg-slate-900 text-white' : 'bg-[#006446]/10 text-[#006446]'}`}>
                {sourceLabel}
              </span>
            )}
          </div>
          {!hidePrimaryId && (
            <p className="mt-1 break-all text-sm font-semibold text-slate-900 sm:text-base">{getDisplayRowId(row)}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {previewEntries.length > 0 ? (
              previewEntries.map(([key, value]) => (
                <span
                  key={key}
                  className={`max-w-full whitespace-normal break-all rounded-full border px-3 py-1 text-xs text-slate-600 ${toneClasses.panel}`}
                >
                  <span className={`font-semibold ${toneClasses.panelLabel}`}>{toSentenceCase(key)}:</span> {formatValue(value)}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                No preview fields yet
              </span>
            )}
          </div>
        </div>

        <div className={`flex w-full flex-col gap-3 ${useStackedActions ? 'xl:max-w-[220px] xl:justify-self-end' : 'lg:items-end'}`}>
          <span className={`break-words text-xs text-slate-500 ${useStackedActions ? 'text-left xl:text-right' : ''}`}>{getRowTimestampLabel(row, tableConfig)}</span>

          <div className={useStackedActions ? 'flex flex-col gap-2' : 'flex flex-col gap-2 sm:flex-row'}>
            {onApprove && (
              <button
                type="button"
                onClick={() => void onApprove()}
                disabled={isBusy}
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#006446]/14 bg-[#006446] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70 ${useStackedActions ? 'w-full' : ''}`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {approveLabel}
              </button>
            )}

            <button
              type="button"
              onClick={onEdit}
              disabled={isBusy}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${useStackedActions ? 'w-full' : ''} ${toneClasses.editButton}`}
            >
              Edit full record
            </button>

            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={isBusy}
              className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 ${useStackedActions ? 'w-full' : ''}`}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceGroupedRow({
  row,
  editing,
  saving,
  deleting,
  reordering,
  orderControlsDisabled,
  canMoveUp,
  canMoveDown,
  onEdit,
  onMoveUp,
  onMoveDown,
  onSave,
  onDelete,
  onCancel,
}: {
  row: BalanceRow;
  editing: boolean;
  saving: boolean;
  deleting: boolean;
  reordering: boolean;
  orderControlsDisabled: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onMoveUp: () => Promise<void>;
  onMoveDown: () => Promise<void>;
  onSave: (nextBalance: string, nextStatus: BalanceAvailabilityStatus) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}) {
  const [balance, setBalance] = useState(String(row.balance));
  const [status, setStatus] = useState<BalanceAvailabilityStatus>(row.status);
  const isFiat = row.balance_kind === 'fiat';
  const supportsFormattedFiatInput = shouldNormalizeFiatBalanceInput(row);
  const isBusy = saving || deleting || orderControlsDisabled;

  useEffect(() => {
    if (editing) {
      setBalance(String(row.balance));
      setStatus(row.status);
    }
  }, [editing, row.balance, row.id, row.status]);

  return (
    <article className="bg-white px-5 py-5 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(170px,220px)_minmax(340px,auto)] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isFiat ? 'bg-[#006446]/10 text-[#006446]' : 'bg-slate-900 text-white'}`}>
              {row.balance_kind}
            </span>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isFiat ? 'border-[#006446]/12 bg-[#006446]/[0.03] text-[#006446]' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              {row.asset_code}
            </span>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${getBalanceStatusClasses(row.status)}`}>
              {getBalanceStatusLabel(row.status)}
            </span>
          </div>
          <h3 className="mt-3 text-2xl font-serif font-bold text-slate-950">{row.asset_code}</h3>
          <p className="mt-1 text-sm text-slate-500">{row.asset_name}</p>
          <p className="mt-3 text-xs text-slate-500">{getRowTimestampLabel(row)}</p>
        </div>

        <div className={`rounded-[18px] border px-5 py-4 ${isFiat ? 'border-[#006446]/12 bg-[#006446]/[0.03]' : 'border-slate-200 bg-slate-50/80'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isFiat ? 'text-[#006446]' : 'text-slate-700'}`}>Current balance</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{formatBalanceAmount(row.balance)}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          {editing ? (
            <span className={`inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold ${isFiat ? 'border-[#006446]/12 bg-[#006446]/[0.05] text-[#006446]' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              Editing {row.asset_code}
            </span>
          ) : (
            <>
              {reordering ? (
                <span className="inline-flex h-11 w-[92px] items-center justify-center rounded-full border border-[#006446]/12 bg-[#006446]/[0.04] text-[#006446]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                <div className="inline-flex overflow-hidden rounded-full border border-[#006446]/12 bg-white">
                  <button
                    type="button"
                    onClick={() => void onMoveUp()}
                    disabled={orderControlsDisabled || !canMoveUp}
                    title={`Move ${row.asset_code} up`}
                    aria-label={`Move ${row.asset_code} up`}
                    className="inline-flex h-11 w-11 items-center justify-center text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onMoveDown()}
                    disabled={orderControlsDisabled || !canMoveDown}
                    title={`Move ${row.asset_code} down`}
                    aria-label={`Move ${row.asset_code} down`}
                    className="inline-flex h-11 w-11 items-center justify-center border-l border-[#006446]/10 text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onEdit}
                disabled={isBusy}
                className={`inline-flex min-h-[44px] items-center justify-center rounded-full border bg-white px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isFiat ? 'border-[#006446]/12 text-[#006446] hover:bg-[#006446]/[0.05]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                Edit balance
              </button>

              <button
                type="button"
                onClick={() => void onDelete()}
                disabled={isBusy}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className={`mt-4 rounded-[18px] border p-4 ${isFiat ? 'border-[#006446]/12 bg-[#006446]/[0.03]' : 'border-slate-200 bg-slate-50/80'}`}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)_minmax(320px,auto)] lg:items-end">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">New balance</span>
              <input
                type={supportsFormattedFiatInput ? 'text' : 'number'}
                inputMode="decimal"
                step={supportsFormattedFiatInput ? undefined : 'any'}
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
              {supportsFormattedFiatInput ? (
                <p className="text-xs text-slate-500">Accepts inputs like `52,453.36` or `52.453.36` and saves them as `52453.36`.</p>
              ) : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Balance status</span>
              <Dropdown
                value={status}
                options={getBalanceStatusOptions(status)}
                onChange={(nextStatus) => setStatus(normalizeBalanceStatus(nextStatus))}
                className="w-full"
              />
              <span className="block text-xs text-slate-500">Saved only for {row.asset_code}.</span>
            </label>

            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isBusy}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void onDelete()}
                disabled={isBusy}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>

              <button
                type="button"
                onClick={() => void onSave(balance, status)}
                disabled={isBusy}
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isFiat ? 'bg-[#006446] hover:bg-[#004d36]' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save balance
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function BalanceStatusControlCard({
  value,
  currentStatus,
  rowCount,
  saving,
  onChange,
  onApply,
}: {
  value: BalanceStatusControlValue;
  currentStatus: BalanceStatusControlValue;
  rowCount: number;
  saving: boolean;
  onChange: (value: BalanceStatusControlValue) => void;
  onApply: () => Promise<void>;
}) {
  const hasBalances = rowCount > 0;
  const hasConcreteSelection = value !== 'mixed';
  const hasPendingChange = hasBalances && hasConcreteSelection && value !== currentStatus;
  const currentStatusClasses =
    currentStatus === 'mixed'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : getBalanceStatusClasses(currentStatus);
  const currentStatusLabel = currentStatus === 'mixed' ? 'Mixed' : getBalanceStatusLabel(currentStatus);
  const helperText = !hasBalances
    ? 'Choose the status for the next balance you add. Once balances exist, this control can update all of them together.'
    : currentStatus === 'mixed'
    ? 'This customer currently has mixed balance statuses. Pick one status below and apply it to standardize every balance row.'
    : hasPendingChange
    ? `Ready to apply ${getBalanceStatusLabel(value).toLowerCase()} across all fiat and crypto balances for this customer.`
    : `All balances are currently ${getBalanceStatusLabel(currentStatus).toLowerCase()}.`;

  return (
    <section className="relative overflow-visible rounded-[28px] border border-[#006446]/12 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.12] via-[#006446]/[0.04] to-white px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006446]/12 text-[#006446] shadow-inner shadow-[#006446]/10">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Customer Balance Status</p>
              <h3 className="mt-2 text-2xl font-serif font-bold text-slate-950">One control for all balances</h3>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">{helperText}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[#006446]/12 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">
              {rowCount} rows
            </span>
            {hasBalances ? (
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${currentStatusClasses}`}>
                {currentStatusLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="relative z-[60] space-y-2">
          <span className="text-sm font-medium text-slate-700">Set customer balance status</span>
          <Dropdown
            value={value}
            options={getSharedBalanceStatusOptions(value)}
            onChange={(nextValue) => onChange(nextValue as BalanceStatusControlValue)}
            className="w-full"
          />
        </label>

        <button
          type="button"
          onClick={() => void onApply()}
          disabled={saving || !hasPendingChange}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Apply to all balances
        </button>
      </div>
    </section>
  );
}

function TaxAdminAmountCard({
  status,
  title,
  description,
  amount,
  currency,
  icon: Icon,
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
}: {
  status: TaxStatus;
  title: string;
  description: string;
  amount: number;
  currency: string;
  icon: LucideIcon;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: (amount: number, currency: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [amountInput, setAmountInput] = useState(String(amount));
  const [currencyInput, setCurrencyInput] = useState(currency);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    setAmountInput(String(amount));
    setCurrencyInput(currency);
    setInputError(null);
  }, [amount, currency, editing]);

  const handleSave = () => {
    const parsedAmount = parseTaxAmountInput(amountInput);

    if (parsedAmount === null) {
      setInputError('Enter a valid amount.');
      return;
    }

    const normalizedCurrency = currencyInput.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      setInputError('Enter a valid three-letter currency code, such as USD, EUR, or GBP.');
      return;
    }

    setInputError(null);
    void onSave(parsedAmount, normalizedCurrency);
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#006446]/12 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.12] via-[#006446]/[0.04] to-white px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#006446]/12 text-[#006446]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">{title}</p>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
        </div>

        <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
          {formatTaxCurrency(amount, currency)}
        </p>
      </div>

      <div className="bg-[#f7fbf8] p-4">
        {editing ? (
          <div className="rounded-[22px] border border-[#006446]/12 bg-white p-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{getTaxStatusLabel(status)} amount</span>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
            </label>
            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-slate-700">Currency</span>
              <input
                type="text"
                value={currencyInput}
                maxLength={3}
                placeholder="USD"
                onChange={(event) => setCurrencyInput(event.target.value.toUpperCase())}
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm uppercase text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
              <span className="block text-xs text-slate-500">Use an ISO code such as USD, EUR, GBP, CHF, or JPY. This applies to all three tax cards.</span>
            </label>
            {inputError ? <p className="mt-2 text-xs font-medium text-red-600">{inputError}</p> : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#006446] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save amount & currency
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            disabled={saving}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#006446]/12 bg-white px-4 py-2 text-sm font-semibold text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Edit amount & currency
          </button>
        )}
      </div>
    </section>
  );
}

function BalanceCreateCard({
  draft,
  statusNote,
  saving,
  onChange,
  onCreate,
  onCancel,
}: {
  draft: BalanceDraft;
  statusNote: string;
  saving: boolean;
  onChange: (patch: Partial<BalanceDraft>) => void;
  onCreate: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">New Balance</p>
          <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">Add a balance row</h3>
          <p className="mt-1 text-sm text-slate-500">Choose fiat or crypto, then enter the asset and balance. {statusNote}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void onCreate()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create balance
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Balance Type</span>
          <Dropdown
            value={draft.kind}
            options={[
              { value: 'fiat', label: 'Fiat' },
              { value: 'crypto', label: 'Crypto' },
            ]}
            onChange={(value) => {
              const kind = value as BalanceDraft['kind'];
              onChange({ kind, code: kind === 'fiat' ? 'USD' : 'BTC', name: '' });
            }}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Asset Code</span>
          <input
            value={draft.code}
            onChange={(event) => onChange({ code: event.target.value.toUpperCase() })}
            placeholder={draft.kind === 'fiat' ? 'USD' : 'BTC'}
            className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
          />
          <span className="block text-xs leading-5 text-slate-500">
            {draft.kind === 'fiat'
              ? 'Use a live-rate supported 3-letter ISO code, for example GBP or PLN.'
              : 'Use the CoinGecko ticker symbol, for example XRP or ADA.'}
          </span>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Asset Name</span>
          <input
            value={draft.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder={draft.kind === 'fiat' ? 'US Dollar' : 'Bitcoin'}
            className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Starting Balance</span>
          <input
            type="number"
            step="any"
            value={draft.balance}
            onChange={(event) => onChange({ balance: event.target.value })}
            className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Initial Status</span>
          <Dropdown
            value={draft.status}
            options={getBalanceStatusOptions(draft.status)}
            onChange={(status) => onChange({ status: normalizeBalanceStatus(status) })}
          />
          <span className="block text-xs leading-5 text-slate-500">Stored on this balance row in the database.</span>
        </label>
      </div>
    </div>
  );
}

function TransactionCreateCard({
  source,
  fields,
  saving,
  onSourceChange,
  onFieldChange,
  onAddField,
  onRemoveField,
  onReset,
  onCreate,
  onCancel,
}: {
  source: TransactionSourceTable;
  fields: DraftField[];
  saving: boolean;
  onSourceChange: (source: TransactionSourceTable) => void;
  onFieldChange: (fieldId: string, patch: Partial<DraftField>) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  onReset: () => void;
  onCreate: () => Promise<void>;
  onCancel: () => void;
}) {
  const isCryptoSource = source === 'crypto_transactions';
  const visibleFields = fields.filter((field) => field.key !== 'user_id');

  return (
    <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">New Transaction</p>
          <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">Add {isCryptoSource ? 'a crypto' : 'a banking'} transaction</h3>
          <p className="mt-1 text-sm text-slate-500">Choose which transaction table to write to, then fill the fields below.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAddField}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <Plus className="h-4 w-4" />
            Add field
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset template
          </button>

          <button
            type="button"
            onClick={() => void onCreate()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create transaction
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Transaction Source</p>
          <div className="mt-3 inline-flex overflow-hidden rounded-full border border-[#006446]/12 bg-white">
            <button
              type="button"
              onClick={() => onSourceChange('transactions')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${!isCryptoSource ? 'bg-[#006446] text-white' : 'text-slate-600 hover:bg-[#006446]/[0.05]'}`}
            >
              Banking
            </button>
            <button
              type="button"
              onClick={() => onSourceChange('crypto_transactions')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${isCryptoSource ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Crypto
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {isCryptoSource
              ? 'Creates a row in `crypto_transactions`.'
              : 'Creates a row in `transactions`.'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            The selected customer is attached automatically, so `user_id` stays hidden here.
          </p>
        </div>

        <div className="space-y-3">
          {visibleFields.map((field) => {
            const isDateField = isActivityDraftDateField(source, field.key);

            return (
            <div key={field.id} className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]">
              {isDateField ? (
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-semibold text-slate-800">Transaction date and time</span>
                  <span className="mt-1 text-xs text-slate-500">Your local time</span>
                </div>
              ) : (
                <input
                  value={field.key}
                  onChange={(event) => onFieldChange(field.id, { key: event.target.value })}
                  placeholder="Field name"
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              )}
              {isDateField ? (
                <input
                  type="datetime-local"
                  step="60"
                  value={formatDateTimeInputValue(field.value)}
                  onChange={(event) => onFieldChange(field.id, { value: event.target.value })}
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              ) : field.key.trim().toLowerCase() === 'status' && !isCryptoSource ? (
                <Dropdown
                  value={field.value}
                  options={getBankingTransactionCreateStatusOptions(field.value)}
                  onChange={(value) => onFieldChange(field.id, { value })}
                  className="w-full"
                />
              ) : isLongField(field.key.trim().toLowerCase(), field.value) ? (
                <textarea
                  value={field.value}
                  rows={3}
                  onChange={(event) => onFieldChange(field.id, { value: event.target.value })}
                  placeholder="Value"
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              ) : (
                <input
                  value={field.value}
                  onChange={(event) => onFieldChange(field.id, { value: event.target.value })}
                  placeholder="Value"
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              )}
              <button
                type="button"
                onClick={() => onRemoveField(field.id)}
                disabled={visibleFields.length === 1 || isDateField}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                title={isDateField ? 'The transaction date is required' : 'Remove field'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            );
          })}
          <p className="text-xs text-slate-500">The selected transaction date is stored exactly; numbers, `true`, `false`, and `null` are converted automatically.</p>
        </div>
      </div>
    </div>
  );
}

function ActivityCreateCard({
  source,
  fields,
  saving,
  onSourceChange,
  onFieldChange,
  onAddField,
  onRemoveField,
  onReset,
  onCreate,
  onCancel,
}: {
  source: ActivitySourceTable;
  fields: DraftField[];
  saving: boolean;
  onSourceChange: (source: ActivitySourceTable) => void;
  onFieldChange: (fieldId: string, patch: Partial<DraftField>) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  onReset: () => void;
  onCreate: () => Promise<void>;
  onCancel: () => void;
}) {
  const visibleFields = isTransferSourceTable(source)
    ? fields.filter((field) => shouldShowTransferCreateField(source, field.key))
    : fields;

  return (
    <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">New Activity</p>
          <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">Add {getActivityCreateTitle(source)}</h3>
          <p className="mt-1 text-sm text-slate-500">Choose which transaction or transfer table to write to, then fill the fields below.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAddField}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <Plus className="h-4 w-4" />
            Add field
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset template
          </button>

          <button
            type="button"
            onClick={() => void onCreate()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create activity
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Activity Source</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {([
              'transactions',
              'crypto_transactions',
              'bank_transfers',
              'crypto_transfers',
            ] as ActivitySourceTable[]).map((sourceOption) => {
              const active = sourceOption === source;

              return (
                <button
                  key={sourceOption}
                  type="button"
                  onClick={() => onSourceChange(sourceOption)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#006446] text-white'
                      : 'border border-[#006446]/12 bg-white text-slate-600 hover:bg-[#006446]/[0.05] hover:text-[#006446]'
                  }`}
                >
                  {getActivitySourceLabel(sourceOption)}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">{getActivityCreateMessage(source)}</p>
          {isTransferSourceTable(source) && (
            <p className="mt-2 text-xs font-semibold text-amber-700">CRM creation is currently limited to external transfers.</p>
          )}
        </div>

        <div className="space-y-3">
          {visibleFields.map((field) => {
            const isDateField = isActivityDraftDateField(source, field.key);
            const dateLabel = isTransferSourceTable(source) ? 'Transfer date and time' : 'Transaction date and time';

            return (
            <div key={field.id} className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]">
              {isDateField ? (
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-semibold text-slate-800">{dateLabel}</span>
                  <span className="mt-1 text-xs text-slate-500">Your local time</span>
                </div>
              ) : (
                <input
                  value={field.key}
                  onChange={(event) => onFieldChange(field.id, { key: event.target.value })}
                  placeholder="Field name"
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              )}
              <input
                type={isDateField ? 'datetime-local' : 'text'}
                step={isDateField ? '60' : undefined}
                value={isDateField ? formatDateTimeInputValue(field.value) : field.value}
                onChange={(event) => onFieldChange(field.id, { value: event.target.value })}
                placeholder={isDateField ? undefined : 'Value'}
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
              <button
                type="button"
                onClick={() => onRemoveField(field.id)}
                disabled={visibleFields.length === 1 || isDateField}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                title={isDateField ? 'The activity date is required' : 'Remove field'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            );
          })}
          <p className="text-xs text-slate-500">The selected activity date is stored exactly; numbers, `true`, `false`, and `null` are converted automatically.</p>
        </div>
      </div>
    </div>
  );
}

function TransferCreateCard({
  source,
  fields,
  saving,
  onSourceChange,
  onFieldChange,
  onAddField,
  onRemoveField,
  onReset,
  onCreate,
  onCancel,
}: {
  source: TransferSourceTable;
  fields: DraftField[];
  saving: boolean;
  onSourceChange: (source: TransferSourceTable) => void;
  onFieldChange: (fieldId: string, patch: Partial<DraftField>) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  onReset: () => void;
  onCreate: () => Promise<void>;
  onCancel: () => void;
}) {
  const isCryptoSource = source === 'crypto_transfers';
  const visibleFields = fields.filter((field) => shouldShowTransferCreateField(source, field.key));

  return (
    <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">New Transfer</p>
          <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">Add {isCryptoSource ? 'a crypto' : 'a bank'} transfer</h3>
          <p className="mt-1 text-sm text-slate-500">Choose which transfer table to write to, then fill the fields below.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAddField}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <Plus className="h-4 w-4" />
            Add field
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset template
          </button>

          <button
            type="button"
            onClick={() => void onCreate()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create transfer
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Transfer Source</p>
          <div className="mt-3 inline-flex overflow-hidden rounded-full border border-[#006446]/12 bg-white">
            <button
              type="button"
              onClick={() => onSourceChange('bank_transfers')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${!isCryptoSource ? 'bg-[#006446] text-white' : 'text-slate-600 hover:bg-[#006446]/[0.05]'}`}
            >
              Banking
            </button>
            <button
              type="button"
              onClick={() => onSourceChange('crypto_transfers')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${isCryptoSource ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Crypto
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {isCryptoSource
              ? 'Creates a row in `crypto_transfers`.'
              : 'Creates a row in `bank_transfers`.'}
          </p>
          <p className="mt-2 text-xs font-semibold text-amber-700">CRM creation is currently limited to external transfers.</p>
        </div>

        <div className="space-y-3">
          {visibleFields.map((field) => {
            const isDateField = isActivityDraftDateField(source, field.key);

            return (
            <div key={field.id} className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]">
              {isDateField ? (
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-semibold text-slate-800">Transfer date and time</span>
                  <span className="mt-1 text-xs text-slate-500">Your local time</span>
                </div>
              ) : (
                <input
                  value={field.key}
                  onChange={(event) => onFieldChange(field.id, { key: event.target.value })}
                  placeholder="Field name"
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
              )}
              <input
                type={isDateField ? 'datetime-local' : 'text'}
                step={isDateField ? '60' : undefined}
                value={isDateField ? formatDateTimeInputValue(field.value) : field.value}
                onChange={(event) => onFieldChange(field.id, { value: event.target.value })}
                placeholder={isDateField ? undefined : 'Value'}
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
              <button
                type="button"
                onClick={() => onRemoveField(field.id)}
                disabled={visibleFields.length === 1 || isDateField}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                title={isDateField ? 'The transfer date is required' : 'Remove field'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            );
          })}
          <p className="text-xs text-slate-500">The selected transfer date is stored exactly; numbers, `true`, `false`, and `null` are converted automatically.</p>
        </div>
      </div>
    </div>
  );
}

function WalletCreateCard({
  source,
  fields,
  saving,
  onSourceChange,
  onFieldChange,
  onAddField,
  onRemoveField,
  onReset,
  onCreate,
  onCancel,
}: {
  source: WalletSourceTable;
  fields: DraftField[];
  saving: boolean;
  onSourceChange: (source: WalletSourceTable) => void;
  onFieldChange: (fieldId: string, patch: Partial<DraftField>) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  onReset: () => void;
  onCreate: () => Promise<void>;
  onCancel: () => void;
}) {
  const isCryptoSource = source === 'crypto_wallets';
  const visibleFields = isCryptoSource
    ? fields
    : fields.filter((field) => field.key === 'wallet_address');
  const taxWalletAddress = fields.find((field) => field.key === 'wallet_address')?.value.trim() || '';
  const taxPaymentRequest = !isCryptoSource
    ? getCryptoPaymentRequest({ wallet_address: taxWalletAddress })
    : null;

  const getWalletFieldMeta = (key: string) => {
    if (key === 'wallet_address') return { label: isCryptoSource ? 'Receiving wallet address' : 'Tax wallet address', placeholder: 'Paste the real custody wallet address', help: isCryptoSource ? 'The QR uses this crypto record’s stored asset and network.' : 'The QR will contain this exact address. No other tax-wallet fields are needed.', required: true };
    if (key === 'payment_uri') return { label: 'Payment URI', placeholder: 'Optional — leave blank to generate automatically', help: 'Only use a provider-supplied URI for a token/network-specific payment request.', required: false };
    return { label: toSentenceCase(key), placeholder: 'Value', help: '', required: false };
  };

  return (
    <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Wallet setup</p>
          <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">Configure {isCryptoSource ? 'a crypto' : 'the tax payment'} wallet</h3>
          <p className="mt-1 text-sm text-slate-500">The address must be a real receiving address controlled by your custody provider.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>

          {isCryptoSource ? (
            <button
              type="button"
              onClick={onAddField}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
            >
              <Plus className="h-4 w-4" />
              Add field
            </button>
          ) : null}

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset template
          </button>

          <button
            type="button"
            onClick={() => void onCreate()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save wallet
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Wallet Source</p>
          <div className="mt-3 inline-flex overflow-hidden rounded-full border border-[#006446]/12 bg-white">
            <button
              type="button"
              onClick={() => onSourceChange('crypto_wallets')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${isCryptoSource ? 'bg-[#006446] text-white' : 'text-slate-600 hover:bg-[#006446]/[0.05]'}`}
            >
              Crypto
            </button>
            <button
              type="button"
              onClick={() => onSourceChange('tax_wallet_addresses')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${!isCryptoSource ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Tax
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {isCryptoSource
              ? 'Creates a row in `crypto_wallets`.'
              : 'Creates a row in `tax_wallet_addresses`.'}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {isCryptoSource
              ? 'Choose the crypto record details, then enter its real custody address. Existing crypto wallets only require address changes.'
              : 'Paste one real receiving address. The tax page will generate a QR containing exactly that address.'}
          </p>
        </div>

        {taxPaymentRequest?.valid ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#006446]">Tax QR ready</p>
              <p className="mt-1 text-xs text-[#006446]/75">This QR encodes the exact wallet address. It will update while you type.</p>
            </div>
            <div className="w-fit rounded-xl border border-[#006446]/14 bg-white p-2 shadow-sm">
              <QRCode data={taxPaymentRequest.payload} size={112} />
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {visibleFields.map((field) => {
            const meta = getWalletFieldMeta(field.key);
            const lockFieldName = !isCryptoSource && field.key === 'wallet_address';

            return (
              <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-100 p-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] md:items-start">
                <div>
                  {lockFieldName ? (
                    <div className="rounded-xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3 text-sm font-medium text-slate-800">
                      {meta.label}{meta.required ? <span className="ml-1 text-red-500">*</span> : null}
                    </div>
                  ) : (
                    <input
                      value={field.key}
                      onChange={(event) => onFieldChange(field.id, { key: event.target.value })}
                      placeholder="Field name"
                      className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                    />
                  )}
                  {meta.help ? <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-slate-500">{meta.help}</p> : null}
                </div>
                <input
                  value={field.value}
                  aria-required={meta.required}
                  onChange={(event) => onFieldChange(field.id, { value: event.target.value })}
                  placeholder={meta.placeholder}
                  className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all read-only:cursor-not-allowed read-only:bg-slate-50 read-only:text-slate-500 focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
                />
                {isCryptoSource || !lockFieldName ? (
                  <button
                    type="button"
                    onClick={() => onRemoveField(field.id)}
                    disabled={fields.length === 1}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : <span className="hidden w-[50px] md:block" />}
              </div>
            );
          })}
          <p className="text-xs text-slate-500">
            {isCryptoSource
              ? 'The payment URI is optional; the QR generator derives the standard payload from the asset, network, and address.'
              : 'Only the tax wallet address is saved from this form. The QR is generated automatically.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function CreateRecordCard({
  table,
  fields,
  saving,
  onFieldChange,
  onAddField,
  onRemoveField,
  onReset,
  onCreate,
  onCancel,
}: {
  table: TableConfig;
  fields: DraftField[];
  saving: boolean;
  onFieldChange: (fieldId: string, patch: Partial<DraftField>) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  onReset: () => void;
  onCreate: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">New Record</p>
          <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">Add to {table.label}</h3>
          <p className="mt-1 text-sm text-slate-500">Use simple field inputs, then create the row directly from the CRM.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAddField}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <Plus className="h-4 w-4" />
            Add field
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset template
          </button>

          <button
            type="button"
            onClick={() => void onCreate()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create record
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto]">
              <input
                value={field.key}
                onChange={(event) => onFieldChange(field.id, { key: event.target.value })}
                placeholder="Field name"
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
              <input
                value={field.value}
                onChange={(event) => onFieldChange(field.id, { value: event.target.value })}
                placeholder="Value"
                className="w-full rounded-xl border border-[#006446]/14 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
              />
              <button
                type="button"
                onClick={() => onRemoveField(field.id)}
                disabled={fields.length === 1}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="Remove field"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <p className="text-xs text-slate-500">Numbers, `true`, `false`, and `null` are converted automatically.</p>
        </div>
      </div>
    </div>
  );
}

export default function CrmAdmin() {
  const navigate = useNavigate();
  const { user, profile: viewerProfile, crmRole, signOut } = useAuth();
  const {
    branding,
    loading: loadingBranding,
    remoteAvailable,
    refreshBranding,
    saveBranding,
    uploadLogo,
    uploadFavicon,
  } = useBranding();
  const [initialViewState] = useState<CrmAdminViewState>(() => readCrmAdminViewState());
  const restoredScrollRef = useRef(false);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(initialViewState.selectedUserId || '');
  const [search, setSearch] = useState(initialViewState.search || '');
  const [activeTable, setActiveTable] = useState(initialViewState.activeTable || DEFAULT_TABLE);
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState<DirectoryRoleFilter>(() =>
    normalizeDirectoryRoleFilter(initialViewState.directoryRoleFilter)
  );
  const [directoryPage, setDirectoryPage] = useState(() => Math.max(1, Number(initialViewState.directoryPage) || 1));
  const [directoryPageSize, setDirectoryPageSize] = useState(() =>
    normalizeDirectoryPageSize(initialViewState.directoryPageSize)
  );
  const [tableData, setTableData] = useState<Record<string, AdminRow[]>>({});
  const [tableErrors, setTableErrors] = useState<Record<string, string | null>>({});
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [savingNewRecord, setSavingNewRecord] = useState(false);
  const [savingRecordId, setSavingRecordId] = useState<string | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [reorderingBalanceId, setReorderingBalanceId] = useState<string | null>(null);
  const [refreshingTable, setRefreshingTable] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newActivitySource, setNewActivitySource] = useState<ActivitySourceTable>('transactions');
  const [activityCreatePanel, setActivityCreatePanel] = useState<'transactions' | 'transfers' | null>(null);
  const [newTransactionSource, setNewTransactionSource] = useState<TransactionSourceTable>('transactions');
  const [newTransferSource, setNewTransferSource] = useState<TransferSourceTable>('bank_transfers');
  const [newWalletSource, setNewWalletSource] = useState<WalletSourceTable>('crypto_wallets');
  const [newRecordFields, setNewRecordFields] = useState<DraftField[]>([
    { id: crypto.randomUUID(), key: '', value: '' },
  ]);
  const [newBalanceDraft, setNewBalanceDraft] = useState<BalanceDraft>({
    kind: 'fiat',
    code: 'USD',
    name: '',
    balance: '0',
    status: 'available',
  });
  const [balanceStatusDraft, setBalanceStatusDraft] = useState<BalanceStatusControlValue>('available');
  const [brandingForm, setBrandingForm] = useState<BrandingForm>(() => toBrandingForm(branding));
  const [syncBrandLogos, setSyncBrandLogos] = useState(() => branding.navbarLogoUrl === branding.footerLogoUrl);
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploadingBrandLogo, setUploadingBrandLogo] = useState<'navbar' | 'footer' | 'favicon' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [copiedCredentialKey, setCopiedCredentialKey] = useState<string | null>(null);
  const [savingBalanceStatus, setSavingBalanceStatus] = useState(false);
  const viewerRole = crmRole;
  const isViewerAdmin = viewerRole === 'admin';
  const canCreateUsers = viewerRole === 'admin' || viewerRole === 'superior_manager' || viewerRole === 'agent';
  const profileMap = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const directoryEyebrow = isViewerAdmin ? 'All profiles' : viewerRole === 'superior_manager' ? 'Assigned teams' : 'Assigned customers';
  const directoryTitle = isViewerAdmin ? 'Full CRM directory' : viewerRole === 'superior_manager' ? 'Managed agents and customers' : 'Your assigned customers';
  const directoryDescription = isViewerAdmin
    ? 'Search the complete CRM directory, then open any profile to manage account data, assignments, and activity.'
    : viewerRole === 'superior_manager'
    ? 'This view contains the agents and customers assigned to your team, including accounts you create.'
    : 'This view contains customers assigned directly to you, including customers you create.';
  const workspaceLabel = isViewerAdmin
    ? 'Admin workspace'
    : viewerRole === 'superior_manager'
    ? 'Superior manager workspace'
    : 'Agent workspace';

  async function handleCrmSignOut() {
    await signOut();
    navigate('/online-banking');
  }

  const filteredProfiles = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return profiles.filter((profile) => {
      if (directoryRoleFilter !== 'all' && profile.crm_role !== directoryRoleFilter) return false;
      if (!needle) return true;

      return [profile.full_name, profile.email, profile.id, profile.kyc_status, profile.crm_role]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [directoryRoleFilter, profiles, search]);
  const directoryRoleCounts = useMemo(() => {
    const counts: Record<DirectoryRoleFilter, number> = {
      all: profiles.length,
      customer: 0,
      agent: 0,
      superior_manager: 0,
      admin: 0,
    };

    profiles.forEach((profile) => {
      counts[profile.crm_role] += 1;
    });
    return counts;
  }, [profiles]);
  const directoryPageCount = Math.max(1, Math.ceil(filteredProfiles.length / directoryPageSize));
  const safeDirectoryPage = Math.min(directoryPage, directoryPageCount);
  const directoryPageStart = (safeDirectoryPage - 1) * directoryPageSize;
  const paginatedProfiles = filteredProfiles.slice(directoryPageStart, directoryPageStart + directoryPageSize);
  const firstVisibleDirectoryUser = filteredProfiles.length === 0 ? 0 : directoryPageStart + 1;
  const lastVisibleDirectoryUser = Math.min(directoryPageStart + directoryPageSize, filteredProfiles.length);

  const selectedProfile = profiles.find((profile) => profile.id === selectedUserId) || null;
  const activeTables = TAB_TABLES;
  const activeConfig =
    activeTables.find((table) => table.name === activeTable) ||
    (activeTable === ACTIVITY_TABLE_NAME ? TRANSACTIONS_TABLE : undefined) ||
    (activeTable === TRANSACTIONS_TABLE_NAME ? TRANSACTIONS_TABLE : undefined) ||
    (activeTable === TRANSFERS_TABLE_NAME ? TRANSFERS_TABLE : undefined) ||
    (TRANSACTION_SOURCE_TABLES.includes(activeTable as TransactionSourceTable) ? TRANSACTIONS_TABLE : undefined) ||
    (TRANSFER_SOURCE_TABLES.includes(activeTable as TransferSourceTable) ? TRANSFERS_TABLE : undefined) ||
    (BALANCE_SOURCE_TABLES.includes(activeTable as BalanceSourceTable) ? BALANCES_TABLE : undefined) ||
    (WALLET_SOURCE_TABLES.includes(activeTable as WalletSourceTable) ? WALLETS_TABLE : undefined) ||
    activeTables[0] ||
    TAB_TABLES[0];

  async function handleCopyCredential(profileId: string, field: 'email' | 'password', value: string | null | undefined) {
    const nextValue = value?.trim();

    if (!nextValue) {
      setNotice({ kind: 'error', message: `No ${field} available to copy.` });
      return;
    }

    try {
      await navigator.clipboard.writeText(nextValue);
      const key = `${profileId}:${field}`;
      setCopiedCredentialKey(key);
      window.setTimeout(() => {
        setCopiedCredentialKey((current) => (current === key ? null : current));
      }, 1600);
    } catch (error) {
      setNotice({
        kind: 'error',
        message: error instanceof Error ? error.message : `Could not copy the ${field}.`,
      });
    }
  }

  function handleBrandingFieldChange(field: keyof BrandingForm, value: string) {
    setBrandingForm((current) => {
      const next = { ...current, [field]: value };

      if (syncBrandLogos && field === 'navbarLogoUrl') {
        next.footerLogoUrl = value;
      }

      if (syncBrandLogos && field === 'footerLogoUrl') {
        next.navbarLogoUrl = value;
      }

      return next;
    });
  }

  function handleSyncBrandLogosChange(checked: boolean) {
    setSyncBrandLogos(checked);

    if (checked) {
      setBrandingForm((current) => ({
        ...current,
        footerLogoUrl: current.navbarLogoUrl,
      }));
    }
  }

  async function handleBrandingSave() {
    setSavingBranding(true);

    try {
      const depositorProtectionUrl = brandingForm.depositorProtectionUrl.trim()
        || DEFAULT_BRANDING.depositorProtectionUrl;
      const parsedDepositorProtectionUrl = new URL(depositorProtectionUrl);

      if (!['http:', 'https:'].includes(parsedDepositorProtectionUrl.protocol)) {
        throw new Error('Depositor-protection URL must start with http:// or https://.');
      }

      const legalContactEmail = brandingForm.legalContactEmail.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legalContactEmail)) {
        throw new Error('Enter a valid legal contact email address.');
      }

      const payload: BrandingUpdate = {
        brandName: brandingForm.brandName.trim() || DEFAULT_BRANDING.brandName,
        brandKeyword: brandingForm.brandKeyword.trim() || DEFAULT_BRANDING.brandKeyword,
        navbarLogoUrl: brandingForm.navbarLogoUrl.trim() || DEFAULT_BRANDING.navbarLogoUrl,
        footerLogoUrl: (syncBrandLogos ? brandingForm.navbarLogoUrl : brandingForm.footerLogoUrl).trim() || DEFAULT_BRANDING.footerLogoUrl,
        faviconIcoUrl: brandingForm.faviconIcoUrl.trim() || DEFAULT_BRANDING.faviconIcoUrl,
        favicon16Url: brandingForm.favicon16Url.trim() || DEFAULT_BRANDING.favicon16Url,
        favicon32Url: brandingForm.favicon32Url.trim() || DEFAULT_BRANDING.favicon32Url,
        appleTouchIconUrl: brandingForm.appleTouchIconUrl.trim() || DEFAULT_BRANDING.appleTouchIconUrl,
        favicon192Url: brandingForm.favicon192Url.trim() || DEFAULT_BRANDING.favicon192Url,
        favicon512Url: brandingForm.favicon512Url.trim() || DEFAULT_BRANDING.favicon512Url,
        mfiId: brandingForm.mfiId.trim() || DEFAULT_BRANDING.mfiId,
        countryCode: brandingForm.countryCode.trim().toUpperCase() || DEFAULT_BRANDING.countryCode,
        mfiCode: brandingForm.mfiCode.trim() || DEFAULT_BRANDING.mfiCode,
        institutionalTitle: brandingForm.institutionalTitle.trim(),
        institutionalDescription: brandingForm.institutionalDescription.trim(),
        mfiIdNote: brandingForm.mfiIdNote.trim(),
        depositorProtectionTitle: brandingForm.depositorProtectionTitle.trim(),
        depositorProtectionDescription: brandingForm.depositorProtectionDescription.trim(),
        depositorProtectionUrl,
        legalContactEmail,
      };

      const result = await saveBranding(payload);
      setNotice({
        kind: result.persisted === 'remote' ? 'success' : 'error',
        message: result.persisted === 'remote'
          ? 'Branding, favicons, institutional settings, and legal contact email updated across the site.'
          : `Branding was saved only in this browser. Supabase rejected the update: ${result.error || 'unknown error'}`,
      });
    } catch (error) {
      setNotice({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not save branding settings.',
      });
    } finally {
      setSavingBranding(false);
    }
  }

  async function handleBrandingLogoUpload(slot: 'navbar' | 'footer', file: File) {
    setUploadingBrandLogo(slot);

    try {
      const publicUrl = await uploadLogo(file, slot);
      setBrandingForm((current) => {
        if (syncBrandLogos) {
          return {
            ...current,
            navbarLogoUrl: publicUrl,
            footerLogoUrl: publicUrl,
          };
        }

        return {
          ...current,
          [slot === 'navbar' ? 'navbarLogoUrl' : 'footerLogoUrl']: publicUrl,
        };
      });
      setNotice({ kind: 'success', message: 'Logo is ready. Press Save site settings to publish it.' });
    } catch (error) {
      setNotice({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not upload logo.',
      });
    } finally {
      setUploadingBrandLogo(null);
    }
  }

  async function handleBrandingFaviconUpload(file: File) {
    setUploadingBrandLogo('favicon');

    try {
      const generatedFavicons = await uploadFavicon(file);
      setBrandingForm((current) => ({ ...current, ...generatedFavicons }));
      setNotice({
        kind: 'success',
        message: 'All favicon sizes were generated. Press Save site settings to publish them.',
      });
    } catch (error) {
      setNotice({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not generate the favicon files.',
      });
    } finally {
      setUploadingBrandLogo(null);
    }
  }

  function handleBrandingReset() {
    setBrandingForm(toBrandingForm(DEFAULT_BRANDING));
    setSyncBrandLogos(true);
  }

  const activityRows = useMemo(() => buildActivityRows(tableData), [tableData]);
  const transactionRows = useMemo(() => buildTransactionRows(tableData), [tableData]);
  const transferRows = useMemo(() => buildTransferRows(tableData), [tableData]);
  const balanceRows = useMemo(() => buildBalanceRows(tableData), [tableData]);
  const walletRows = useMemo(() => buildWalletRows(tableData), [tableData]);
  const exchangeHistoryRows = useMemo(() => buildExchangeHistoryRows(tableData), [tableData]);
  const taxRows = useMemo(() => {
    if (tableErrors[TAX_SUMMARY_CARDS_TABLE_NAME] === null) {
      return (tableData[TAX_SUMMARY_CARDS_TABLE_NAME] || []).map(normalizeTaxSummaryCardRow);
    }

    return tableData.taxes || [];
  }, [tableData, tableErrors]);
  const isActivityView = isActivityTable(activeConfig?.name);
  const isTransactionsView = isTransactionsTable(activeConfig?.name);
  const isTransfersView = isTransfersTable(activeConfig?.name);
  const isBalancesView = isBalancesTable(activeConfig?.name);
  const isTaxesView = isTaxesTable(activeConfig?.name);
  const isWalletsView = isWalletsTable(activeConfig?.name);
  const isExchangeControlView = activeConfig?.name === 'currency_exchanges';
  const activityTransactionRows = useMemo(
    () => activityRows.filter((row) => row.__record_type === 'transaction'),
    [activityRows]
  );
  const activityTransferRows = useMemo(
    () => activityRows.filter((row) => row.__record_type === 'transfer'),
    [activityRows]
  );
  const bankingTransactionRows = useMemo(
    () => transactionRows.filter((row) => row.__transaction_kind === 'banking'),
    [transactionRows]
  );
  const cryptoTransactionRows = useMemo(
    () => transactionRows.filter((row) => row.__transaction_kind === 'crypto'),
    [transactionRows]
  );
  const fiatBalanceRows = useMemo(
    () => balanceRows.filter((row) => row.balance_kind === 'fiat'),
    [balanceRows]
  );
  const cryptoBalanceRows = useMemo(
    () => balanceRows.filter((row) => row.balance_kind === 'crypto'),
    [balanceRows]
  );
  const customerBalanceStatus = useMemo(
    () => getSharedBalanceStatus(balanceRows),
    [balanceRows]
  );
  const balanceCreateStatus = balanceRows.length === 0
    ? balanceStatusDraft === 'mixed'
      ? 'available'
      : balanceStatusDraft
    : customerBalanceStatus === 'mixed'
    ? 'available'
    : customerBalanceStatus;
  const balanceCreateStatusNote = balanceRows.length === 0
    ? `The status defaults to ${getBalanceStatusLabel(balanceCreateStatus).toLowerCase()}, and you can choose another status for this balance.`
    : customerBalanceStatus === 'mixed'
    ? 'This customer has mixed statuses, so new balances default to available; you can choose another status before creating one.'
    : `The status defaults to ${getBalanceStatusLabel(balanceCreateStatus)}, and you can choose another status for this balance.`;
  const activityTransactionCreateSource: TransactionSourceTable = newActivitySource === 'crypto_transactions'
    ? 'crypto_transactions'
    : 'transactions';
  const activityTransferCreateSource: TransferSourceTable = newActivitySource === 'crypto_transfers'
    ? 'crypto_transfers'
    : 'bank_transfers';

  useEffect(() => {
    setBalanceStatusDraft(customerBalanceStatus);
  }, [customerBalanceStatus, selectedUserId]);

  const activeRows = activeConfig
    ? isActivityView
      ? activityRows
      : isExchangeControlView
      ? exchangeHistoryRows
      : isWalletsView
      ? walletRows
      : isTransactionsView
      ? transactionRows
      : isTransfersView
      ? transferRows
      : isBalancesView
      ? balanceRows
      : isTaxesView
      ? taxRows
      : tableData[activeConfig.name] || []
    : [];
  const activeTableError = activeConfig
    ? isExchangeControlView
      ? [tableErrors.currency_exchanges, tableErrors.crypto_transactions].filter(Boolean).join(' ')
      : isActivityView
      ? ACTIVITY_SOURCE_TABLES.map((tableName) => tableErrors[tableName]).filter(Boolean).join(' ')
      : isWalletsView
      ? WALLET_SOURCE_TABLES.map((tableName) => tableErrors[tableName]).filter(Boolean).join(' ')
      : isTransactionsView
      ? TRANSACTION_SOURCE_TABLES.map((tableName) => tableErrors[tableName]).filter(Boolean).join(' ')
      : isTransfersView
      ? TRANSFER_SOURCE_TABLES.map((tableName) => tableErrors[tableName]).filter(Boolean).join(' ')
      : isBalancesView
      ? BALANCE_SOURCE_TABLES.map((tableName) => tableErrors[tableName]).filter(Boolean).join(' ')
      : isTaxesView
      ? tableErrors[TAX_SUMMARY_CARDS_TABLE_NAME] && tableErrors.taxes
        ? `${tableErrors[TAX_SUMMARY_CARDS_TABLE_NAME]} ${tableErrors.taxes}`
        : null
      : tableErrors[activeConfig.name]
    : null;

  useEffect(() => {
    void loadProfiles();
  }, []);

  useEffect(() => {
    setBrandingForm(toBrandingForm(branding));
    setSyncBrandLogos(branding.navbarLogoUrl === branding.footerLogoUrl);
  }, [branding]);

  useEffect(() => {
    updateCrmAdminViewState({
      selectedUserId,
      activeTable,
      search,
      directoryRoleFilter,
      directoryPage: safeDirectoryPage,
      directoryPageSize,
    });
  }, [selectedUserId, activeTable, search, directoryRoleFilter, safeDirectoryPage, directoryPageSize]);

  useEffect(() => {
    if (directoryPage > directoryPageCount) {
      setDirectoryPage(directoryPageCount);
    }
  }, [directoryPage, directoryPageCount]);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!(main instanceof HTMLElement)) return;

    mainScrollRef.current = main;

    const saveScroll = () => {
      updateCrmAdminViewState({ scrollTop: main.scrollTop });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScroll();
      }
    };

    main.addEventListener('scroll', saveScroll, { passive: true });
    window.addEventListener('pagehide', saveScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      saveScroll();
      main.removeEventListener('scroll', saveScroll);
      window.removeEventListener('pagehide', saveScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const scrollTop = initialViewState.scrollTop || 0;
    if (restoredScrollRef.current || scrollTop <= 0) return;
    if (loadingProfiles || (selectedUserId && loadingTables)) return;

    const main = mainScrollRef.current ?? document.querySelector('main');
    if (!(main instanceof HTMLElement)) return;

    restoredScrollRef.current = true;

    const restoreScroll = () => {
      main.scrollTop = scrollTop;
    };

    requestAnimationFrame(() => {
      restoreScroll();
      window.setTimeout(restoreScroll, 120);
    });
  }, [activeConfig?.name, initialViewState.scrollTop, loadingProfiles, loadingTables, selectedProfile, selectedUserId]);

  useEffect(() => {
    if (!activeConfig) return;

    if (activeTable !== activeConfig.name) {
      setActiveTable(activeConfig.name);
    }
  }, [activeConfig, activeTable]);

  useEffect(() => {
    if (!activeConfig) return;
    if (isExchangeControlView || isActivityTable(activeConfig.name) || isBalancesTable(activeConfig.name) || isTransactionsTable(activeConfig.name) || isTransfersTable(activeConfig.name) || isWalletsTable(activeConfig.name)) return;

    setNewRecordFields(toDraftFields(activeConfig, selectedUserId, tableData[activeConfig.name]?.[0]));
  }, [activeConfig, selectedUserId, tableData, isExchangeControlView]);

  useEffect(() => {
    setEditingRecordId(null);
    setIsAddingRecord(false);
    setActivityCreatePanel(null);
  }, [activeConfig?.name, selectedUserId]);

  useEffect(() => {
    setNewBalanceDraft({
      kind: 'fiat',
      code: 'USD',
      name: '',
      balance: '0',
      status: 'available',
    });
  }, [selectedUserId, activeConfig?.name]);

  useEffect(() => {
    if (loadingProfiles) return;

    if (selectedUserId && profiles.length > 0 && !profiles.some((profile) => profile.id === selectedUserId)) {
      setSelectedUserId('');
    }
  }, [loadingProfiles, profiles, selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      void loadAllTableData(selectedUserId);
    }
    // Reload only when the selected customer changes. The loader is a component-local
    // function whose identity changes on every render, but its inputs do not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  async function loadProfiles() {
    setLoadingProfiles(true);
    setNotice(null);

    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

    if (error) {
      setNotice({ kind: 'error', message: error.message });
      setProfiles([]);
    } else {
      const nextProfiles = ((data as Partial<ProfileRecord>[]) || []).map((profile) => ({
        ...profile,
        crm_role: normalizeCrmRole(profile.crm_role, profile.is_admin ? 'admin' : 'customer'),
        assigned_manager_id: profile.assigned_manager_id || null,
        assigned_agent_id: profile.assigned_agent_id || null,
      })) as ProfileRecord[];

      setProfiles(nextProfiles);
    }

    setLoadingProfiles(false);
  }

  async function fetchTable(table: TableConfig, userId: string) {
    const orderColumn = table.orderColumn ?? 'created_at';
    let baseQuery = supabase.from(table.name).select('*');

    if (table.scope === 'user' && table.filterColumn) {
      baseQuery = baseQuery.eq(table.filterColumn, userId);
    }

    let { data, error } = await baseQuery.order(orderColumn, { ascending: false });

    if (error?.message?.includes(orderColumn) && error.message.includes('column')) {
      const fallbackResult = await baseQuery;
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    const rows = ((data as AdminRow[]) || []).map((row) => normalizeIbanRow(table.name, row));
    return { rows, error: error?.message || null };
  }

  async function loadAllTableData(userId: string) {
    setLoadingTables(true);

    const results = await Promise.all(
      DATA_FETCH_TABLES.map(async (table) => ({ table, result: await fetchTable(table, userId) }))
    );

    const nextData: Record<string, AdminRow[]> = {};
    const nextErrors: Record<string, string | null> = {};

    results.forEach(({ table, result }) => {
      nextData[table.name] = result.rows;
      nextErrors[table.name] = result.error;
    });

    setTableData(nextData);
    setTableErrors(nextErrors);
    setLoadingTables(false);
  }

  async function refreshSingleTable(table: TableConfig) {
    if (!selectedUserId) return;
    setRefreshingTable(table.name);

    if (isActivityTable(table.name)) {
      const results = await Promise.all(
        ACTIVITY_SOURCE_TABLES.map(async (tableName) => {
          const sourceConfig = getDataTableConfig(tableName);
          if (!sourceConfig) return null;

          return {
            tableName,
            result: await fetchTable(sourceConfig, selectedUserId),
          };
        })
      );

      const nextData: Record<string, AdminRow[]> = {};
      const nextErrors: Record<string, string | null> = {};

      results.forEach((entry) => {
        if (!entry) return;
        nextData[entry.tableName] = entry.result.rows;
        nextErrors[entry.tableName] = entry.result.error;
      });

      setTableData((prev) => ({ ...prev, ...nextData }));
      setTableErrors((prev) => ({ ...prev, ...nextErrors }));
      setRefreshingTable(null);
      return;
    }

    if (isWalletsTable(table.name)) {
      const results = await Promise.all(
        WALLET_SOURCE_TABLES.map(async (tableName) => {
          const sourceConfig = getDataTableConfig(tableName);
          if (!sourceConfig) return null;

          return {
            tableName,
            result: await fetchTable(sourceConfig, selectedUserId),
          };
        })
      );

      const nextData: Record<string, AdminRow[]> = {};
      const nextErrors: Record<string, string | null> = {};

      results.forEach((entry) => {
        if (!entry) return;
        nextData[entry.tableName] = entry.result.rows;
        nextErrors[entry.tableName] = entry.result.error;
      });

      setTableData((prev) => ({ ...prev, ...nextData }));
      setTableErrors((prev) => ({ ...prev, ...nextErrors }));
      setRefreshingTable(null);
      return;
    }

    if (isTransactionsTable(table.name)) {
      const results = await Promise.all(
        TRANSACTION_SOURCE_TABLES.map(async (tableName) => {
          const sourceConfig = getDataTableConfig(tableName);
          if (!sourceConfig) return null;

          return {
            tableName,
            result: await fetchTable(sourceConfig, selectedUserId),
          };
        })
      );

      const nextData: Record<string, AdminRow[]> = {};
      const nextErrors: Record<string, string | null> = {};

      results.forEach((entry) => {
        if (!entry) return;
        nextData[entry.tableName] = entry.result.rows;
        nextErrors[entry.tableName] = entry.result.error;
      });

      setTableData((prev) => ({ ...prev, ...nextData }));
      setTableErrors((prev) => ({ ...prev, ...nextErrors }));
      setRefreshingTable(null);
      return;
    }

    if (isTransfersTable(table.name)) {
      const results = await Promise.all(
        TRANSFER_SOURCE_TABLES.map(async (tableName) => {
          const sourceConfig = getDataTableConfig(tableName);
          if (!sourceConfig) return null;

          return {
            tableName,
            result: await fetchTable(sourceConfig, selectedUserId),
          };
        })
      );

      const nextData: Record<string, AdminRow[]> = {};
      const nextErrors: Record<string, string | null> = {};

      results.forEach((entry) => {
        if (!entry) return;
        nextData[entry.tableName] = entry.result.rows;
        nextErrors[entry.tableName] = entry.result.error;
      });

      setTableData((prev) => ({ ...prev, ...nextData }));
      setTableErrors((prev) => ({ ...prev, ...nextErrors }));
      setRefreshingTable(null);
      return;
    }

    if (isBalancesTable(table.name)) {
      const results = await Promise.all(
        BALANCE_SOURCE_TABLES.map(async (tableName) => {
          const sourceConfig = getDataTableConfig(tableName);
          if (!sourceConfig) return null;

          return {
            tableName,
            result: await fetchTable(sourceConfig, selectedUserId),
          };
        })
      );

      const nextData: Record<string, AdminRow[]> = {};
      const nextErrors: Record<string, string | null> = {};

      results.forEach((entry) => {
        if (!entry) return;
        nextData[entry.tableName] = entry.result.rows;
        nextErrors[entry.tableName] = entry.result.error;
      });

      setTableData((prev) => ({ ...prev, ...nextData }));
      setTableErrors((prev) => ({ ...prev, ...nextErrors }));
      setRefreshingTable(null);
      return;
    }

    if (isTaxesTable(table.name)) {
      const [summaryResult, legacyResult] = await Promise.all([
        fetchTable(TAX_SUMMARY_CARDS_TABLE, selectedUserId),
        fetchTable(table, selectedUserId),
      ]);

      setTableData((prev) => ({
        ...prev,
        [TAX_SUMMARY_CARDS_TABLE_NAME]: summaryResult.rows,
        [table.name]: legacyResult.rows,
      }));
      setTableErrors((prev) => ({
        ...prev,
        [TAX_SUMMARY_CARDS_TABLE_NAME]: summaryResult.error,
        [table.name]: legacyResult.error,
      }));
      setRefreshingTable(null);
      return;
    }

    const result = await fetchTable(table, selectedUserId);

    setTableData((prev) => ({ ...prev, [table.name]: result.rows }));
    setTableErrors((prev) => ({ ...prev, [table.name]: result.error }));
    setRefreshingTable(null);
  }

  function resetNewRecordDraft() {
    if (!activeConfig) return;
    if (isActivityTable(activeConfig.name) || isBalancesTable(activeConfig.name) || isTransactionsTable(activeConfig.name) || isTransfersTable(activeConfig.name) || isWalletsTable(activeConfig.name) || isTaxesTable(activeConfig.name)) return;

    setNewRecordFields(toDraftFields(activeConfig, selectedUserId, activeRows[0]));
  }

  function resetNewActivityDraft(sourceTable: ActivitySourceTable = newActivitySource) {
    const sourceConfig = getDataTableConfig(sourceTable);
    if (!sourceConfig) return;

    setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, (tableData[sourceTable] || [])[0]));
  }

  function setActivityCreateSource(sourceTable: ActivitySourceTable) {
    setNewActivitySource(sourceTable);
    const sourceConfig = getDataTableConfig(sourceTable);
    if (!sourceConfig) return;

    setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, (tableData[sourceTable] || [])[0]));
  }

  function resetNewTransactionDraft(sourceTable: TransactionSourceTable = newTransactionSource) {
    const sourceConfig = getDataTableConfig(sourceTable);
    if (!sourceConfig) return;

    setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, (tableData[sourceTable] || [])[0]));
  }

  function resetNewTransferDraft(sourceTable: TransferSourceTable = newTransferSource) {
    const sourceConfig = getDataTableConfig(sourceTable);
    if (!sourceConfig) return;

    setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, (tableData[sourceTable] || [])[0]));
  }

  function resetNewWalletDraft(sourceTable: WalletSourceTable = newWalletSource) {
    const sourceConfig = getDataTableConfig(sourceTable);
    if (!sourceConfig) return;

    setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, (tableData[sourceTable] || [])[0]));
  }

  function resetNewBalanceDraft() {
    setNewBalanceDraft({
      kind: 'fiat',
      code: 'USD',
      name: '',
      balance: '0',
      status: balanceCreateStatus,
    });
  }

  function handleNewRecordFieldChange(fieldId: string, patch: Partial<DraftField>) {
    setNewRecordFields((prev) =>
      prev.map((field) => (field.id === fieldId ? { ...field, ...patch } : field))
    );
  }

  function handleAddNewRecordField() {
    setNewRecordFields((prev) => [...prev, { id: crypto.randomUUID(), key: '', value: '' }]);
  }

  function handleRemoveNewRecordField(fieldId: string) {
    setNewRecordFields((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((field) => field.id !== fieldId);
    });
  }

  function handleStartCreateRecord() {
    if (isTaxesView) {
      return;
    }

    if (isActivityView) {
      setActivityCreatePanel(null);
      resetNewActivityDraft(newActivitySource);
    } else if (isBalancesView) {
      resetNewBalanceDraft();
    } else if (isWalletsView) {
      resetNewWalletDraft(newWalletSource);
    } else if (isTransactionsView) {
      resetNewTransactionDraft(newTransactionSource);
    } else if (isTransfersView) {
      resetNewTransferDraft(newTransferSource);
    } else {
      resetNewRecordDraft();
    }
    setEditingRecordId(null);
    setIsAddingRecord(true);
  }

  function handleStartActivityPanelCreate(panel: 'transactions' | 'transfers') {
    const nextSource = panel === 'transactions'
      ? activityTransactionCreateSource
      : activityTransferCreateSource;

    setActivityCreatePanel(panel);
    setActivityCreateSource(nextSource);
    setEditingRecordId(null);
    setIsAddingRecord(true);
  }

  function handleCancelCreateRecord() {
    setIsAddingRecord(false);
    setActivityCreatePanel(null);
  }

  function handleStartEditRecord(rowId: string) {
    setIsAddingRecord(false);
    setActivityCreatePanel(null);
    setEditingRecordId(rowId);
  }

  async function handleCreateRecord() {
    if (!activeConfig) return;

    if (isActivityTable(activeConfig.name)) {
      const sourceConfig = getDataTableConfig(newActivitySource);
      if (!sourceConfig) {
        setNotice({ kind: 'error', message: 'The selected activity source is not available.' });
        return;
      }

      setSavingNewRecord(true);
      setNotice(null);

      const payload: Record<string, unknown> = {};
      const validFields = newRecordFields.filter((field) => field.key.trim());

      if (validFields.length === 0) {
        setNotice({
          kind: 'error',
          message: 'Add at least one field before creating a transaction or transfer.',
        });
        setSavingNewRecord(false);
        return;
      }

      validFields.forEach((field) => {
        payload[field.key.trim()] = parseDraftValue(field.value);
      });

      if (sourceConfig.scope === 'user' && sourceConfig.filterColumn && selectedUserId) {
        payload[sourceConfig.filterColumn] = payload[sourceConfig.filterColumn] ?? selectedUserId;
      }

      if (isTransferSourceTable(sourceConfig.name)) {
        enforceExternalTransferCreatePayload(sourceConfig.name, payload);
      }

      if (!normalizeActivityCreateDate(payload)) {
        setNotice({ kind: 'error', message: 'Choose a valid activity date and time.' });
        setSavingNewRecord(false);
        return;
      }
      delete payload.id;
      delete payload.updated_at;

      const { data, error } = await insertAdminRow(sourceConfig.name, payload);

      if (error) {
        setNotice({ kind: 'error', message: error.message });
      } else if (data) {
        setTableData((prev) => ({
          ...prev,
          [sourceConfig.name]: [data as AdminRow, ...(prev[sourceConfig.name] || [])],
        }));
        setNotice({
          kind: 'success',
          message: `${getActivityCreatedLabel(newActivitySource)} created.`,
        });
        setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, data as AdminRow));
        setIsAddingRecord(false);
        setActivityCreatePanel(null);
      }

      setSavingNewRecord(false);
      return;
    }

    if (isWalletsTable(activeConfig.name)) {
      const sourceConfig = getDataTableConfig(newWalletSource);
      if (!sourceConfig) {
        setNotice({ kind: 'error', message: 'The selected wallet source is not available.' });
        return;
      }

      setSavingNewRecord(true);
      setNotice(null);

      const payload: Record<string, unknown> = {};
      const validFields = newRecordFields.filter((field) => field.key.trim());

      if (validFields.length === 0) {
        setNotice({
          kind: 'error',
          message: 'Add at least one field before creating a wallet.',
        });
        setSavingNewRecord(false);
        return;
      }

      validFields.forEach((field) => {
        payload[field.key.trim()] = parseDraftValue(field.value);
      });

      if (newWalletSource === 'tax_wallet_addresses') {
        payload.label = 'Tax Payment Wallet';
        payload.symbol = '';
        payload.network = '';
        payload.payment_uri = '';
      }

      Object.assign(payload, normalizeWalletAdminPayload(payload));

      if (sourceConfig.scope === 'user' && sourceConfig.filterColumn && selectedUserId) {
        payload[sourceConfig.filterColumn] = payload[sourceConfig.filterColumn] ?? selectedUserId;
      }

      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      if (newWalletSource === 'crypto_wallets' && !String(payload.symbol || '').trim()) {
        setNotice({ kind: 'error', message: 'Enter the cryptocurrency symbol for this wallet.' });
        setSavingNewRecord(false);
        return;
      }

      if (newWalletSource === 'crypto_wallets' && !String(payload.network || '').trim()) {
        setNotice({ kind: 'error', message: 'Enter the exact blockchain network for this wallet.' });
        setSavingNewRecord(false);
        return;
      }

      const paymentRequest = getCryptoPaymentRequest({
        wallet_address: String(payload.wallet_address || ''),
        symbol: String(payload.symbol || ''),
        network: String(payload.network || ''),
        payment_uri: String(payload.payment_uri || ''),
      });
      if (!paymentRequest.valid) {
        setNotice({ kind: 'error', message: paymentRequest.error || 'The wallet address is invalid.' });
        setSavingNewRecord(false);
        return;
      }

      const existingTaxWallet = newWalletSource === 'tax_wallet_addresses'
        ? (tableData.tax_wallet_addresses || [])[0]
        : null;
      const saveResult = existingTaxWallet
        ? await updateAdminRow(sourceConfig.name, String(existingTaxWallet.id), (() => {
            const updatePayload = { ...payload };
            delete updatePayload.user_id;
            return updatePayload;
          })())
        : await insertAdminRow(sourceConfig.name, payload);
      const { data, error } = saveResult;

      if (error) {
        setNotice({ kind: 'error', message: error.message });
      } else if (data) {
        setTableData((prev) => ({
          ...prev,
          [sourceConfig.name]: existingTaxWallet
            ? (prev[sourceConfig.name] || []).map((row) => row.id === existingTaxWallet.id ? data as AdminRow : row)
            : [data as AdminRow, ...(prev[sourceConfig.name] || [])],
        }));
        setNotice({
          kind: 'success',
          message: newWalletSource === 'crypto_wallets'
            ? 'Crypto wallet created.'
            : 'Tax payment wallet configured.',
        });
        setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, data as AdminRow));
        setIsAddingRecord(false);
      }

      setSavingNewRecord(false);
      return;
    }

    if (isTransfersTable(activeConfig.name)) {
      const sourceConfig = getDataTableConfig(newTransferSource);
      if (!sourceConfig) {
        setNotice({ kind: 'error', message: 'The selected transfer source is not available.' });
        return;
      }

      setSavingNewRecord(true);
      setNotice(null);

      const payload: Record<string, unknown> = {};
      const validFields = newRecordFields.filter((field) => field.key.trim());

      if (validFields.length === 0) {
        setNotice({
          kind: 'error',
          message: 'Add at least one field before creating a transfer.',
        });
        setSavingNewRecord(false);
        return;
      }

      validFields.forEach((field) => {
        payload[field.key.trim()] = parseDraftValue(field.value);
      });

      if (sourceConfig.scope === 'user' && sourceConfig.filterColumn && selectedUserId) {
        payload[sourceConfig.filterColumn] = payload[sourceConfig.filterColumn] ?? selectedUserId;
      }

      enforceExternalTransferCreatePayload(newTransferSource, payload);

      if (!normalizeActivityCreateDate(payload)) {
        setNotice({ kind: 'error', message: 'Choose a valid transfer date and time.' });
        setSavingNewRecord(false);
        return;
      }
      delete payload.id;
      delete payload.updated_at;

      const { data, error } = await insertAdminRow(sourceConfig.name, payload);

      if (error) {
        setNotice({ kind: 'error', message: error.message });
      } else if (data) {
        setTableData((prev) => ({
          ...prev,
          [sourceConfig.name]: [data as AdminRow, ...(prev[sourceConfig.name] || [])],
        }));
        setNotice({
          kind: 'success',
          message: `${newTransferSource === 'crypto_transfers' ? 'Crypto' : 'Bank'} transfer created.`,
        });
        setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, data as AdminRow));
        setIsAddingRecord(false);
      }

      setSavingNewRecord(false);
      return;
    }

    if (isTransactionsTable(activeConfig.name)) {
      const sourceConfig = getDataTableConfig(newTransactionSource);
      if (!sourceConfig) {
        setNotice({ kind: 'error', message: 'The selected transaction source is not available.' });
        return;
      }

      setSavingNewRecord(true);
      setNotice(null);

      const payload: Record<string, unknown> = {};
      const validFields = newRecordFields.filter((field) => field.key.trim());

      if (validFields.length === 0) {
        setNotice({
          kind: 'error',
          message: 'Add at least one field before creating a transaction.',
        });
        setSavingNewRecord(false);
        return;
      }

      validFields.forEach((field) => {
        payload[field.key.trim()] = parseDraftValue(field.value);
      });

      if (sourceConfig.scope === 'user' && sourceConfig.filterColumn && selectedUserId) {
        payload[sourceConfig.filterColumn] = payload[sourceConfig.filterColumn] ?? selectedUserId;
      }

      if (!normalizeActivityCreateDate(payload)) {
        setNotice({ kind: 'error', message: 'Choose a valid transaction date and time.' });
        setSavingNewRecord(false);
        return;
      }
      delete payload.id;
      delete payload.updated_at;

      const { data, error } = await insertAdminRow(sourceConfig.name, payload);

      if (error) {
        setNotice({ kind: 'error', message: error.message });
      } else if (data) {
        setTableData((prev) => ({
          ...prev,
          [sourceConfig.name]: [data as AdminRow, ...(prev[sourceConfig.name] || [])],
        }));
        setNotice({
          kind: 'success',
          message: `${newTransactionSource === 'crypto_transactions' ? 'Crypto' : 'Banking'} transaction created.`,
        });
        setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, data as AdminRow));
        setIsAddingRecord(false);
      }

      setSavingNewRecord(false);
      return;
    }

    if (isBalancesTable(activeConfig.name)) {
      setSavingNewRecord(true);
      setNotice(null);

      const trimmedCode = newBalanceDraft.code.trim().toUpperCase();
      const numericBalance = Number(newBalanceDraft.balance);

      if (!selectedUserId) {
        setNotice({ kind: 'error', message: 'Select a customer before creating a balance.' });
        setSavingNewRecord(false);
        return;
      }

      if (!trimmedCode) {
        setNotice({ kind: 'error', message: 'Enter a currency or symbol first.' });
        setSavingNewRecord(false);
        return;
      }

      if (!Number.isFinite(numericBalance) || numericBalance < 0) {
        setNotice({ kind: 'error', message: 'Enter a valid balance amount.' });
        setSavingNewRecord(false);
        return;
      }

      const targetTable = newBalanceDraft.kind === 'fiat' ? 'fiat_balances' : 'crypto_balances';
      const codeColumn = newBalanceDraft.kind === 'fiat' ? 'currency' : 'symbol';
      const validCode = newBalanceDraft.kind === 'fiat'
        ? /^[A-Z]{3}$/.test(trimmedCode)
        : /^[A-Z0-9]{2,15}$/.test(trimmedCode);

      if (!validCode) {
        setNotice({
          kind: 'error',
          message: newBalanceDraft.kind === 'fiat'
            ? 'Fiat currency codes must contain exactly 3 letters.'
            : 'Crypto symbols must contain 2 to 15 letters or numbers.',
        });
        setSavingNewRecord(false);
        return;
      }

      if ((tableData[targetTable] || []).some((row) => String(row[codeColumn] || '').toUpperCase() === trimmedCode)) {
        setNotice({ kind: 'error', message: `${trimmedCode} already exists for this customer.` });
        setSavingNewRecord(false);
        return;
      }

      try {
        const marketData = await fetchLiveMarketData({
          fiatCurrencies: newBalanceDraft.kind === 'fiat' ? [trimmedCode] : [],
          cryptoSymbols: newBalanceDraft.kind === 'crypto' ? [trimmedCode] : [],
          includeCrypto: newBalanceDraft.kind === 'crypto',
        });

        if (newBalanceDraft.kind === 'fiat') {
          if (marketData.fiat_error) throw new Error(marketData.fiat_error);
          if (!marketData.supported_fiat_currencies.includes(trimmedCode)) {
            throw new Error(`${trimmedCode} is not supported by the live fiat-rate provider.`);
          }
        } else {
          if (marketData.crypto_error) throw new Error(marketData.crypto_error);
          if (!marketData.crypto[trimmedCode]) {
            throw new Error(`${trimmedCode} does not have a current CoinGecko market quote.`);
          }
        }
      } catch (marketError) {
        setNotice({
          kind: 'error',
          message: marketError instanceof Error
            ? marketError.message
            : 'Could not validate this asset with the live market provider.',
        });
        setSavingNewRecord(false);
        return;
      }

      const nextDisplayOrder = (tableData[targetTable] || []).reduce(
        (highestOrder, row) => Math.max(highestOrder, Number(row.display_order ?? -1)),
        -1
      ) + 1;
      const payload =
        newBalanceDraft.kind === 'fiat'
          ? {
              user_id: selectedUserId,
              currency: trimmedCode,
              name: newBalanceDraft.name.trim() || getDefaultFiatAssetName(trimmedCode),
              display_order: nextDisplayOrder,
              balance: numericBalance,
              status: normalizeBalanceStatus(newBalanceDraft.status),
            }
          : {
              user_id: selectedUserId,
              symbol: trimmedCode,
              name: newBalanceDraft.name.trim() || trimmedCode,
              display_order: nextDisplayOrder,
              balance: numericBalance,
              status: normalizeBalanceStatus(newBalanceDraft.status),
            };

      const insertPayload: Record<string, unknown> = { ...payload };
      const optionalColumns = newBalanceDraft.kind === 'fiat'
        ? ['name', 'display_order']
        : ['display_order'];
      let insertResult = await supabase.from(targetTable).insert(insertPayload).select().single();

      for (let attempt = 0; attempt < optionalColumns.length && insertResult.error; attempt += 1) {
        const unsupportedColumn = optionalColumns.find(
          (column) =>
            Object.prototype.hasOwnProperty.call(insertPayload, column) &&
            insertResult.error?.message.includes(`'${column}' column`)
        );

        if (!unsupportedColumn) break;

        delete insertPayload[unsupportedColumn];
        insertResult = await supabase.from(targetTable).insert(insertPayload).select().single();
      }

      const { data, error } = insertResult;

      if (error) {
        setNotice({ kind: 'error', message: error.message });
      } else if (data) {
        setTableData((prev) => ({
          ...prev,
          [targetTable]: [data as AdminRow, ...(prev[targetTable] || [])],
        }));
        setNotice({
          kind: 'success',
          message: `${newBalanceDraft.kind === 'fiat' ? 'Fiat' : 'Crypto'} balance created with ${getBalanceStatusLabel(newBalanceDraft.status).toLowerCase()} status.`,
        });
        resetNewBalanceDraft();
        setIsAddingRecord(false);
      }

      setSavingNewRecord(false);
      return;
    }

    setSavingNewRecord(true);
    setNotice(null);

    const payload: Record<string, unknown> = {};
    const validFields = newRecordFields.filter((field) => field.key.trim());

    if (validFields.length === 0) {
      setNotice({
        kind: 'error',
        message: 'Add at least one field before creating a record.',
      });
      setSavingNewRecord(false);
      return;
    }

    validFields.forEach((field) => {
      payload[field.key.trim()] = parseDraftValue(field.value);
    });

    if (activeConfig.scope === 'user' && activeConfig.filterColumn && selectedUserId) {
      payload[activeConfig.filterColumn] = payload[activeConfig.filterColumn] ?? selectedUserId;
    }

    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    const { data, error } = await insertAdminRow(activeConfig.name, payload);

    if (error) {
      setNotice({ kind: 'error', message: error.message });
    } else if (data) {
      setTableData((prev) => ({
        ...prev,
        [activeConfig.name]: [data as AdminRow, ...(prev[activeConfig.name] || [])],
      }));
      setNotice({ kind: 'success', message: `${activeConfig.label} record created.` });
      setNewRecordFields(toDraftFields(activeConfig, selectedUserId, data as AdminRow));
      setIsAddingRecord(false);
    }

    setSavingNewRecord(false);
  }

  async function handleCreateUser(draft: NewUserDraft) {
    if (!canCreateUsers || !user) {
      setNotice({ kind: 'error', message: 'Your CRM role cannot create users.' });
      return;
    }

    const allowedRoles: CrmRole[] = isViewerAdmin
      ? ['customer', 'agent', 'superior_manager', 'admin']
      : viewerRole === 'superior_manager'
      ? ['customer', 'agent']
      : ['customer'];

    if (!allowedRoles.includes(draft.crm_role)) {
      setNotice({ kind: 'error', message: `${getCrmRoleLabel(viewerRole)} cannot create that CRM role.` });
      return;
    }

    const fullName = draft.full_name.trim();
    const email = draft.email.trim().toLowerCase();
    if (!fullName) {
      setNotice({ kind: 'error', message: 'Full name is required.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice({ kind: 'error', message: 'Enter a valid email address.' });
      return;
    }
    if (draft.password.length < 6) {
      setNotice({ kind: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (draft.password !== draft.confirm_password) {
      setNotice({ kind: 'error', message: 'The password confirmation does not match.' });
      return;
    }
    const accountCreatedAt = accountDateInputToIso(draft.account_created_date);
    if (!accountCreatedAt) {
      setNotice({ kind: 'error', message: 'Choose a valid account creation date.' });
      return;
    }

    setCreatingUser(true);
    setCreateUserError('');
    setNotice(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let currentSession = sessionData.session;
      const tokenExpiresSoon =
        !currentSession?.expires_at ||
        currentSession.expires_at * 1000 <= Date.now() + 60_000;

      if (!currentSession || tokenExpiresSoon) {
        const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        currentSession = refreshedData.session;
      }

      if (!currentSession?.access_token) {
        throw new Error('Your CRM session is missing. Please sign in again and retry.');
      }

      const requestBody = {
        action: 'create',
        full_name: fullName,
        email,
        password: draft.password,
        account_iban: draft.account_iban.trim().toUpperCase(),
        kyc_status: draft.kyc_status,
        crm_role: draft.crm_role,
        assigned_manager_id:
          viewerRole === 'agent'
            ? viewerProfile?.assigned_manager_id || null
            : viewerRole === 'superior_manager'
            ? user.id
            : draft.crm_role === 'customer' || draft.crm_role === 'agent'
            ? draft.assigned_manager_id || null
            : null,
        assigned_agent_id:
          viewerRole === 'agent'
            ? user.id
            : draft.crm_role === 'customer'
            ? draft.assigned_agent_id || null
            : null,
        email_confirm: draft.email_confirm,
        account_created_at: accountCreatedAt,
        show_account_created_at: draft.show_account_created_at,
      };
      const runCreateRequest = (accessToken: string) =>
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-management`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

      const runCompatibilityCreate = async (accessToken: string): Promise<CreateUserResponse> => {
        if (!isViewerAdmin) {
          throw new Error(
            'Staff account creation requires the current admin-user-management function to be deployed.'
          );
        }

        if (!draft.email_confirm) {
          throw new Error(
            'Creating an unconfirmed login requires the current admin-user-management function. Ask the Supabase project owner to deploy it, or enable “Mark email as confirmed” and retry.'
          );
        }

        const registrationResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              full_name: fullName,
              email,
              password: draft.password,
            }),
          }
        );
        const registrationText = await registrationResponse.text();
        let registrationBody: { error?: string } = {};

        if (registrationText) {
          try {
            registrationBody = JSON.parse(registrationText) as { error?: string };
          } catch {
            registrationBody = {};
          }
        }

        if (!registrationResponse.ok) {
          throw new Error(
            registrationBody.error || registrationText || `Account creation failed with status ${registrationResponse.status}.`
          );
        }

        let triggeredProfile: ProfileRecord | null = null;
        let profileLookupError = '';

        for (let attempt = 0; attempt < 8; attempt += 1) {
          const { data, error } = await supabase
            .from('profiles')
            .select(PROFILE_RECORD_SELECT)
            .eq('email', email)
            .maybeSingle();

          if (data) {
            triggeredProfile = data as ProfileRecord;
            break;
          }

          if (error) profileLookupError = error.message;
          await waitForProfileTrigger();
        }

        if (!triggeredProfile) {
          throw new Error(
            `The login was created, but its CRM profile was not generated.${profileLookupError ? ` ${profileLookupError}` : ''}`
          );
        }

        const profilePayload = {
          full_name: fullName,
          email,
          account_iban: draft.account_iban.trim().toUpperCase(),
          kyc_status: draft.kyc_status,
          crm_role: draft.crm_role,
          is_admin: draft.crm_role === 'admin',
          assigned_manager_id:
            draft.crm_role === 'customer' || draft.crm_role === 'agent'
              ? draft.assigned_manager_id || null
              : null,
          assigned_agent_id: draft.crm_role === 'customer' ? draft.assigned_agent_id || null : null,
          plain_password: draft.password,
          created_at: accountCreatedAt,
          show_account_created_at: draft.show_account_created_at,
          updated_at: new Date().toISOString(),
        };
        const { data: configuredProfile, error: configureError } = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('id', triggeredProfile.id)
          .select(PROFILE_RECORD_SELECT)
          .single();

        if (configureError || !configuredProfile) {
          let rollbackWarning = '';

          try {
            const rollbackResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-management`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  action: 'delete',
                  user_id: triggeredProfile.id,
                  confirm_email: email,
                }),
              }
            );

            if (!rollbackResponse.ok) {
              const rollbackText = await rollbackResponse.text();
              rollbackWarning = ` Automatic rollback failed${rollbackText ? `: ${rollbackText}` : '.'}`;
            }
          } catch (rollbackError) {
            rollbackWarning = ` Automatic rollback failed: ${rollbackError instanceof Error ? rollbackError.message : 'unknown error'}`;
          }

          throw new Error(
            `The login was created, but CRM profile setup failed: ${configureError?.message || 'No configured profile was returned'}.${rollbackWarning}`
          );
        }

        return {
          profile: configuredProfile as ProfileRecord,
          user: {
            id: triggeredProfile.id,
            email,
            email_confirmed: true,
          },
        };
      };

      let activeAccessToken = currentSession.access_token;
      let response = await runCreateRequest(activeAccessToken);

      if (response.status === 401) {
        const { data: retriedSession, error: retryError } = await supabase.auth.refreshSession();
        if (retryError || !retriedSession.session?.access_token) {
          throw new Error(retryError?.message || 'Your administrator session expired. Please sign in again.');
        }
        activeAccessToken = retriedSession.session.access_token;
        response = await runCreateRequest(activeAccessToken);
      }

      const rawResponse = await response.text();
      let responseBody: CreateUserResponse = {};
      if (rawResponse) {
        try {
          responseBody = JSON.parse(rawResponse) as CreateUserResponse;
        } catch {
          responseBody = {};
        }
      }

      if (!response.ok) {
        const primaryError = responseBody.error || rawResponse || `User creation failed with status ${response.status}`;
        const staleCreateFunction = primaryError.trim().toLowerCase() === 'user_id is required';

        if (staleCreateFunction) {
          responseBody = await runCompatibilityCreate(activeAccessToken);
        } else {
          const rollbackWarning = responseBody.rollback_warning
            ? ` Auth rollback warning: ${responseBody.rollback_warning}`
            : '';
          throw new Error(`${primaryError}${rollbackWarning}`);
        }
      }

      if (!responseBody.profile?.id) {
        throw new Error('The user was created, but the CRM function did not return the new profile. Refresh the directory to verify it.');
      }

      const nextProfile = {
        ...responseBody.profile,
        crm_role: normalizeCrmRole(
          responseBody.profile.crm_role,
          responseBody.profile.is_admin ? 'admin' : 'customer'
        ),
        assigned_manager_id: responseBody.profile.assigned_manager_id || null,
        assigned_agent_id: responseBody.profile.assigned_agent_id || null,
      } as ProfileRecord;

      setProfiles((current) => [nextProfile, ...current.filter((profile) => profile.id !== nextProfile.id)]);
      setCreateUserDialogOpen(false);
      setCreateUserError('');
      setSearch('');
      setTableData({});
      setTableErrors({});
      setEditingRecordId(null);
      setIsAddingRecord(false);
      setSelectedUserId(nextProfile.id);
      setNotice({
        kind: 'success',
        message: draft.email_confirm
          ? `${nextProfile.full_name || nextProfile.email} was created successfully and can now sign in.`
          : `${nextProfile.full_name || nextProfile.email} was created successfully and must confirm the email before signing in.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create the user.';
      setCreateUserError(message);
      setNotice({
        kind: 'error',
        message,
      });
    } finally {
      setCreatingUser(false);
    }
  }

  async function handleProfileSave(updates: ProfileSavePayload) {
    if (!selectedProfile) return;

    const accountCreatedAt = accountDateInputToIso(updates.account_created_date);
    if (!accountCreatedAt) {
      setNotice({ kind: 'error', message: 'Choose a valid profile creation date.' });
      return;
    }

    setSavingProfile(true);
    setNotice(null);

    const nextPassword = updates.password.trim();
    const currentPassword = selectedProfile.plain_password || '';
    const passwordChanged = nextPassword.length > 0 && nextPassword !== currentPassword;

    const authNeedsUpdate =
      updates.email !== selectedProfile.email ||
      updates.full_name !== selectedProfile.full_name ||
      passwordChanged;

    if (authNeedsUpdate) {
      const { data: sessionData } = await supabase.auth.getSession();
      let currentSession = sessionData.session;
      const tokenExpiresSoon =
        !currentSession?.expires_at ||
        currentSession.expires_at * 1000 <= Date.now() + 60_000;

      if (!currentSession || tokenExpiresSoon) {
        const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          setNotice({ kind: 'error', message: refreshError.message });
          setSavingProfile(false);
          return;
        }
        currentSession = refreshedData.session;
      }

      if (!currentSession?.access_token) {
        setNotice({ kind: 'error', message: 'Your CRM session is missing. Please sign in again and retry.' });
        setSavingProfile(false);
        return;
      }

      const requestBody = {
        user_id: selectedProfile.id,
        email: updates.email,
        password: passwordChanged ? nextPassword : undefined,
        full_name: updates.full_name,
      };

      const runAdminUpdate = async (accessToken: string) =>
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-management`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

      let authResponse = await runAdminUpdate(currentSession.access_token);

      if (authResponse.status === 401) {
        const { data: retriedSession, error: retryError } = await supabase.auth.refreshSession();

        if (retryError || !retriedSession.session?.access_token) {
          setNotice({
            kind: 'error',
            message: retryError?.message || 'Your admin session expired. Please sign in again and retry.',
          });
          setSavingProfile(false);
          return;
        }

        authResponse = await runAdminUpdate(retriedSession.session.access_token);
      }

      if (!authResponse.ok) {
        const authErrorBody = await authResponse.json().catch(() => null);
        const rawErrorText = !authErrorBody ? await authResponse.text().catch(() => '') : '';
        const fallbackMessage =
          authResponse.status === 401
            ? 'The CRM auth function rejected your session. Sign in again, then verify the deployed edge function has the service role configured.'
            : `Auth update failed with status ${authResponse.status}`;
        const errorMessage = authErrorBody?.error || rawErrorText || fallbackMessage;

        setNotice({ kind: 'error', message: errorMessage });
        setSavingProfile(false);
        return;
      }
    }

    const accountDateChanged = updates.account_created_date !== accountDateIsoToInputValue(selectedProfile.created_at);
    const accountDateVisibilityChanged = updates.show_account_created_at !== (selectedProfile.show_account_created_at !== false);
    const payload: Record<string, unknown> = {
      full_name: updates.full_name,
      email: updates.email,
      account_iban: updates.account_iban.trim(),
      kyc_status: updates.kyc_status,
      crm_role: updates.crm_role,
      is_admin: updates.crm_role === 'admin',
      assigned_manager_id: updates.assigned_manager_id,
      assigned_agent_id: updates.assigned_agent_id,
      plain_password: passwordChanged ? nextPassword : selectedProfile.plain_password,
      updated_at: new Date().toISOString(),
      ...(accountDateChanged ? { created_at: accountCreatedAt } : {}),
      ...(accountDateVisibilityChanged ? { show_account_created_at: updates.show_account_created_at } : {}),
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', selectedProfile.id)
      .select()
      .single();

    if (error) {
      setNotice({ kind: 'error', message: error.message });
    } else if (data) {
      const nextProfile = {
        ...(data as ProfileRecord),
        crm_role: normalizeCrmRole((data as ProfileRecord).crm_role, (data as ProfileRecord).is_admin ? 'admin' : 'customer'),
        assigned_manager_id: (data as ProfileRecord).assigned_manager_id || null,
        assigned_agent_id: (data as ProfileRecord).assigned_agent_id || null,
      } as ProfileRecord;

      setProfiles((prev) => prev.map((profile) => (profile.id === selectedProfile.id ? nextProfile : profile)));
      setNotice({ kind: 'success', message: 'Profile updated successfully.' });
    }

    setSavingProfile(false);
  }

  async function handleDeleteUser(confirmation: string) {
    if (!selectedProfile) return;

    if (!isViewerAdmin) {
      setNotice({ kind: 'error', message: 'Only CRM administrators can permanently delete users.' });
      return;
    }

    if (selectedProfile.id === user?.id) {
      setNotice({ kind: 'error', message: 'You cannot delete your own administrator account.' });
      setDeleteUserDialogOpen(false);
      return;
    }

    setDeletingUser(true);
    setNotice(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let currentSession = sessionData.session;
      const tokenExpiresSoon =
        !currentSession?.expires_at ||
        currentSession.expires_at * 1000 <= Date.now() + 60_000;

      if (!currentSession || tokenExpiresSoon) {
        const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        currentSession = refreshedData.session;
      }

      if (!currentSession?.access_token) {
        throw new Error('Your CRM session is missing. Please sign in again and retry.');
      }

      const requestBody = {
        action: 'delete',
        user_id: selectedProfile.id,
        confirm_email: confirmation.trim(),
      };
      const runDeleteRequest = (accessToken: string) =>
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-management`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

      let response = await runDeleteRequest(currentSession.access_token);

      if (response.status === 401) {
        const { data: retriedSession, error: retryError } = await supabase.auth.refreshSession();
        if (retryError || !retriedSession.session?.access_token) {
          throw new Error(retryError?.message || 'Your administrator session expired. Please sign in again.');
        }
        currentSession = retriedSession.session;
        response = await runDeleteRequest(retriedSession.session.access_token);
      }

      const responseText = await response.text();
      let responseBody: DeleteUserResponse | null = null;

      if (responseText) {
        try {
          responseBody = JSON.parse(responseText) as DeleteUserResponse;
        } catch {
          responseBody = null;
        }
      }

      if (!response.ok) {
        const details = [responseBody?.error, responseBody?.hint].filter(Boolean).join(' ');
        throw new Error(details || `User deletion failed with status ${response.status}.`);
      }

      const { data: sessionAfterDelete, error: sessionCheckError } = await supabase.auth.getSession();
      if (sessionCheckError) throw sessionCheckError;

      if (!sessionAfterDelete.session) {
        const { data: restoredSession, error: restoreError } = await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });

        if (restoreError || !restoredSession.session) {
          throw new Error(
            restoreError?.message ||
              'The user was deleted, but the administrator session could not be preserved. Please sign in again.'
          );
        }
      } else if (sessionAfterDelete.session.user.id !== currentSession.user.id) {
        throw new Error('The administrator session changed unexpectedly. Reload the CRM before continuing.');
      }

      const deletedLabel = selectedProfile.full_name || selectedProfile.email || selectedProfile.id;
      const cleanupWarning = responseBody?.storage_cleanup_warning;

      setProfiles((current) => current.filter((profile) => profile.id !== selectedProfile.id));
      setSelectedUserId('');
      setTableData({});
      setTableErrors({});
      setEditingRecordId(null);
      setIsAddingRecord(false);
      setDeleteUserDialogOpen(false);
      setNotice({
        kind: 'success',
        message: cleanupWarning
          ? `${deletedLabel} was deleted. KYC storage cleanup warning: ${cleanupWarning}`
          : `${deletedLabel} and all corresponding account data were permanently deleted.`,
      });
    } catch (error) {
      setNotice({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not permanently delete the selected user.',
      });
    } finally {
      setDeletingUser(false);
    }
  }

  async function handleRecordSave(tableName: string, originalRow: AdminRow, editedRow: AdminRow) {
    const hasInvalidActivityDate = Object.entries(editedRow).some(
      ([key, value]) => isActivityDateField(editedRow, key) && normalizeDateForSave(value, null) === null
    );

    if (hasInvalidActivityDate) {
      setNotice({ kind: 'error', message: 'Choose a valid date and time before saving.' });
      return;
    }

    setSavingRecordId(originalRow.id);
    setNotice(null);

    const payload = sanitizePayload(
      Object.fromEntries(
        Object.entries(editedRow).map(([key, value]) => [
          key,
          isActivityDateField(editedRow, key)
            ? normalizeDateForSave(value, originalRow[key])
            : coerceValueForSave(originalRow[key], value),
        ])
      ) as AdminRow
    );

    if ('updated_at' in originalRow) {
      payload.updated_at = new Date().toISOString();
    }

    const { data, error } = await updateAdminRow(tableName, originalRow.id, payload);

    if (error) {
      setNotice({ kind: 'error', message: error.message });
    } else if (data) {
      setTableData((prev) => ({
        ...prev,
        [tableName]: (prev[tableName] || []).map((row) => (row.id === originalRow.id ? (data as AdminRow) : row)),
      }));
      setNotice({ kind: 'success', message: `${toSentenceCase(tableName)} record updated.` });
      setEditingRecordId(null);
    }

    setSavingRecordId(null);
  }

  async function handleRecordDelete(tableName: string, rowId: string) {
    setDeletingRecordId(rowId);
    setNotice(null);

    const { error } = await supabase.from(tableName).delete().eq('id', rowId);

    if (error) {
      setNotice({ kind: 'error', message: error.message });
    } else {
      setTableData((prev) => ({
        ...prev,
        [tableName]: (prev[tableName] || []).filter((row) => row.id !== rowId),
      }));
      setNotice({ kind: 'success', message: `${toSentenceCase(tableName)} record deleted.` });
      setEditingRecordId((prev) => (prev === rowId ? null : prev));
    }

    setDeletingRecordId(null);
  }

  async function handleTaxSummaryAmountSave(status: TaxStatus, amount: number, currency: string) {
    if (!selectedUserId) {
      setNotice({ kind: 'error', message: 'Select a customer before editing tax amounts.' });
      return;
    }

    const editId = getTaxSummaryEditId(status);
    const normalizedAmount = Math.max(amount, 0);

    setSavingRecordId(editId);
    setNotice(null);

    if (tableErrors[TAX_SUMMARY_CARDS_TABLE_NAME] === null) {
      const normalizedCurrency = normalizeTaxCurrency(currency);
      let { data, error } = await supabase.rpc('set_tax_summary_card', {
        target_user_id: selectedUserId,
        target_status: status,
        target_amount: normalizedAmount,
        target_currency: normalizedCurrency,
      });

      // Older deployments restricted this RPC to top-level admins even though
      // tax_summary_cards RLS already permits scoped CRM staff. Keep agents and
      // managers functional while the corrected function propagates everywhere.
      if (error && shouldRetryTaxSummaryWithoutRpc(error)) {
        const fallbackResult = await supabase
          .from(TAX_SUMMARY_CARDS_TABLE_NAME)
          .upsert(
            buildTaxSummaryCardUpsertRows(
              tableData[TAX_SUMMARY_CARDS_TABLE_NAME] || [],
              selectedUserId,
              status,
              normalizedAmount,
              normalizedCurrency
            ),
            { onConflict: 'user_id,status' }
          )
          .select();

        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) {
        setNotice({
          kind: 'error',
          message: `Could not update the customer's tax summary: ${error.message}`,
        });
      } else {
        setTableData((prev) => ({
          ...prev,
          [TAX_SUMMARY_CARDS_TABLE_NAME]: (data || []) as AdminRow[],
        }));
        setNotice({ kind: 'success', message: `${getTaxStatusLabel(status)} tax amount and currency updated.` });
        setEditingRecordId(null);
      }

      setSavingRecordId(null);
      return;
    }

    const rowsForStatus = taxRows.filter((row) => normalizeTaxStatus(row.status) === status);
    const [primaryRow, ...duplicateRows] = rowsForStatus;

    if (primaryRow) {
      const { data, error } = await supabase
        .from('taxes')
        .update(buildTaxSummaryAmountPayload(status, normalizedAmount))
        .eq('id', primaryRow.id)
        .select()
        .single();

      if (error) {
        setNotice({ kind: 'error', message: error.message });
        setSavingRecordId(null);
        return;
      }

      let normalizedDuplicateRows: AdminRow[] = [];

      if (duplicateRows.length > 0) {
        const { data: duplicateData, error: duplicateError } = await supabase
          .from('taxes')
          .update(buildTaxSummaryAmountPayload(status, 0))
          .in('id', duplicateRows.map((row) => row.id))
          .select();

        if (duplicateError) {
          setTableData((prev) => ({
            ...prev,
            taxes: (prev.taxes || []).map((row) => (row.id === primaryRow.id && data ? (data as AdminRow) : row)),
          }));
          setNotice({ kind: 'error', message: `Amount saved, but duplicate ${getTaxStatusLabel(status).toLowerCase()} rows could not be reset: ${duplicateError.message}` });
          setSavingRecordId(null);
          return;
        }

        normalizedDuplicateRows = (duplicateData || []) as AdminRow[];
      }

      const changedRows = new Map(
        [data as AdminRow, ...normalizedDuplicateRows].map((row) => [row.id, row])
      );

      setTableData((prev) => ({
        ...prev,
        taxes: (prev.taxes || []).map((row) => changedRows.get(row.id) || row),
      }));
      setNotice({ kind: 'success', message: `${getTaxStatusLabel(status)} tax amount updated.` });
      setEditingRecordId(null);
      setSavingRecordId(null);
      return;
    }

    const { data, error } = await supabase
      .from('taxes')
      .insert(buildTaxSummaryInsertPayload(selectedUserId, status, normalizedAmount))
      .select()
      .single();

    if (error) {
      setNotice({ kind: 'error', message: error.message });
    } else if (data) {
      setTableData((prev) => ({
        ...prev,
        taxes: [data as AdminRow, ...(prev.taxes || [])],
      }));
      setNotice({ kind: 'success', message: `${getTaxStatusLabel(status)} tax amount updated.` });
      setEditingRecordId(null);
    }

    setSavingRecordId(null);
  }

  async function handleCardApprove(row: AdminRow) {
    if (String(row.status ?? '') !== 'pending_approval') {
      setNotice({ kind: 'error', message: 'Only pending card applications can be approved.' });
      return;
    }

    await handleRecordSave('cards', row, {
      ...row,
      status: 'approved',
    });
  }

  async function handleBalanceSave(
    row: BalanceRow,
    nextBalance: string,
    nextStatus: BalanceAvailabilityStatus,
  ) {
    const sourceRows = tableData[row.source_table] || [];
    const originalRow = sourceRows.find((entry) => String(entry.id) === row.source_id);
    const normalizedBalance = shouldNormalizeFiatBalanceInput(row)
      ? normalizeFiatBalanceInput(nextBalance)
      : nextBalance.trim();

    if (!originalRow) {
      setNotice({ kind: 'error', message: 'Could not find the original balance row to update.' });
      return;
    }

    if (!normalizedBalance) {
      setNotice({ kind: 'error', message: 'Enter a valid balance amount.' });
      return;
    }

    const numericBalance = Number(normalizedBalance);

    if (Number.isNaN(numericBalance)) {
      setNotice({ kind: 'error', message: 'Enter a valid balance amount.' });
      return;
    }

    await handleRecordSave(row.source_table, originalRow, {
      ...originalRow,
      balance: numericBalance,
      status: normalizeBalanceStatus(nextStatus),
    });
  }

  async function handleBalanceMove(row: BalanceRow, direction: 'up' | 'down') {
    if (!selectedUserId || reorderingBalanceId) return;

    const orderedRows = row.balance_kind === 'fiat' ? fiatBalanceRows : cryptoBalanceRows;
    const currentIndex = orderedRows.findIndex((entry) => entry.id === row.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedRows.length) return;

    const reorderedRows = [...orderedRows];
    [reorderedRows[currentIndex], reorderedRows[targetIndex]] = [
      reorderedRows[targetIndex],
      reorderedRows[currentIndex],
    ];

    setReorderingBalanceId(row.id);
    setNotice(null);

    try {
      const useDisplayOrder = reorderedRows.every((balanceRow) => balanceRow.__has_display_order);
      const existingTimestamps = reorderedRows
        .map((balanceRow) => new Date(String(balanceRow.created_at || '')).getTime())
        .filter(Number.isFinite);
      const baseTimestamp = existingTimestamps.length > 0
        ? Math.min(...existingTimestamps)
        : Date.now();

      const results = await Promise.all(
        reorderedRows.map(async (balanceRow, displayOrder) => {
          const orderUpdate = useDisplayOrder
            ? { display_order: displayOrder }
            : { created_at: new Date(baseTimestamp + displayOrder * 1000).toISOString() };
          const { data, error } = await supabase
            .from(balanceRow.source_table)
            .update(orderUpdate)
            .eq('id', balanceRow.source_id)
            .eq('user_id', selectedUserId)
            .select()
            .single();

          return { data: data as AdminRow | null, error };
        })
      );

      const failedResult = results.find((result) => result.error);

      if (failedResult?.error) {
        await refreshSingleTable(BALANCES_TABLE);
        setNotice({ kind: 'error', message: failedResult.error.message });
        return;
      }

      const updatedRows = new Map(
        results
          .filter((result): result is { data: AdminRow; error: null } => Boolean(result.data))
          .map((result) => [String(result.data.id), result.data] as const)
      );

      setTableData((prev) => ({
        ...prev,
        [row.source_table]: (prev[row.source_table] || []).map((sourceRow) =>
          updatedRows.get(String(sourceRow.id)) || sourceRow
        ),
      }));
      setNotice({ kind: 'success', message: `${row.asset_code} moved ${direction}.` });
    } catch (error) {
      setNotice({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not update the balance card order.',
      });
    } finally {
      setReorderingBalanceId(null);
    }
  }

  async function handleApplyBalanceStatus() {
    if (!selectedUserId) {
      setNotice({ kind: 'error', message: 'Select a customer before updating balance statuses.' });
      return;
    }

    if (balanceRows.length === 0) {
      setNotice({ kind: 'error', message: 'Add a balance first, then apply a customer-wide status.' });
      return;
    }

    if (balanceStatusDraft === 'mixed') {
      setNotice({ kind: 'error', message: 'Choose Available, Pending, or Frozen before applying a shared balance status.' });
      return;
    }

    const nextStatus = normalizeBalanceStatus(balanceStatusDraft);
    const updates = BALANCE_SOURCE_TABLES
      .filter((tableName) => (tableData[tableName] || []).length > 0)
      .map(async (tableName) => {
        const { data, error } = await supabase
          .from(tableName)
          .update({ status: nextStatus })
          .eq('user_id', selectedUserId)
          .select();

        return {
          tableName,
          data: (data || []) as AdminRow[],
          error,
        };
      });

    if (updates.length === 0) {
      setNotice({ kind: 'error', message: 'No balances were found for this customer.' });
      return;
    }

    setSavingBalanceStatus(true);
    setNotice(null);

    const results = await Promise.all(updates);
    const errors = results.filter((result) => result.error);

    setTableData((prev) => ({
      ...prev,
      ...Object.fromEntries(results.map((result) => [result.tableName, result.data])),
    }));

    if (errors.length > 0) {
      setNotice({
        kind: 'error',
        message: errors.map((result) => result.error?.message).filter(Boolean).join(' '),
      });
    } else {
      setNotice({
        kind: 'success',
        message: `Customer balance status set to ${getBalanceStatusLabel(nextStatus).toLowerCase()}.`,
      });
      setEditingRecordId(null);
    }

    setSavingBalanceStatus(false);
  }

  async function handleBalanceDelete(row: BalanceRow) {
    await handleRecordDelete(row.source_table, row.source_id);
    setEditingRecordId((prev) => (prev === row.id ? null : prev));
  }

  async function handleTransactionSave(row: TransactionRow, editedRow: AdminRow) {
    const sourceRows = tableData[row.__source_table] || [];
    const originalRow = sourceRows.find((entry) => String(entry.id) === row.__source_id);

    if (!originalRow) {
      setNotice({ kind: 'error', message: 'Could not find the original transaction row to update.' });
      return;
    }

    await handleRecordSave(row.__source_table, originalRow, {
      ...editedRow,
      id: originalRow.id,
    });
  }

  async function handleTransactionDelete(row: TransactionRow) {
    await handleRecordDelete(row.__source_table, row.__source_id);
    setEditingRecordId((prev) => (prev === row.id ? null : prev));
  }

  async function handleTransferSave(row: TransferRow, editedRow: AdminRow) {
    const sourceRows = tableData[row.__source_table] || [];
    const originalRow = sourceRows.find((entry) => String(entry.id) === row.__source_id);

    if (!originalRow) {
      setNotice({ kind: 'error', message: 'Could not find the original transfer row to update.' });
      return;
    }

    await handleRecordSave(row.__source_table, originalRow, normalizeTransferSavePayload(row.__source_table, {
      ...editedRow,
      id: originalRow.id,
    }));
  }

  async function handleTransferDelete(row: TransferRow) {
    await handleRecordDelete(row.__source_table, row.__source_id);
    setEditingRecordId((prev) => (prev === row.id ? null : prev));
  }

  async function handleActivitySave(row: ActivityRow, editedRow: AdminRow) {
    if (isTransactionActivityRow(row)) {
      await handleTransactionSave(row, editedRow);
      return;
    }

    if (isTransferActivityRow(row)) {
      await handleTransferSave(row, editedRow);
      return;
    }
  }

  async function handleActivityDelete(row: ActivityRow) {
    if (isTransactionActivityRow(row)) {
      await handleTransactionDelete(row);
      return;
    }

    if (isTransferActivityRow(row)) {
      await handleTransferDelete(row);
      return;
    }
  }

  function getEditableActivityRow(row: ActivityRow): AdminRow {
    const sourceRows = tableData[row.__source_table] || [];
    const originalRow = sourceRows.find((entry) => String(entry.id) === row.__source_id);

    if (!originalRow) {
      return row;
    }

    return {
      ...originalRow,
      __source_table: row.__source_table,
      __source_id: row.__source_id,
      __source_label: row.__source_label,
      __transaction_kind: row.__transaction_kind,
      __record_type: row.__record_type,
    };
  }

  async function handleWalletSave(row: WalletRow, editedRow: AdminRow) {
    const sourceRows = tableData[row.__source_table] || [];
    const originalRow = sourceRows.find((entry) => String(entry.id) === row.__source_id);

    if (!originalRow) {
      setNotice({ kind: 'error', message: 'Could not find the original wallet row to update.' });
      return;
    }

    const sanitized = normalizeWalletAdminPayload(sanitizePayload(editedRow));
    sanitized.payment_uri = '';
    if (row.__source_table === 'tax_wallet_addresses') {
      sanitized.label = 'Tax Payment Wallet';
      sanitized.symbol = '';
      sanitized.network = '';
    }
    const paymentRequest = getCryptoPaymentRequest({
      wallet_address: String(sanitized.wallet_address || ''),
      symbol: String(sanitized.symbol || ''),
      network: String(sanitized.network || ''),
      payment_uri: String(sanitized.payment_uri || ''),
    });
    if (!paymentRequest.valid) {
      setNotice({ kind: 'error', message: paymentRequest.error || 'The wallet address is invalid.' });
      return;
    }

    await handleRecordSave(row.__source_table, originalRow, {
      ...sanitized,
      id: originalRow.id,
    });
  }

  async function handleWalletDelete(row: WalletRow) {
    await handleRecordDelete(row.__source_table, row.__source_id);
    setEditingRecordId((prev) => (prev === row.id ? null : prev));
  }

  async function handleExchangeHistorySave(row: ExchangeHistoryRow, editedRow: AdminRow) {
    const sourceRows = tableData[row.__source_table] || [];
    const originalRow = sourceRows.find((entry) => String(entry.id) === row.__source_id);

    if (!originalRow) {
      setNotice({ kind: 'error', message: 'Could not find the original exchange history row to update.' });
      return;
    }

    await handleRecordSave(row.__source_table, originalRow, {
      ...sanitizePayload(editedRow),
      id: originalRow.id,
    });
  }

  async function handleExchangeHistoryDelete(row: ExchangeHistoryRow) {
    await handleRecordDelete(row.__source_table, row.__source_id);
    setEditingRecordId((prev) => (prev === row.id ? null : prev));
  }

  function renderActivityRow(
    row: ActivityRow,
    tableLabel: string,
    tone: RecordTone,
    options?: { hidePrimaryId?: boolean }
  ) {
    const editableRow = getEditableActivityRow(row);

    return editingRecordId === row.id ? (
      <RecordFormCard
        key={row.id}
        row={editableRow}
        tableLabel={tableLabel}
        tableConfig={getDataTableConfig(row.__source_table) || activeConfig}
        saving={savingRecordId === row.__source_id}
        deleting={deletingRecordId === row.__source_id}
        onSave={(editedRow) => handleActivitySave(row, editedRow)}
        onDelete={() => handleActivityDelete(row)}
        onCancel={() => setEditingRecordId(null)}
        tone={tone}
      />
    ) : (
      <RecordHistoryBar
        key={row.id}
        row={row}
        tableLabel={tableLabel}
        tableConfig={getDataTableConfig(row.__source_table) || activeConfig}
        deleting={deletingRecordId === row.__source_id}
        hidePrimaryId={options?.hidePrimaryId}
        onEdit={() => handleStartEditRecord(row.id)}
        onDelete={() => handleActivityDelete(row)}
        tone={tone}
      />
    );
  }

  function renderBalanceRow(row: BalanceRow, sectionRows: BalanceRow[], rowIndex: number) {
    return (
      <BalanceGroupedRow
        key={row.id}
        row={row}
        editing={editingRecordId === row.id}
        saving={savingRecordId === row.source_id}
        deleting={deletingRecordId === row.source_id}
        reordering={reorderingBalanceId === row.id}
        orderControlsDisabled={reorderingBalanceId !== null}
        canMoveUp={rowIndex > 0}
        canMoveDown={rowIndex < sectionRows.length - 1}
        onEdit={() => handleStartEditRecord(row.id)}
        onMoveUp={() => handleBalanceMove(row, 'up')}
        onMoveDown={() => handleBalanceMove(row, 'down')}
        onSave={(nextBalance, nextStatus) => handleBalanceSave(row, nextBalance, nextStatus)}
        onDelete={() => handleBalanceDelete(row)}
        onCancel={() => setEditingRecordId(null)}
      />
    );
  }

  function renderBalanceSection({
    title,
    description,
    rows,
    kind,
    icon: Icon,
  }: {
    title: string;
    description: string;
    rows: BalanceRow[];
    kind: BalanceRow['balance_kind'];
    icon: LucideIcon;
  }) {
    const isFiat = kind === 'fiat';

    return (
      <section className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] ${isFiat ? 'border-[#006446]/12' : 'border-slate-200/90 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.25)]'}`}>
        <div className={`border-b px-5 py-5 sm:px-6 ${isFiat ? 'border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.12] via-[#006446]/[0.04] to-white' : 'border-slate-200/90 bg-gradient-to-r from-slate-100 via-white to-slate-50'}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isFiat ? 'bg-[#006446]/12 text-[#006446]' : 'bg-slate-100 text-slate-700'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isFiat ? 'text-[#006446]' : 'text-slate-700'}`}>{title}</p>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isFiat ? 'border-[#006446]/12 text-[#006446]' : 'border-slate-200 text-slate-700'}`}>
              {rows.length} rows
            </span>
          </div>
        </div>

        <div className={`divide-y ${isFiat ? 'divide-[#006446]/10' : 'divide-slate-200/80'}`}>
          {rows.map((row, rowIndex) => renderBalanceRow(row, rows, rowIndex))}
        </div>
      </section>
    );
  }

  function renderTaxesAdminView() {
    const summary = summarizeTaxAmounts(taxRows);
    const currency = normalizeTaxCurrency(
      (tableData[TAX_SUMMARY_CARDS_TABLE_NAME] || [])[0]?.currency || DEFAULT_TAX_CURRENCY
    );
    const cards: Array<{
      status: TaxStatus;
      title: string;
      description: string;
      icon: LucideIcon;
    }> = [
      {
        status: 'pending',
        title: 'Pending taxes',
        description: 'Amount that still needs to be paid.',
        icon: AlertCircle,
      },
      {
        status: 'on_hold',
        title: 'On hold',
        description: 'Amount paused or waiting for review.',
        icon: Layers3,
      },
      {
        status: 'paid',
        title: 'Paid',
        description: 'Amount already paid for this customer.',
        icon: Check,
      },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-3">
        {cards.map(({ status, title, description, icon }) => (
          <TaxAdminAmountCard
            key={status}
            status={status}
            title={title}
            description={description}
            amount={summary.totals[status]}
            currency={currency}
            icon={icon}
            editing={editingRecordId === getTaxSummaryEditId(status)}
            saving={savingRecordId === getTaxSummaryEditId(status)}
            onEdit={() => handleStartEditRecord(getTaxSummaryEditId(status))}
            onSave={(amount, nextCurrency) => handleTaxSummaryAmountSave(status, amount, nextCurrency)}
            onCancel={() => setEditingRecordId(null)}
          />
        ))}
      </div>
    );
  }

  const brandingPanel = (
    <BrandingSettingsCard
      form={brandingForm}
      savedBranding={branding}
      syncLogos={syncBrandLogos}
      loading={loadingBranding}
      remoteAvailable={remoteAvailable}
      saving={savingBranding}
      uploadingLogo={uploadingBrandLogo}
      onFieldChange={handleBrandingFieldChange}
      onSyncLogosChange={handleSyncBrandLogosChange}
      onUploadLogo={handleBrandingLogoUpload}
      onUploadFavicon={handleBrandingFaviconUpload}
      onSave={handleBrandingSave}
      onReset={handleBrandingReset}
      onRefresh={refreshBranding}
    />
  );

  const customerDirectory = (
    <section className="overflow-hidden rounded-[32px] border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
      <div className="border-b border-[#006446]/10 px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">{directoryEyebrow}</p>
            <h1 className="mt-2 text-3xl font-serif font-bold text-slate-950">{directoryTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              {directoryDescription}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {canCreateUsers && (
              <button
                type="button"
                onClick={() => {
                  setNotice(null);
                  setCreateUserError('');
                  setCreateUserDialogOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36]"
              >
                <Plus className="h-4 w-4" />
                Create new user
              </button>
            )}
            <button
              type="button"
              onClick={() => void loadProfiles()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
            >
              <RefreshCw className={`h-4 w-4 ${loadingProfiles ? 'animate-spin' : ''}`} />
              Refresh users
            </button>
          </div>
        </div>

        <div className="relative mt-5 max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006446]" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setDirectoryPage(1);
            }}
            placeholder="Search by name, email, or ID"
            className="w-full rounded-2xl border border-[#006446]/14 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-[#006446]/35 focus:ring-2 focus:ring-[#006446]/15"
          />
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#006446]">Filter users</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter directory by CRM role">
            {DIRECTORY_ROLE_FILTERS.map((filter) => {
              const active = directoryRoleFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setDirectoryRoleFilter(filter.value);
                    setDirectoryPage(1);
                  }}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-[#006446] bg-[#006446] text-white'
                      : 'border-[#006446]/14 bg-white text-slate-700 hover:bg-[#006446]/[0.05] hover:text-[#006446]'
                  }`}
                >
                  {filter.label}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-white/18 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {directoryRoleCounts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#f7fbf8] p-5 sm:p-6">
        {loadingProfiles ? (
          <div className="flex items-center justify-center rounded-[28px] border border-[#006446]/14 bg-white px-6 py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#006446]" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#006446]/16 bg-white px-6 py-20 text-center">
            <p className="text-lg font-semibold text-slate-900">No users match these filters</p>
            <p className="mt-2 text-sm text-slate-500">Try another role or change the name, email, or ID search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedProfiles.map((profile) => {
              const copiedEmail = copiedCredentialKey === `${profile.id}:email`;
              const copiedPassword = copiedCredentialKey === `${profile.id}:password`;
              const managerProfile = profile.assigned_manager_id ? profileMap.get(profile.assigned_manager_id) : null;
              const agentProfile = profile.assigned_agent_id ? profileMap.get(profile.assigned_agent_id) : null;
              const assignmentCopy =
                profile.crm_role === 'admin'
                  ? 'Full platform access.'
                  : profile.crm_role === 'superior_manager'
                  ? 'Visible only to admins.'
                  : profile.crm_role === 'agent'
                  ? `Reports to ${profile.assigned_manager_id ? getProfileDisplayName(managerProfile) : 'an unassigned superior manager'}.`
                  : profile.assigned_agent_id
                  ? `Assigned to agent ${getProfileDisplayName(agentProfile)}.`
                  : profile.assigned_manager_id
                  ? `Directly assigned to ${getProfileDisplayName(managerProfile)}.`
                  : 'Not assigned yet.';

              return (
                <article
                  key={profile.id}
                  className="rounded-[28px] border border-[#006446]/12 bg-white p-5 shadow-[0_18px_45px_-40px_rgba(0,100,70,0.45)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-serif font-bold text-slate-950">{profile.full_name || 'Unnamed profile'}</p>
                      <p className="mt-2 text-sm text-slate-500">{assignmentCopy}</p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Email</p>
                              <p className="mt-1 break-all text-sm text-slate-700">{profile.email || 'No email stored'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void handleCopyCredential(profile.id, 'email', profile.email)}
                              disabled={!profile.email}
                              title={copiedEmail ? 'Copied email' : 'Copy email'}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#006446]/12 bg-white text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#006446]/10 bg-[#006446]/[0.03] px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">Password</p>
                              <p className="mt-1 break-all font-mono text-sm text-slate-700">{profile.plain_password || 'No password stored'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void handleCopyCredential(profile.id, 'password', profile.plain_password)}
                              disabled={!profile.plain_password}
                              title={copiedPassword ? 'Copied password' : 'Copy password'}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#006446]/12 bg-white text-[#006446] transition-colors hover:bg-[#006446]/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:max-w-[260px] lg:justify-end">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${profile.kyc_status === 'approved' ? 'bg-[#006446] text-white' : 'bg-[#006446]/10 text-[#006446]'}`}>
                        {profile.kyc_status}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${getCrmRoleClasses(profile.crm_role)}`}>
                        {getCrmRoleLabel(profile.crm_role)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(profile.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36]"
                      >
                        <PencilLine className="h-4 w-4" />
                        Open profile
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="flex flex-col gap-4 rounded-[24px] border border-[#006446]/12 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Showing {firstVisibleDirectoryUser}–{lastVisibleDirectoryUser} of {filteredProfiles.length} users
                </p>
                <p className="mt-1 text-xs text-slate-500">Only the users on this page are rendered.</p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs font-medium text-slate-500">Users per page</span>
                  {DIRECTORY_PAGE_SIZES.map((pageSize) => (
                    <button
                      key={pageSize}
                      type="button"
                      onClick={() => {
                        setDirectoryPageSize(pageSize);
                        setDirectoryPage(1);
                      }}
                      aria-pressed={directoryPageSize === pageSize}
                      className={`h-9 min-w-9 rounded-full border px-3 text-xs font-semibold transition-colors ${
                        directoryPageSize === pageSize
                          ? 'border-[#006446] bg-[#006446] text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[#006446]/25 hover:text-[#006446]'
                      }`}
                    >
                      {pageSize}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectoryPage((current) => Math.max(1, current - 1))}
                    disabled={safeDirectoryPage <= 1}
                    aria-label="Previous directory page"
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-[#006446]/25 hover:text-[#006446] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="min-w-[96px] text-center text-sm font-semibold text-slate-700">
                    Page {safeDirectoryPage} of {directoryPageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDirectoryPage((current) => Math.min(directoryPageCount, current + 1))}
                    disabled={safeDirectoryPage >= directoryPageCount}
                    aria-label="Next directory page"
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-[#006446]/25 hover:text-[#006446] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[28px] border border-[#006446]/14 bg-white px-5 py-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">CRM Admin</p>
          <h1 className="mt-2 text-2xl font-serif font-bold text-slate-950">{workspaceLabel}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Signed in as {user?.email || 'current user'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${getCrmRoleClasses(viewerRole)}`}>
            {getCrmRoleLabel(viewerRole)}
          </span>
          <button
            type="button"
            onClick={() => void handleCrmSignOut()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </section>

      {notice && (
        <div className={`flex items-start gap-3 border px-4 py-3 text-sm ${statusClasses(notice.kind)}`}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice.message}</span>
        </div>
      )}

      {createUserDialogOpen && canCreateUsers && user && (
        <CreateUserDialog
          profiles={profiles}
          viewerId={user.id}
          viewerRole={viewerRole}
          creating={creatingUser}
          error={createUserError}
          onCancel={() => {
            setCreateUserError('');
            setCreateUserDialogOpen(false);
          }}
          onCreate={handleCreateUser}
        />
      )}

      {deleteUserDialogOpen && selectedProfile && (
        <DeleteUserDialog
          profile={selectedProfile}
          deleting={deletingUser}
          onCancel={() => setDeleteUserDialogOpen(false)}
          onConfirm={handleDeleteUser}
        />
      )}

      {selectedProfile ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[28px] border border-[#006446]/14 bg-white px-5 py-5 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">CRM Details</p>
              <h1 className="mt-2 text-2xl font-serif font-bold text-slate-950">{selectedProfile.full_name || 'Unnamed profile'}</h1>
              <p className="mt-2 text-sm text-slate-500">Full profile controls and table management for the selected CRM record.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {isViewerAdmin && selectedProfile.id !== user?.id && (
                <button
                  type="button"
                  onClick={() => setDeleteUserDialogOpen(true)}
                  disabled={deletingUser}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete user
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedUserId('')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Back to search
              </button>

              <button
                type="button"
                onClick={() => void loadProfiles()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
              >
                <RefreshCw className={`h-4 w-4 ${loadingProfiles ? 'animate-spin' : ''}`} />
                Refresh users
              </button>
            </div>
          </div>

          <>
              <ProfileSummaryCard
                profile={selectedProfile}
                saving={savingProfile}
                viewerRole={viewerRole}
                viewerId={user?.id ?? null}
                profiles={profiles}
                onSave={handleProfileSave}
              />

              <div className="border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                <div className="flex flex-col gap-3 border-b border-[#006446]/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Table Manager</p>
                    <h2 className="mt-1 text-xl font-serif font-bold text-slate-950">Simple update view</h2>
                    <p className="mt-1 text-sm text-slate-500">Browse every table, then create, edit, or delete rows for the selected customer.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => selectedUserId && void loadAllTableData(selectedUserId)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingTables ? 'animate-spin' : ''}`} />
                    Refresh all tables
                  </button>
                </div>

                <div className="px-5 py-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Active Table</span>
                    <div
                      role="tablist"
                      aria-label="Active table"
                      className="flex flex-wrap gap-2 rounded-2xl border border-[#006446]/12 bg-[#006446]/[0.03] p-2"
                    >
                      {activeTables.map((table) => {
                        const isActiveTable = table.name === activeConfig.name;
                        const rowCount = getTableRowCount(table.name, tableData);

                        return (
                          <button
                            key={table.name}
                            type="button"
                            role="tab"
                            aria-selected={isActiveTable}
                            onClick={() => setActiveTable(table.name)}
                            className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${isActiveTable
                                ? 'bg-[#006446] text-white shadow-[0_14px_30px_-20px_rgba(0,100,70,0.65)]'
                                : 'bg-white text-slate-700 hover:bg-[#006446]/[0.06] hover:text-[#006446]'
                              }`}
                          >
                            <span className="block font-semibold">{table.label}</span>
                            <span className={`mt-1 block text-xs ${isActiveTable ? 'text-white/80' : 'text-slate-500'}`}>
                              {table.scope === 'global' ? 'Global table' : table.name === 'taxes' ? '3 cards' : `${rowCount} rows`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="hidden"><Dropdown
                      value={activeTable}
                      options={activeTables.map((table) => ({
                        value: table.name,
                        label: `${table.label}${table.scope === 'global' ? ' · Global' : ` · ${getTableRowCount(table.name, tableData)} rows`}`,
                      }))}
                      onChange={setActiveTable}
                    /></div>
                  </div>

                </div>
              </div>

              <div key={activeConfig.name} className="space-y-4">
                <div
                  className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                  style={isExchangeControlView ? { display: 'none' } : undefined}
                  aria-hidden={isExchangeControlView}
                >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">{isExchangeControlView ? '' : activeConfig.scope === 'global' ? 'Global Table' : 'Selected User Table'}</p>
                      <h2 className="mt-1 text-2xl font-serif font-bold text-slate-950">{isExchangeControlView ? '' : activeConfig.label}</h2>
                      {!isExchangeControlView && activeConfig.description && (
                        <p className="mt-1 text-sm text-slate-500">{activeConfig.description}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {!isTaxesView && (
                        <button
                          type="button"
                          onClick={handleStartCreateRecord}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004d36]"
                        >
                          <Plus className="h-4 w-4" />
                          {isActivityView ? 'Add activity' : isBalancesView ? 'Add balance' : isWalletsView ? 'Add wallet' : isTransactionsView ? 'Add transaction' : isTransfersView ? 'Add transfer' : 'Add record'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void refreshSingleTable(activeConfig)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#006446]/12 px-4 py-2 text-sm font-medium text-[#006446] transition-colors hover:bg-[#006446]/[0.05]"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingTable === activeConfig.name ? 'animate-spin' : ''}`} />
                        {isActivityView ? 'Refresh activity' : isBalancesView ? 'Refresh balances' : isTaxesView ? 'Refresh taxes' : isWalletsView ? 'Refresh wallets' : isTransactionsView ? 'Refresh transactions' : isTransfersView ? 'Refresh transfers' : `Refresh ${activeConfig.label}`}
                      </button>
                    </div>
                  </div>

                {activeTableError && (
                  <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {activeTableError}
                  </div>
                )}

                {!isExchangeControlView && isAddingRecord && !isTaxesView && (
                  isActivityView ? (
                    activityCreatePanel ? null : (
                      <ActivityCreateCard
                        source={newActivitySource}
                        fields={newRecordFields}
                        saving={savingNewRecord}
                        onSourceChange={setActivityCreateSource}
                        onFieldChange={handleNewRecordFieldChange}
                        onAddField={handleAddNewRecordField}
                        onRemoveField={handleRemoveNewRecordField}
                        onReset={() => resetNewActivityDraft(newActivitySource)}
                        onCreate={handleCreateRecord}
                        onCancel={handleCancelCreateRecord}
                      />
                    )
                  ) : isBalancesView ? (
                    <BalanceCreateCard
                      draft={newBalanceDraft}
                      statusNote={balanceCreateStatusNote}
                      saving={savingNewRecord}
                      onChange={(patch) => setNewBalanceDraft((prev) => ({ ...prev, ...patch }))}
                      onCreate={handleCreateRecord}
                      onCancel={handleCancelCreateRecord}
                    />
                  ) : isWalletsView ? (
                    <WalletCreateCard
                      source={newWalletSource}
                      fields={newRecordFields}
                      saving={savingNewRecord}
                      onSourceChange={(source) => {
                        setNewWalletSource(source);
                        const sourceConfig = getDataTableConfig(source);
                        if (!sourceConfig) return;
                        setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, (tableData[source] || [])[0]));
                      }}
                      onFieldChange={handleNewRecordFieldChange}
                      onAddField={handleAddNewRecordField}
                      onRemoveField={handleRemoveNewRecordField}
                      onReset={() => resetNewWalletDraft(newWalletSource)}
                      onCreate={handleCreateRecord}
                      onCancel={handleCancelCreateRecord}
                    />
                  ) : isTransfersView || isTransactionsView ? null : (
                    <CreateRecordCard
                      table={activeConfig}
                      fields={newRecordFields}
                      saving={savingNewRecord}
                      onFieldChange={handleNewRecordFieldChange}
                      onAddField={handleAddNewRecordField}
                      onRemoveField={handleRemoveNewRecordField}
                      onReset={resetNewRecordDraft}
                      onCreate={handleCreateRecord}
                      onCancel={handleCancelCreateRecord}
                    />
                  )
                )}

                {isExchangeControlView ? (
                  <div className="space-y-6">
                    {loadingTables ? (
                      <div className="flex items-center justify-center border border-[#006446]/14 bg-white px-6 py-20 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                        <Loader2 className="h-7 w-7 animate-spin text-[#006446]" />
                      </div>
                    ) : exchangeHistoryRows.length === 0 ? (
                      <div className="border border-[#006446]/14 bg-white px-6 py-16 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                        <p className="text-lg font-semibold text-slate-900">No exchange history yet</p>
                        <p className="mt-2 text-sm text-slate-500">Fiat exchanges and crypto swaps for this customer will appear here after they are executed.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Exchange History</p>
                          <h3 className="mt-1 text-2xl font-serif font-bold text-slate-950">Fiat exchanges and crypto swaps</h3>
                          <p className="mt-1 text-sm text-slate-500">Review the records created by the exchange controls, then open any row to edit the full details.</p>
                        </div>

                        {exchangeHistoryRows.map((row) => (
                          editingRecordId === row.id ? (
                            <RecordFormCard
                              key={row.id}
                              row={row}
                              tableLabel="Exchange History"
                              tableConfig={getDataTableConfig(row.__source_table) || activeConfig}
                              saving={savingRecordId === row.__source_id}
                              deleting={deletingRecordId === row.__source_id}
                              onSave={(editedRow) => handleExchangeHistorySave(row, editedRow)}
                              onDelete={() => handleExchangeHistoryDelete(row)}
                              onCancel={() => setEditingRecordId(null)}
                            />
                          ) : (
                            <RecordHistoryBar
                              key={row.id}
                              row={row}
                              tableLabel="Exchange History"
                              tableConfig={getDataTableConfig(row.__source_table) || activeConfig}
                              deleting={deletingRecordId === row.__source_id}
                              onEdit={() => handleStartEditRecord(row.id)}
                              onDelete={() => handleExchangeHistoryDelete(row)}
                            />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ) : loadingTables ? (
                  <div className="flex items-center justify-center border border-[#006446]/14 bg-white px-6 py-20 shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                    <Loader2 className="h-7 w-7 animate-spin text-[#006446]" />
                  </div>
                ) : activeRows.length === 0 && !isActivityView && !isTransactionsView && !isTransfersView && !isTaxesView && !isBalancesView ? (
                  <div className="border border-[#006446]/14 bg-white px-6 py-16 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                    <p className="text-lg font-semibold text-slate-900">No rows found in {activeConfig.label}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {isActivityView
                        ? 'This customer does not have any transactions or transfers yet.'
                        : isBalancesView
                        ? 'This customer does not have any fiat or crypto balances yet.'
                        : isTaxesView
                        ? 'This customer does not have any tax records yet.'
                        : isWalletsView
                        ? 'This customer does not have any crypto or tax wallets yet.'
                        : isTransfersView
                        ? 'This customer does not have any bank or crypto transfers yet.'
                        : isTransactionsView
                        ? 'This customer does not have any banking or crypto transactions yet.'
                        : activeConfig.scope === 'global'
                        ? 'This global table is empty right now.'
                        : 'The selected user has no records in this table yet.'}
                    </p>
                    {!isAddingRecord && (
                      <button
                        type="button"
                        onClick={handleStartCreateRecord}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36]"
                      >
                        <Plus className="h-4 w-4" />
                        {isActivityView ? 'Add first activity' : isBalancesView ? 'Add first balance' : isTaxesView ? 'Add first tax' : isWalletsView ? 'Add first wallet' : isTransactionsView ? 'Add first transaction' : isTransfersView ? 'Add first transfer' : 'Add first record'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isActivityView ? (
                      <div className="grid gap-6 xl:grid-cols-2">
                        <section className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#006446]/12 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                          <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.12] via-[#006446]/[0.04] to-white px-5 py-5 sm:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006446]/12 text-[#006446] shadow-inner shadow-[#006446]/10">
                                  <Wallet className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#006446]">Activity card</p>
                                  <h3 className="mt-2 text-2xl font-serif font-bold text-slate-950">Transactions</h3>
                                  <p className="mt-2 text-sm text-slate-500">Banking and crypto transaction records only.</p>
                                </div>
                              </div>
                              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:flex-col lg:items-end">
                                <button
                                  type="button"
                                  onClick={() => handleStartActivityPanelCreate('transactions')}
                                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#006446] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] sm:w-auto"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add transaction
                                </button>
                                <span className="inline-flex w-fit items-center self-start rounded-full border border-[#006446]/12 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446] lg:self-auto">
                                  {activityTransactionRows.length} rows
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-4 bg-[#f7fbf8] p-3 sm:p-4">
                            {isAddingRecord && activityCreatePanel === 'transactions' && (
                              <TransactionCreateCard
                                source={activityTransactionCreateSource}
                                fields={newRecordFields}
                                saving={savingNewRecord}
                                onSourceChange={setActivityCreateSource}
                                onFieldChange={handleNewRecordFieldChange}
                                onAddField={handleAddNewRecordField}
                                onRemoveField={handleRemoveNewRecordField}
                                onReset={() => resetNewActivityDraft(activityTransactionCreateSource)}
                                onCreate={handleCreateRecord}
                                onCancel={handleCancelCreateRecord}
                              />
                            )}
                            {activityTransactionRows.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-[#006446]/16 bg-white px-5 py-10 text-center sm:px-6 sm:py-12">
                                <p className="text-sm font-semibold text-slate-900">No transactions yet</p>
                                <p className="mt-2 text-sm text-slate-500">Banking and crypto transactions for this customer will appear here.</p>
                              </div>
                            ) : (
                              activityTransactionRows.map((row) => renderActivityRow(row, 'Transactions', 'transactions'))
                            )}
                          </div>
                        </section>

                        <section className="flex h-full flex-col overflow-hidden rounded-[28px] border border-amber-200/80 bg-white shadow-[0_24px_60px_-48px_rgba(180,83,9,0.3)]">
                          <div className="border-b border-amber-200/80 bg-gradient-to-r from-amber-100/80 via-amber-50/40 to-white px-5 py-5 sm:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner shadow-amber-200/60">
                                  <RefreshCw className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">Activity card</p>
                                  <h3 className="mt-2 text-2xl font-serif font-bold text-slate-950">Transfers</h3>
                                  <p className="mt-2 text-sm text-slate-500">Bank and crypto transfer records only.</p>
                                </div>
                              </div>
                              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:flex-col lg:items-end">
                                <button
                                  type="button"
                                  onClick={() => handleStartActivityPanelCreate('transfers')}
                                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 sm:w-auto"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add transfer
                                </button>
                                <span className="inline-flex w-fit items-center self-start rounded-full border border-amber-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 lg:self-auto">
                                  {activityTransferRows.length} rows
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-4 bg-amber-50/40 p-3 sm:p-4">
                            {isAddingRecord && activityCreatePanel === 'transfers' && (
                              <TransferCreateCard
                                source={activityTransferCreateSource}
                                fields={newRecordFields}
                                saving={savingNewRecord}
                                onSourceChange={setActivityCreateSource}
                                onFieldChange={handleNewRecordFieldChange}
                                onAddField={handleAddNewRecordField}
                                onRemoveField={handleRemoveNewRecordField}
                                onReset={() => resetNewActivityDraft(activityTransferCreateSource)}
                                onCreate={handleCreateRecord}
                                onCancel={handleCancelCreateRecord}
                              />
                            )}
                            {activityTransferRows.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-amber-200 bg-white px-5 py-10 text-center sm:px-6 sm:py-12">
                                <p className="text-sm font-semibold text-slate-900">No transfers yet</p>
                                <p className="mt-2 text-sm text-slate-500">Bank and crypto transfers for this customer will appear here.</p>
                              </div>
                            ) : (
                              activityTransferRows.map((row) => renderActivityRow(row, 'Transfers', 'transfers'))
                            )}
                          </div>
                        </section>
                      </div>
                    ) : isWalletsView ? (
                      walletRows.map((row) => (
                        editingRecordId === row.id ? (
                          <RecordFormCard
                            key={row.id}
                            row={row}
                            tableLabel={activeConfig.label}
                            tableConfig={getDataTableConfig(row.__source_table) || activeConfig}
                            saving={savingRecordId === row.__source_id}
                            deleting={deletingRecordId === row.__source_id}
                            onSave={(editedRow) => handleWalletSave(row, editedRow)}
                            onDelete={() => handleWalletDelete(row)}
                            onCancel={() => setEditingRecordId(null)}
                          />
                        ) : (
                          <RecordHistoryBar
                            key={row.id}
                            row={row}
                            tableLabel={activeConfig.label}
                            tableConfig={getDataTableConfig(row.__source_table) || activeConfig}
                            deleting={deletingRecordId === row.__source_id}
                            onEdit={() => handleStartEditRecord(row.id)}
                            onDelete={() => handleWalletDelete(row)}
                          />
                        )
                      ))
                    ) : isTransfersView ? (
                      <section className="flex h-full flex-col overflow-hidden rounded-[28px] border border-amber-200/80 bg-white shadow-[0_24px_60px_-48px_rgba(180,83,9,0.3)]">
                        <div className="border-b border-amber-200/80 bg-gradient-to-r from-amber-100/80 via-amber-50/40 to-white px-5 py-5 sm:px-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner shadow-amber-200/60">
                                <RefreshCw className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">Activity card</p>
                                <h3 className="mt-2 text-2xl font-serif font-bold text-slate-950">Transfers</h3>
                                <p className="mt-2 text-sm text-slate-500">Bank and crypto transfer records only.</p>
                              </div>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:flex-col lg:items-end">
                              <button
                                type="button"
                                onClick={handleStartCreateRecord}
                                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 sm:w-auto"
                              >
                                <Plus className="h-4 w-4" />
                                Add transfer
                              </button>
                              <span className="inline-flex w-fit items-center self-start rounded-full border border-amber-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 lg:self-auto">
                                {transferRows.length} rows
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4 bg-amber-50/40 p-3 sm:p-4">
                          {isAddingRecord && (
                            <TransferCreateCard
                              source={newTransferSource}
                              fields={newRecordFields}
                              saving={savingNewRecord}
                              onSourceChange={(source) => {
                                setNewTransferSource(source);
                                const sourceConfig = getDataTableConfig(source);
                                if (!sourceConfig) return;
                                setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, (tableData[source] || [])[0]));
                              }}
                              onFieldChange={handleNewRecordFieldChange}
                              onAddField={handleAddNewRecordField}
                              onRemoveField={handleRemoveNewRecordField}
                              onReset={() => resetNewTransferDraft(newTransferSource)}
                              onCreate={handleCreateRecord}
                              onCancel={handleCancelCreateRecord}
                            />
                          )}
                          {transferRows.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-amber-200 bg-white px-5 py-10 text-center sm:px-6 sm:py-12">
                              <p className="text-sm font-semibold text-slate-900">No transfers yet</p>
                              <p className="mt-2 text-sm text-slate-500">Bank and crypto transfers for this customer will appear here.</p>
                            </div>
                          ) : (
                            transferRows.map((row) => renderActivityRow(row, 'Transfers', 'transfers'))
                          )}
                        </div>
                      </section>
                    ) : isTransactionsView ? (
                      <section className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#006446]/12 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                        <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.12] via-[#006446]/[0.04] to-white px-5 py-5 sm:px-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006446]/12 text-[#006446] shadow-inner shadow-[#006446]/10">
                                <Wallet className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#006446]">Activity card</p>
                                <h3 className="mt-2 text-2xl font-serif font-bold text-slate-950">Transactions</h3>
                                <p className="mt-2 text-sm text-slate-500">Banking and crypto transaction records only.</p>
                              </div>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:flex-col lg:items-end">
                              <button
                                type="button"
                                onClick={handleStartCreateRecord}
                                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#006446] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004d36] sm:w-auto"
                              >
                                <Plus className="h-4 w-4" />
                                Add transaction
                              </button>
                              <span className="inline-flex w-fit items-center self-start rounded-full border border-[#006446]/12 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446] lg:self-auto">
                                {transactionRows.length} rows
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4 bg-[#f7fbf8] p-3 sm:p-4">
                          {isAddingRecord && (
                            <TransactionCreateCard
                              source={newTransactionSource}
                              fields={newRecordFields}
                              saving={savingNewRecord}
                              onSourceChange={(source) => {
                                setNewTransactionSource(source);
                                const sourceConfig = getDataTableConfig(source);
                                if (!sourceConfig) return;
                                setNewRecordFields(toDraftFields(sourceConfig, selectedUserId, (tableData[source] || [])[0]));
                              }}
                              onFieldChange={handleNewRecordFieldChange}
                              onAddField={handleAddNewRecordField}
                              onRemoveField={handleRemoveNewRecordField}
                              onReset={() => resetNewTransactionDraft(newTransactionSource)}
                              onCreate={handleCreateRecord}
                              onCancel={handleCancelCreateRecord}
                            />
                          )}
                          <div className="grid gap-6 xl:grid-cols-2">
                            <section className="overflow-hidden rounded-[24px] border border-[#006446]/12 bg-white shadow-[0_18px_45px_-40px_rgba(0,100,70,0.35)]">
                              <div className="border-b border-[#006446]/10 bg-gradient-to-r from-[#006446]/[0.1] via-[#006446]/[0.04] to-white px-5 py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#006446]/12 text-[#006446]">
                                      <Landmark className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#006446]">Banking transactions</p>
                                      <p className="mt-1 text-sm text-slate-500">Cash movements, card activity, and account-side records.</p>
                                    </div>
                                  </div>
                                  <span className="inline-flex items-center rounded-full border border-[#006446]/12 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006446]">
                                    {bankingTransactionRows.length} rows
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-4 bg-[#f7fbf8] p-4">
                                {bankingTransactionRows.length === 0 ? (
                                  <div className="rounded-2xl border border-dashed border-[#006446]/16 bg-white px-5 py-10 text-center">
                                    <p className="text-sm font-semibold text-slate-900">No banking transactions yet</p>
                                    <p className="mt-2 text-sm text-slate-500">Regular account transactions for this customer will appear here.</p>
                                  </div>
                                ) : (
                                  bankingTransactionRows.map((row) =>
                                    renderActivityRow(row, 'Banking Transactions', 'transactions', { hidePrimaryId: true })
                                  )
                                )}
                              </div>
                            </section>

                            <section className="overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_18px_45px_-40px_rgba(15,23,42,0.28)]">
                              <div className="border-b border-slate-200/90 bg-gradient-to-r from-slate-100 via-white to-slate-50 px-5 py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                      <Database className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">Crypto transactions</p>
                                      <p className="mt-1 text-sm text-slate-500">Buy, sell, receive, send, and swap records only.</p>
                                    </div>
                                  </div>
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                                    {cryptoTransactionRows.length} rows
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-4 bg-slate-50/70 p-4">
                                {cryptoTransactionRows.length === 0 ? (
                                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
                                    <p className="text-sm font-semibold text-slate-900">No crypto transactions yet</p>
                                    <p className="mt-2 text-sm text-slate-500">Crypto trade and wallet transaction records for this customer will appear here.</p>
                                  </div>
                                ) : (
                                  cryptoTransactionRows.map((row) =>
                                    renderActivityRow(row, 'Crypto Transactions', 'crypto', { hidePrimaryId: true })
                                  )
                                )}
                              </div>
                            </section>
                          </div>
                        </div>
                      </section>
                    ) : isBalancesView ? (
                      <div className="space-y-6">
                        <BalanceStatusControlCard
                          value={balanceStatusDraft}
                          currentStatus={customerBalanceStatus}
                          rowCount={balanceRows.length}
                          saving={savingBalanceStatus}
                          onChange={setBalanceStatusDraft}
                          onApply={handleApplyBalanceStatus}
                        />
                        {fiatBalanceRows.length > 0 && renderBalanceSection({
                          title: 'Fiat balances',
                          description: 'Cleaner overview of cash balances grouped by currency.',
                          rows: fiatBalanceRows,
                          kind: 'fiat',
                          icon: Landmark,
                        })}
                        {cryptoBalanceRows.length > 0 && renderBalanceSection({
                          title: 'Crypto balances',
                          description: 'Simpler view of token balances and current holdings.',
                          rows: cryptoBalanceRows,
                          kind: 'crypto',
                          icon: Database,
                        })}
                        {balanceRows.length === 0 ? (
                          <div className="border border-dashed border-[#006446]/16 bg-white px-6 py-16 text-center shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
                            <p className="text-lg font-semibold text-slate-900">No balances yet for this customer</p>
                            <p className="mt-2 text-sm text-slate-500">Use the customer-wide status above, then add the first fiat or crypto balance.</p>
                            {!isAddingRecord ? (
                              <button
                                type="button"
                                onClick={handleStartCreateRecord}
                                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#006446] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004d36]"
                              >
                                <Plus className="h-4 w-4" />
                                Add first balance
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : isTaxesView ? (
                      renderTaxesAdminView()
                    ) : (
                      activeRows.map((row) => (
                        editingRecordId === row.id ? (
                          <RecordFormCard
                            key={row.id}
                            row={row}
                            tableLabel={activeConfig.label}
                            tableConfig={activeConfig}
                            saving={savingRecordId === row.id}
                            deleting={deletingRecordId === row.id}
                            onSave={(editedRow) => handleRecordSave(activeConfig.name, row, editedRow)}
                            onDelete={() => handleRecordDelete(activeConfig.name, row.id)}
                            onCancel={() => setEditingRecordId(null)}
                          />
                        ) : (
                          <RecordHistoryBar
                            key={row.id}
                            row={row}
                            tableLabel={activeConfig.label}
                            tableConfig={activeConfig}
                            saving={savingRecordId === row.id}
                            deleting={deletingRecordId === row.id}
                            hidePrimaryId={activeConfig.name === 'cards'}
                            onApprove={activeConfig.name === 'cards' && String(row.status ?? '') === 'pending_approval'
                              ? () => handleCardApprove(row)
                              : undefined}
                            approveLabel="Approve card"
                            onEdit={() => handleStartEditRecord(row.id)}
                            onDelete={() => handleRecordDelete(activeConfig.name, row.id)}
                          />
                        )
                      ))
                    )}
                  </div>
                )}
              </div>
          </>
        </section>
      ) : (
        <>
          {isViewerAdmin && <IpWhitelistCard />}
          {isViewerAdmin && brandingPanel}
          {customerDirectory}
        </>
      )}
    </div>
  );
}
