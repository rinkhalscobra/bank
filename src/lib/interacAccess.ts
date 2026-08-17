export const INTERAC_CUSTOMER_ID = 'ba326e30-bd5d-4472-a5dc-18cf152bc1ae';

export function canUseInteracTransfer(userId: string | null | undefined) {
  return userId === INTERAC_CUSTOMER_ID;
}
