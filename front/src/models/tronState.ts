import type { TronLinkParams } from "./tronLink";

export interface TronState {
  tronLink: TronLinkParams | null,
  isLoading: boolean,
  form: {
    name: string | null,
    decimals: number | null,
    symbol: string | null,
    amount: number | null,
    address: string | null
  };
  accountAddress: string | null,
  network: string | null,
  balance: number | null,
  tokenAddress: string | null,
  tokenBalance: number | null,
  transactionId: string | null,
  symbol: string | null
}