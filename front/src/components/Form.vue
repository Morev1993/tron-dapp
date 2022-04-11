<script lang="ts">

import { defineComponent } from 'vue';
import { ServerIcon, GlobeAltIcon, SunIcon, StatusOnlineIcon, CreditCardIcon } from '@heroicons/vue/outline'


import {getTronWeb} from '../services/tronLink';

import {abi, bytecode} from '@/abi/MyToken.json';

async function deployContract(name: string, symbol: string, decimals: number): Promise<any> {
  const tronWeb = getTronWeb();

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

interface Data {
  form: {
    name: string | null,
    decimals: number | null,
    symbol: string | null,
    amount: number | null,
    address: string | null
  };
  account: string | null,
  network: string | null,
  balance: number | null,
  tokenAddress: string | null,
  tokenBalance: string | null,
  transactionId: string | null

}

export default defineComponent({
  components: { GlobeAltIcon, SunIcon, StatusOnlineIcon, ServerIcon, CreditCardIcon },
  data(): Data {
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
    async getTransactionDelayed(transactionId: string, delay = 300): Promise<any> {
      const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          this.getTransaction(transactionId).then((res) => {
            resolve(res);
          }, (err) => {
            reject(err);
          })
          
        }, delay);
      });

      return promise;
    },
    async getTransaction(transactionId: string): Promise<any> {
      const tronWeb = getTronWeb();

      if (!tronWeb) {
        return null;
      }

      return await tronWeb.trx.getTransaction(transactionId);
      
    },
    async getContract(tokenAddress: string): Promise<any> {
      const tronWeb = getTronWeb();

      if (!tronWeb) {
        return null;
      }

      return await tronWeb.contract(abi, tokenAddress);
    },
    async mint(tokenAddress: string, address: string, amount: number): Promise<any> {
      const contractInstance = await this.getContract(tokenAddress);
      console.log('contractInstance', contractInstance);

      return await contractInstance.mint(address, amount).send({
        callValue: 1,
        shouldPollResponse: false
      });
    },
    async onMint() { 
      try {
        const {address, amount} = this.form;

        this.$toast.success('Proccessing...');

        if (!this.tokenAddress || !address || !amount) {
          throw new Error('No mandatory fields');
        }

        const res = await this.mint(this.tokenAddress, address, amount);

        console.log(res);

        this.$toast.clear();

        this.$toast.success('Everything is good');
      } catch (e) {
        console.log(e);
        this.$toast.error(e.error);
      }
    },
    async onDeploy() { 
      
      // this.$toast.open('You did it!');

      try {
        const tronWeb = getTronWeb();
        const {name, symbol, decimals} = this.form;

        if (!tronWeb) {
          throw new Error('No tronlink!');
        }

        const account = await tronWeb.trx.getAccount(tronWeb.defaultAddress.base58);

        this.account = account.address;
        this.balance = account.balance;

        if (!name || !symbol || !decimals) {
          return;
        }

        this.$toast.success('Proccessing...');

        const res = await deployContract(name, symbol, decimals);
        console.log('contract', res);

        this.$toast.clear();
        this.$toast.success('Keep on swinging...');

        const transaction = await this.getTransactionDelayed(res.txid, 1000);

        this.$toast.clear();

        this.tokenAddress = transaction.contract_address;

        if (!this.tokenAddress) {
          throw new Error('No contract address');
        }

        const contractInstance = await this.getContract(this.tokenAddress);
        console.log('contractInstance', contractInstance);

        const balanceData = await contractInstance.balanceOf(this.account).call();
        const symbolData = await contractInstance.symbol().call()

        this.tokenBalance = `${tronWeb.BigNumber(balanceData._hex).toNumber()} ${symbolData}`;

        this.$toast.success('Everything is good');

        } catch(e) {
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
<div class="md:grid md:grid-cols-3 md:gap-x-16 md:gap-y-10 mt-20">
  <div>
    <form @submit.prevent="onDeploy">
    <label class="block mb-3">
      <span class="text-gray-700 dark:text-white">Name of token</span>
      <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="" v-model="form.name" required>
    </label>
    <label class="block mb-3">
      <span class="text-gray-700 dark:text-white">Decimals</span>
      <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="" v-model="form.decimals" required>
    </label>
    <label class="block mb-3">
      <span class="text-gray-700 dark:text-white">Symbol</span>
      <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="" v-model="form.symbol" required>
    </label>
    <label class="block mb-3">
      <span class="text-gray-700 dark:text-white">Amount</span>
      <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="" v-model="form.amount">
    </label>
    <label class="block mb-3">
      <span class="text-gray-700dark:text-white ">Address</span>
      <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="" v-model="form.address">
    </label>
    <div class="mt-6 flex flex justify-end">
      <button v-if="tokenAddress" type="button" class="h-10 px-6 font-semibold rounded-md border border-slate-200 text-slate-900" @click="onMint">Mint tokens</button>
      <button v-if="!tokenAddress" type="submit" class="h-10 px-6 font-semibold rounded-md bg-black dark:bg-white text-white dark:text-black">Deploy</button>
    </div>
  </form>
  </div>
  <div class="col-span-2">
    <div class="mb-5">
      <h1>TRX Data</h1>
    </div>
    <div class="relative mb-10" v-if="account">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <ServerIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900">TRON account</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-gray-500">
        {{account}}
      </dd>
    </div>
    <div class="relative mb-20" v-if="tokenAddress">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <StatusOnlineIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Token Address</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-gray-500">
        {{tokenAddress}}
      </dd>
    </div>
    <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10 mt-5" v-if="account">
    <div class="relative">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <SunIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Balance</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-gray-500">
        {{$filters.amount(balance)}}
      </dd>
    </div>
    <div class="relative">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <GlobeAltIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Network</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-gray-500">
        {{network}}
      </dd>
    </div>
    <div class="relative">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <CreditCardIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Token Balance</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-gray-500">
        {{tokenBalance}}
      </dd>
    </div>
  </dl>
  </div>
</div>

</template>