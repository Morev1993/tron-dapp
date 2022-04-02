<script lang="ts">

import { defineComponent } from 'vue';
import {getTronWeb} from '../services/tronLink';

import {abi, bytecode} from '@/abi/Token.json';



async function deployContract(): Promise<any> {
  const tronWeb = getTronWeb();

  if (tronWeb) {
    const transaction = await tronWeb.transactionBuilder.createSmartContract({
      abi,
      bytecode,
      // feeLimit: 1000000,
      // userFeePercentage: 1,
      // originEnergyLimit: 10000000,
      // parameters: ['Igor token', 'MYTOKEN']
    });

    const signedTransaction = await tronWeb.trx.sign(transaction);

    return await tronWeb.trx.sendRawTransaction(signedTransaction); 
  }

  return null;
}

export default defineComponent({
  data() {
    return {
      // account: 'TX6MF6VavKBxVEQpB5vrJJZYF34WcwjKuJ',
      account: '',
      balance: '',
      network: '',
      tokenAddress: '',
      tokenBalance: ''

    }
  },

  methods: {
    async operateContract() {
      const tronWeb = getTronWeb();

      try { 
        const contractInstance = await tronWeb
          .contract(abi, this.tokenAddress);

        console.log(contractInstance);

        const balance = await contractInstance.totalSupply().call();

        console.log(balance);

      } catch(e) {
        console.log(e);
      }
      
    },
    async onSubmit() { 
      const tronWeb = getTronWeb();

      if (tronWeb) {
        // const account = await tronWeb.trx.getAccount(tronWeb.defaultAddress.base58);
  
        try {
          const account = await tronWeb.trx.getAccount(tronWeb.defaultAddress.base58);

          console.log(account);

          this.account = account.address;
          this.balance = account.balance;
          


          const contractInstance = await deployContract();

          if (contractInstance) {
            console.log(contractInstance);
            this.tokenAddress = contractInstance.transaction.contract_address
          }
        } catch(e) {
          console.log(e);
        }
        

      }


    }
  },

  // `mounted` is a lifecycle hook which we will explain later
  mounted() {
    // `this` refers to the component instance.
    // data can be mutated as well
  
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit">
    <label class="block mb-3">
      <span class="text-gray-700">Address</span>
      <input type="text" class="mt-1 block w-full" placeholder="">
    </label>
    <label class="block mb-3">
      <span class="text-gray-700">Amount</span>
      <input type="text" class="mt-1 block w-full" placeholder="">
    </label>
    <div>
      <button v-if="tokenAddress" type="button" class="bg-indigo-300 text-white text-sm leading-6 font-medium py-2 px-3 rounded-lg" @click="operateContract">Get contract</button>

      <button v-if="!tokenAddress" type="submit" class="bg-indigo-600 text-white text-sm leading-6 font-medium py-2 px-3 rounded-lg">Deploy</button>
    </div>
  </form>

  <div class="view">
    <p>TRON account: {{account}}</p>
    <p>Balance: {{balance}}</p>
    <p>Network: {{network}}</p>
    <p><b>Token</b></p>
    <p>Token Balance: {{tokenBalance}}</p>
    <p>Token Address: {{tokenAddress}}</p>


  </div>

</template>