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
  tronLink: TronLinkParams | null,
  isLoading: boolean,
  form: {
    name: string | null,
    decimals: number | null,
    symbol: string | null,
    amount: number | null,
    address: string | null
  };
  accountAddress: string | null,
  network: string | null,
  balance: number | null,
  tokenAddress: string | null,
  tokenBalance: number | null,
  transactionId: string | null,
  symbol: string | null

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
      tronLink: null,
      isLoading: false,
      form: {
        name: null,
        decimals: null,
        symbol: null,
        amount: null,
        address: null
      },
      // accountAddress: 'TX6MF6VavKBxVEQpB5vrJJZYF34WcwjKuJ',
      accountAddress: null,
      balance: null,
      network: null,
      // tokenAddress: '414a69bdfe2df5e2df2811b616eb9cf174b18880d4',
      tokenAddress: null,
      tokenBalance: null,
      transactionId: null,
      symbol: null

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

      return `${networkConfig[this.network].explorer.tx}/${this.transactionId}`;
    },

  },

  methods: {
    addressLink(address: string): string {
      if (!this.network) {
        return '';
      }

      return `${networkConfig[this.network].explorer.address}/${address}`;
    },
    async updateTokenBalance(contractInstance: any): Promise<void> {
      const decimalsData = await contractInstance.decimals().call();
      const balanceData = await contractInstance.balanceOf(this.accountAddress).call();
      const value = this.tronLink?.tronWeb.BigNumber(balanceData._hex).toNumber();

      this.tokenBalance = this.tronLink?.tronWeb.fromSun(value) / Math.pow(10, decimalsData);
    },
    async updateAccountBalance(): Promise<void> {
      const account = await this.tronLink?.tronWeb.trx.getAccount(this.accountAddress);

      this.balance = this.tronLink?.tronWeb.fromSun(account.balance);
    },
    handleEvents(contractInstance: any) {
      contractInstance['Transfer']().watch(async (err: unknown, eventResult: unknown) => {
        if (err) {
            console.error('Error with "method" event:', err);
            throw new Error('Error with "method" event');
        }
        if (eventResult) { 
          console.log('eventResult:', eventResult);
          await this.updateAccountBalance();
          await this.updateTokenBalance(contractInstance);
        }

        this.isLoading = false;
      });
    },
    async onMint() { 
      this.isLoading = true;

      try {
        const {address, amount} = this.form;

        this.$toast.success('Proccessing...');

        if (!this.tokenAddress || !address || !amount) {
          throw new Error('No mandatory fields');
        }

        const contractInstance = await getContract(this.tokenAddress);
        console.log('contractInstance', contractInstance);

        const res = await mint(this.tokenAddress, address, this.tronLink?.tronWeb.toSun(amount) );

        console.log('mint result', res);

        this.$toast.clear();

        this.$toast.success('Everything is good');
      } catch (e) {
        console.error(e);
        this.$toast.error(e);
        this.isLoading = false;
      }
    },
    async onDeploy() { 
      const isFormCorrect = await this.v$.$validate()
      if (!isFormCorrect) return;

      this.isLoading = true;

      try {
        const {name, symbol, decimals} = this.form;

        if (!this.tronLink) {
          throw new Error('No tronlink!');
        }

        if (!name || !symbol || !decimals) {
          return;
        }

        const { tronWeb } = this.tronLink;

        this.accountAddress = tronWeb.defaultAddress.base58;

        await this.updateAccountBalance();

        this.$toast.success('Proccessing...');

        const res = await deployContract(name, symbol, decimals);

        this.transactionId = res.txid;

        if (!this.transactionId) {
          throw new Error('No transaction');
        }

        const transaction = await getTransactionDelayed(this.transactionId, 1000);

        this.$toast.clear();

        this.tokenAddress = tronWeb.address.fromHex(transaction.contract_address);

        if (!this.tokenAddress) {
          throw new Error('No contract address');
        }

        const contractInstance = await getContract(this.tokenAddress);

        this.symbol = await contractInstance.symbol().call();

        console.log('contractInstance', contractInstance);

        this.handleEvents(contractInstance);

        await this.updateTokenBalance(contractInstance);

        this.$toast.success('Everything is good');

        this.isLoading = false;
        } catch(e) {
          this.$toast.error(e);
          this.isLoading = false;
        }
    }
  },
  async mounted() {
    const tronLink = await getTronLink();

    if (!tronLink) {
      return;
    }

    this.tronLink = tronLink;
    this.network = this.tronLink.tronWeb.fullNode.host;
    console.log(this.network, this.tronLink);
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
    <div class="relative mb-10" v-if="accountAddress">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <ServerIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Account</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-lime-500">
        <a :href="addressLink(accountAddress)" target="_blank">{{accountAddress}}</a>
      </dd>
    </div>
    <div v-else>No data</div>
    <div v-if="isLoading">Loading...</div>
    <div class="relative mb-10" v-if="tokenAddress">
      <dt>
        <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
          <StatusOnlineIcon class="h-6 w-6" aria-hidden="true" />
        </div>
        <p class="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Token Address</p>
      </dt>
      <dd class="mt-2 ml-16 text-base text-lime-500">
        <a :href="addressLink(tokenAddress)" target="_blank">{{tokenAddress}}</a>
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
    <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10 mt-5" v-if="accountAddress">
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
        {{tokenBalance}} {{symbol}}
      </dd>
    </div>
  </dl>
  </div>
</div>

</template>