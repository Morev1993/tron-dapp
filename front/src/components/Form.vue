<script lang="ts">

import { defineComponent } from 'vue';

import {getTronWeb} from '../services/tronLink';

import {abi, bytecode} from '@/abi/MyToken.json';

async function deployContract(name: string, symbol: string, decimals: number): Promise<any> {
  const tronWeb = getTronWeb();

  console.log(arguments);

  if (tronWeb) {
    const transaction = await tronWeb.transactionBuilder.createSmartContract({
      abi,
      bytecode,
      feeLimit: 1e9,
      userFeePercentage: 10,
      originEnergyLimit: 10,
      parameters: [name, symbol, +decimals]
    });

    const signedTransaction = await tronWeb.trx.sign(transaction);

    return await tronWeb.trx.sendRawTransaction(signedTransaction); 
  }

  return null;
}

export default defineComponent({
  data() {
    return {
      form: {
        name: null,
        decimals: null,
        symbol: null,
        amount: null,
        address: null
      },
      // account: 'TX6MF6VavKBxVEQpB5vrJJZYF34WcwjKuJ',
      account: null,
      balance: null,
      network: null,
      // tokenAddress: '414a69bdfe2df5e2df2811b616eb9cf174b18880d4',
      tokenAddress: null,
      tokenBalance: null,
      transactionId: null,

    }
  },

  methods: {
    async getTransaction(transactionId: string): Promise<any> {
      const tronWeb = getTronWeb();

      return await tronWeb.trx.getTransaction(transactionId);
      
    },
    async getContract(tokenAddress: string): Promise<any> {
      const tronWeb = getTronWeb();

      return await tronWeb.contract(abi, tokenAddress);
    },
    async onSubmit() { 
      
      // this.$toast.open('You did it!');
      const tronWeb = getTronWeb();

      if (!tronWeb) {
        console.error('no tronlink');
        return;
      }

      try {
          const {name, symbol, decimals, amount, address} = this.form;
          const account = await tronWeb.trx.getAccount(tronWeb.defaultAddress.base58);

          this.account = account.address;
          this.balance = account.balance;

          if (!name || !symbol || !decimals) {
            return;
          }

          const res = await deployContract(name as any, symbol as any, decimals as any);

          if (!res) {
            console.error('deploy transaction failed');
            return;
          }

          

          setTimeout(async () => {
            console.log(res);

            const transaction = await this.getTransaction(res.txid);

            if (!transaction) {
              console.error('get transaction failed');
              return;
            }

            this.tokenAddress = transaction.contract_address;

            const contractInstance = await this.getContract(this.tokenAddress);

            if (!contractInstance) {
              console.error('get contact failed');
              return;
            }

            const balanceData = await contractInstance.balanceOf(this.account).call();
            const symbolData = await contractInstance.symbol().call()

            this.tokenBalance = `${tronWeb.BigNumber(balanceData._hex).toNumber()} ${symbolData}`;

            this.$toast.success('Everything is good');

          }, 700);

        } catch(e) {
          console.log(e);
          this.$toast.error(e);
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
      <span class="text-gray-700">Name of token</span>
      <input type="text" class="mt-1 block w-full" placeholder="" v-model="form.name" required>
    </label>
    <label class="block mb-3">
      <span class="text-gray-700">Decimals</span>
      <input type="text" class="mt-1 block w-full" placeholder="" v-model="form.decimals" required>
    </label>
    <label class="block mb-3">
      <span class="text-gray-700">Symbol</span>
      <input type="text" class="mt-1 block w-full" placeholder="" v-model="form.symbol" required>
    </label>
    <label class="block mb-3">
      <span class="text-gray-700">Amount</span>
      <input type="text" class="mt-1 block w-full" placeholder="" v-model="form.amount">
    </label>
    <label class="block mb-3">
      <span class="text-gray-700">Address</span>
      <input type="text" class="mt-1 block w-full" placeholder="" v-model="form.address">
    </label>
    <div>
      <button v-if="tokenAddress" type="button" class="bg-indigo-300 text-white text-sm leading-6 font-medium py-2 px-3 rounded-lg">Mint tokens</button>
      <button v-if="!tokenAddress" type="submit" class="bg-indigo-600 text-white text-sm leading-6 font-medium py-2 px-3 rounded-lg">Deploy</button>
    </div>
  </form>

  <div class="view" v-if="account">
    <p>TRON account: {{account}}</p>
    <p>Balance: {{balance}}</p>
    <p>Network: {{network}}</p>
    <div v-if="tokenAddress">
      <p><b>Token</b></p>
      <p>Token Balance: {{tokenBalance}}</p>
      <p>Token Address: {{tokenAddress}}</p>
    </div>
  </div>

</template>