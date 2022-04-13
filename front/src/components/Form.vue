<script lang="ts">

import { defineComponent } from 'vue';
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'

import { ServerIcon, GlobeAltIcon, SunIcon, StatusOnlineIcon, CreditCardIcon } from '@heroicons/vue/outline'


import {getTronWeb} from '../services/tronLink';
import {abi, bytecode} from '@/abi/MyToken.json';

import BaseInput from '@/ui/BaseInput.vue'
import Error from '@/ui/Error.vue'
import PreviewItem from '@/components/PreviewItem.vue'



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

export function validTrx20(address: string): boolean {
  return /^T[A-Za-z1-9]{33}$/.test(address);

}

export default defineComponent({
  components: { GlobeAltIcon, SunIcon, StatusOnlineIcon, ServerIcon, CreditCardIcon, BaseInput, Error, PreviewItem },
  setup () {
    return { v$: useVuelidate() }
  },
  validations() {
    return {
      form: {
        name: {
          required,
        },
        symbol: {
          required,
        },
        decimals: {
          required,
        },
        amount: {
          required,
        },
        address: {
            required, trxValidation: {
              $validator: validTrx20, 
              $message: 'Invalid address'
            }
        },
      },
    }
  },
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
      const isFormCorrect = await this.v$.$validate()
      // you can show some extra alert to the user or just leave the each field to show it's `$errors`.
      if (!isFormCorrect) return;
      // actually submit form


      // this.$toast.open('You did it!');

      try {
        const tronWeb = getTronWeb();
        const {name, symbol, decimals} = this.form;

        if (!tronWeb) {
          throw new Error('No tronlink!');
        }

        const account = await tronWeb.trx.getAccount(tronWeb.defaultAddress.base58);

        this.account = account.address;
        this.balance = tronWeb.fromSun(account.balance);

        if (!name || !symbol || !decimals) {
          return;
        }

        this.$toast.success('Proccessing...');

        const res = await deployContract(name, symbol, decimals);
        console.log('contract', res);

        this.$toast.clear();
        this.$toast.success('Keep on swinging...');

        this.transactionId = res.txid;

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
<div class="md:grid md:grid-cols-3 md:gap-x-16 md:gap-y-10 mt-5">
  <div>
    <form @submit.prevent="onDeploy">
    <div class="mb-3">
      <BaseInput label="Name of token" v-model="form.name"></BaseInput>
      <Error :message="v$.form.name?.$errors[0]?.$message"></Error>
    </div>
    <div class="mb-3">
      <BaseInput label="Decimals" v-model="form.decimals"></BaseInput>
      <Error :message="v$.form.decimals?.$errors[0]?.$message"></Error>
    </div>
    <div class="mb-3">
      <BaseInput label="Symbol" v-model="form.symbol"></BaseInput>
      <Error :message="v$.form.symbol?.$errors[0]?.$message"></Error>
    </div>
    <div class="mb-3">
      <BaseInput label="Amount" v-model="form.amount"></BaseInput>
      <Error :message="v$.form.amount?.$errors[0]?.$message"></Error>
    </div>
    <div class="mb-3">
      <BaseInput label="Address" v-model="form.address"></BaseInput>
      <Error :message="v$.form.address?.$errors[0]?.$message"></Error>
    </div>
    <div class="mt-6 flex flex justify-end">
      <button v-if="tokenAddress" type="button" class="h-10 px-6 font-semibold rounded-md bg-indigo-500 text-white" @click="onMint">Mint tokens</button>
      <button v-if="!tokenAddress" type="submit" class="h-10 px-6 font-semibold rounded-md bg-indigo-500 text-white">Deploy</button>
    </div>
  </form>
  </div>
  <div class="col-span-2">
    <div class="mb-5">
      <h1 class="dark:text-white">TRX Data</h1>
    </div>
    <PreviewItem class="mb-10" title="TRON account" :value="account" v-if="account"></PreviewItem>
    <div v-else>No data</div>
    <div class="relative mb-10" v-if="tokenAddress">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <StatusOnlineIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Token Address</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-lime-500">
        {{tokenAddress}}
      </dd>
    </div>
    <div class="relative mb-20" v-if="transactionId">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <StatusOnlineIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">TransactionId</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-lime-500">
        {{transactionId}}
      </dd>
    </div>
    <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10 mt-5" v-if="account">
    <div class="relative">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <SunIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Balance</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-lime-500">
        {{$filters.amount(balance)}} TRX
      </dd>
    </div>
    <div class="relative">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <GlobeAltIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Network</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-lime-500">
        {{network || '-'}}
      </dd>
    </div>
    <div class="relative">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <CreditCardIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Token Balance</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-lime-500">
        {{tokenBalance}}
      </dd>
    </div>
  </dl>
  </div>
</div>

</template>