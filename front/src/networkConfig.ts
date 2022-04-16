export const networkConfig: {
  [key: string]: {
    name: string;
    explorer: {
      tx: string;
      address: string;
    };
  }
} = {
  'https://api.trongrid.io': {
    name: 'Mainnet',
    explorer: {
      tx: 'https://tronscan.org/#/transaction',
      address: 'https://tronscan.org/#/address'
    },
  },
  'https://api.shasta.trongrid.io': {
    name: 'Shasta',
    explorer: {
      tx: 'https://shasta.tronscan.org/#/transaction',
      address: 'https://shasta.tronscan.org/#/address'
    },
  },
  'https://api.nileex.io': {
    name: 'Nile',
    explorer: {
      tx: 'https://nile.tronscan.org/#/transaction',
      address: 'https://nile.tronscan.org/#/address'
    },
  },
}