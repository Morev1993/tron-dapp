import type TronWeb from "tronweb";

export interface TronLinkParams {
  ready: boolean; // Initialize to false, true after user authorization
  request: (args: any) => {}; // The method of tuning plugins for dapp website
  // tronWeb: TronWeb;
  tronWeb: {[key: string]: any};
}