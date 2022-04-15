import { getTronLink } from "./tronLink";
import {abi, bytecode} from '@/abi/MyToken.json';


export async function deployContract(name: string, symbol: string, decimals: number): Promise<any> {
  const tronLink = window.tronLink;

  if (tronLink) {
    const transaction = await tronLink.tronWeb.transactionBuilder.createSmartContract({
      abi,
      bytecode,
      feeLimit: 1e9,
      userFeePercentage: 10,
      originEnergyLimit: 10,
      parameters: [name, symbol, +decimals]
    });

    const signedTransaction = await tronLink.tronWeb.trx.sign(transaction);

    return await await tronLink.tronWeb.trx.sendRawTransaction(signedTransaction); 
  }

  return null;
}


export async function getTransaction(transactionId: string): Promise<any> {
  const tronLink = await getTronLink();

  if (!tronLink) {
    return null;
  }

  return await tronLink.tronWeb.trx.getTransaction(transactionId);
  
}

export function getTransactionDelayed(transactionId: string, delay = 300): Promise<any> {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      getTransaction(transactionId).then((res) => {
        resolve(res);
      }, (err) => {
        reject(err);
      })
      
    }, delay);
  });

  return promise;
}

export async function getContract(tokenAddress: string): Promise<any> {
  const tronLink = await getTronLink();

  if (!tronLink) {
    return null;
  }

  return await tronLink.tronWeb.contract(abi, tokenAddress);
}

export async function mint(tokenAddress: string, address: string, amount: number): Promise<any> {
  const contractInstance = await getContract(tokenAddress);
  console.log('contractInstance', contractInstance);

  return await contractInstance.mint(address, amount).send({
    callValue: 1,
    shouldPollResponse: false
  });
}