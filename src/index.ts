import 'dotenv/config';
import * as ethers from 'ethers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CoinGecko from 'coingecko-api';
import { Logger, TLogLevelName } from 'tslog';
import { TransactionReceipt } from '@ethersproject/abstract-provider';

import { DHC_CONTRACT, SMETA_CONTRACT } from './contracts';

dayjs.extend(relativeTime);

const log = new Logger({
  displayFunctionName: false,
  displayFilePath: 'hidden',
  minLevel: (process.env.LOG_LEVEL as TLogLevelName) || 'info',
});

if (!process.env.PRIVATE_KEY) {
  log.error("Please specify your wallet's private key in the PRIVATE_KEY environment variable.");
  process.exit(1);
}

const TIMEOUT_OFFSET = Number(process.env.TIMEOUT_OFFSET) || 30; // seconds
const DEFAULT_CLAIM_INTERVAL = 28800; // seconds
const DEFAULT_RETRY_INTERVAL = 5; // seconds
const CLAIM_INTERVAL = Number(process.env.CLAIM_INTERVAL) || DEFAULT_CLAIM_INTERVAL;
const RETRY_INTERVAL = Number(process.env.RETRY_INTERVAL) || DEFAULT_RETRY_INTERVAL;

const coinGeckoClient = new CoinGecko();
const bscProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'https://bscrpc.com/');
const bscWallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', bscProvider);
const sMetaContract = new ethers.Contract(SMETA_CONTRACT.ADDRESS, SMETA_CONTRACT.ABI, bscProvider);
const dhcContract = new ethers.Contract(DHC_CONTRACT.ADDRESS, DHC_CONTRACT.ABI, bscProvider);

const waitForNextClaim = (intervalInSeconds?: number) => {
  const interval = (intervalInSeconds ?? CLAIM_INTERVAL) * 1000;
  if (interval <= 0) return claimAndStake();

  log.info(`Waiting for next claim ${dayjs(0).to(interval)}...`);
  setTimeout(claimAndStake, interval + TIMEOUT_OFFSET * 1000);
};

const claimAndStake = async (): Promise<void> => {
  log.info('Claiming...');

  const signedDhc = dhcContract.connect(bscWallet);
  const wsMetaToClaim = parseFloat(
    ethers.utils.formatUnits((await dhcContract.getReward(await bscWallet.getAddress()))[0], 18)
  );
  let txReceipt: TransactionReceipt | undefined;
  let prices: any;

  try {
    const tx = await signedDhc.claim(true);
    txReceipt = await tx.wait();
    prices = await coinGeckoClient.simple.price({ ids: ['binancecoin', 'metaversepro'], vs_currencies: ['usd'] });
    log.debug('Transaction:', tx);
    log.debug('TransactionReceipt:', txReceipt);
  } catch (e) {
    const error = e as any;
    switch (error.code) {
      case ethers.errors.UNPREDICTABLE_GAS_LIMIT:
        log.error('Could not predict gas limit. Please make sure you have enough BNB for gas. Retrying...');
        return waitForNextClaim(RETRY_INTERVAL);

      case undefined: // CoinGecko API error
        break;

      default:
        log.error('An error occurred while claiming:', error);
        log.info('Retrying to claim rewards in a few seconds due to error...');
        return waitForNextClaim(RETRY_INTERVAL);
    }
  }

  const currentIndex = parseFloat(ethers.utils.formatUnits(await sMetaContract.index(), 1));
  const gasUsed = parseFloat(ethers.utils.formatUnits(txReceipt?.gasUsed ?? 0, 8));

  log.info(
    `Claimed ${wsMetaToClaim} wsMeta ${
      prices.data ? `($${(prices.data.metaversepro.usd * currentIndex * wsMetaToClaim).toFixed(2)}) ` : ''
    }and paid ${gasUsed} BNB ${prices.data ? `($${(prices.data.binancecoin.usd * gasUsed).toFixed(2)}) ` : ''}for gas. (TX: ${
      txReceipt?.transactionHash
    })`
  );

  waitForNextClaim();
};

(async () => {
  const unlockTime = await dhcContract.getUnlockTime(await bscWallet.getAddress());
  const minLockTime = await dhcContract.minLockTime();
  waitForNextClaim(unlockTime.sub(dayjs().unix()).sub(minLockTime).add(CLAIM_INTERVAL).toNumber());
})();
