import '../i18n/balance-status/translations';
import { normalizeBalanceStatus } from './balanceStatus';

type Translate = (key: string) => string;
type RestrictionScope = 'overview' | 'analytics' | 'deposits' | 'exchangeFiat' | 'exchangeCrypto';
type RestrictionMessageKey = 'transfers' | 'depositActionBlocked' | 'needTwoFiat';

export function getLocalizedBalanceStatusLabel(t: Translate, value: unknown) {
  const status = normalizeBalanceStatus(value);
  return t(`balanceStatus.badge.${status}`);
}

export function getLocalizedHiddenBalanceLabel(t: Translate, value: unknown) {
  const status = normalizeBalanceStatus(value);
  return t(`balanceStatus.hidden.${status}.label`);
}

export function getLocalizedHiddenBalanceDescription(t: Translate, value: unknown) {
  const status = normalizeBalanceStatus(value);
  return t(`balanceStatus.hidden.${status}.description`);
}

export function getLocalizedBalanceCardEyebrow(t: Translate, value: unknown) {
  const status = normalizeBalanceStatus(value);
  return t(`balanceStatus.card.${status}.eyebrow`);
}

export function getLocalizedBalanceCardTitle(t: Translate, value: unknown) {
  const status = normalizeBalanceStatus(value);
  return t(`balanceStatus.card.${status}.title`);
}

export function getLocalizedRestrictedBalanceCountMessage(
  t: Translate,
  scope: RestrictionScope,
  count: number
) {
  const plurality = count === 1 ? 'one' : 'many';
  return t(`balanceStatus.restrictions.${scope}.${plurality}`).replace('{count}', String(count));
}

export function getLocalizedBalanceRestrictionMessage(t: Translate, key: RestrictionMessageKey) {
  return t(`balanceStatus.restrictions.${key}`);
}
