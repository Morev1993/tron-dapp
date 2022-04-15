<script lang="ts">

import { defineComponent } from 'vue';
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'

import { ServerIcon, GlobeAltIcon, SunIcon, StatusOnlineIcon, CreditCardIcon } from '@heroicons/vue/outline'


import {getTronLink} from '../services/tronLink';

import BaseInput from '@/components/BaseInput.vue'
import Error from '@/components/Error.vue'
import PreviewItem from '@/components/PreviewItem.vue'
import { deployContract, getContract, getTransactionDelayed, mint } from '@/services/contract';
import { validTrx20 } from '@/utils/validators';
import type { TronLinkParams } from '@/models/tronLink';
import { networkConfig } from '@/networkConfig';

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
  computed: {
    networkName(): string {
      return this.network ? networkConfig[this.network].name : '';
    },
    transactionLink(): string {
      if (!this.network || !this.transactionId) {
        return '';
      }

      return `${networkConfig[this.network].explorer}/#/transaction/${this.transactionId}`;
    }
  },

  methods: {
    async onMint() { 
      try {
        const {address, amount} = this.form;

        this.$toast.success('Proccessing...');

        if (!this.tokenAddress || !address || !amount) {
          throw new Error('No mandatory fields');
        }

        const res = await mint(this.tokenAddress, address, amount);

        console.log(res);

        this.$toast.clear();

        this.$toast.success('Everything is good');
      } catch (e) {
        console.log(e);
        this.$toast.error(e);
      }
    },
    async onDeploy() { 
      const isFormCorrect = await this.v$.$validate()
      if (!isFormCorrect) return;

      try {
        const {name, symbol, decimals} = this.form;
        const tronLink = await getTronLink()

        if (!tronLink) {
          throw new Error('No tronlink!');
        }

        const { tronWeb } = tronLink;

        const account = await tronWeb.trx.getAccount(tronWeb.defaultAddress.base58);

        console.log(account);

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

        const transaction = await getTransactionDelayed(res.txid, 1000);

        this.$toast.clear();

        this.tokenAddress = transaction.contract_address;

        if (!this.tokenAddress) {
          throw new Error('No contract address');
        }

        const contractInstance = await getContract(this.tokenAddress);
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
  async mounted() {
    const tronLink = await getTronLink();

    if (!tronLink) {
      return;
    }

    this.network = tronLink.tronWeb.fullNode.host;
    console.log(this.network, tronLink);
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
      <button v-if="!tokenAddress" type="submit" class="h-10 px-6 font-semibold rounded-md bg-indigo-500 text-white">Deploy on {{networkName}}</button>
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
        <a :href="transactionLink" target="_blank">{{transactionId}}</a>
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
        {{networkName || '-'}}
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
        {{tokenBalance || '-'}}
      </dd>
    </div>
  </dl>
  </div>
</div>

</template>