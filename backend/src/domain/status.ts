import { HttpError } from '../errors.js';
export type ReceiptStatus = 'processing' | 'needs_review' | 'confirmed' | 'failed' | 'discarded';
const transitions: Record<ReceiptStatus, ReceiptStatus[]> = {
  processing: ['needs_review', 'failed', 'discarded'],
  needs_review: ['confirmed', 'discarded'], confirmed: ['discarded'],
  failed: ['processing', 'needs_review', 'discarded'], discarded: [],
};
export function assertTransition(from: string, to: ReceiptStatus) {
  if (!(from in transitions) || !transitions[from as ReceiptStatus].includes(to)) throw new HttpError(409, 'INVALID_STATE', 'This receipt cannot perform that action in its current state.');
}
