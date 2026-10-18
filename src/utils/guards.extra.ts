import { isRecord } from './guards';

export function hasFromState(x: unknown): x is { from: string } {
  return isRecord(x) && typeof x.from === 'string';
}

export function hasJustPlaced(x: unknown): x is { justPlaced: boolean } {
  return isRecord(x) && x.justPlaced === true;
}
