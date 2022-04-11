import type TronWeb from "tronweb";

export function getTronWeb(): {[key: string]: any} | null {
  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    return window.tronWeb;
  }

  return null;
}