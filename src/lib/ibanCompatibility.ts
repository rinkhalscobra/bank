type DatabaseErrorLike = {
  code?: string | null;
  message?: string | null;
};

type DatabaseRow = Record<string, unknown>;

const IBAN_COLUMNS: Record<string, { current: string; legacy: string }> = {
  bank_transfers: { current: 'iban', legacy: 'routing_number' },
  bill_payments: { current: 'bank_iban', legacy: 'bank_routing_number' },
};

export function isMissingIbanColumnError(error: DatabaseErrorLike | null | undefined, tableName: string) {
  const columns = IBAN_COLUMNS[tableName];
  if (!columns || !error?.message) return false;

  const message = error.message.toLowerCase();
  return (
    (error.code === 'PGRST204' || message.includes('schema cache')) &&
    message.includes(columns.current.toLowerCase()) &&
    message.includes(tableName.toLowerCase())
  );
}

export function normalizeIbanRow<T extends object>(tableName: string, row: T): T {
  const columns = IBAN_COLUMNS[tableName];
  if (!columns) return row;

  const normalized: DatabaseRow = { ...(row as DatabaseRow) };
  if (normalized[columns.current] === undefined || normalized[columns.current] === null) {
    normalized[columns.current] = normalized[columns.legacy] ?? '';
  }
  delete normalized[columns.legacy];

  return normalized as T;
}

export function toLegacyIbanPayload<T extends object>(tableName: string, payload: T): T {
  const columns = IBAN_COLUMNS[tableName];
  if (!columns || !Object.prototype.hasOwnProperty.call(payload, columns.current)) return payload;

  const databasePayload = payload as DatabaseRow;
  const legacyPayload: DatabaseRow = {
    ...databasePayload,
    [columns.legacy]: databasePayload[columns.current],
  };
  delete legacyPayload[columns.current];

  return legacyPayload as T;
}
