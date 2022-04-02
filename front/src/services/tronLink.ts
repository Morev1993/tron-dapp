import type TronWeb from "tronweb";

export function getTronWeb(): any | null {
  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    return window.tronWeb;
  }

  return null;

  // return new TronWeb({
  //   fullHost: 'https://api.shasta.trongrid.io',
  //   privateKey: '9c91a66dc28abc3bce0e3ad8588c0f368841a85713639cd5364d2d5644345eac'
  //   // privateKey: process.env.PRIVATE_KEY_SHASTA
  // });
}