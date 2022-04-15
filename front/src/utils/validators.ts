export function validTrx20(address: string): boolean {
  return /^T[A-Za-z1-9]{33}$/.test(address);
}