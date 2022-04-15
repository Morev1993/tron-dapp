export const networkConfig: {
  [key: string]: {
    name: string;
    explorer: string;
  }
} = {
  'https://api.trongrid.io': {
    name: 'Mainnet',
    explorer: 'https://tronscan.org',
  },
  'https://api.shasta.trongrid.io': {
    name: 'Shasta',
    explorer: 'https://shasta.tronscan.org'
  },
  'https://api.nileex.io': {
    name: 'Nile',
    explorer: 'https://nile.tronscan.org'
  },
}