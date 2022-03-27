import type TronWeb from "tronweb";

export function getTronWeb(): TronWeb | null {
  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    return window.tronWeb;
  }

  return null;
}