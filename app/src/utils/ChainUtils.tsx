import {ethers} from "ethers";
import {Network, Wallet} from "../types";
import {Provider} from "@ethersproject/abstract-provider";

const path = "m/44'/60'/0'/0/";

function getProvider(network: Network) {
  return new ethers.providers.JsonRpcProvider(network.rpcUrl, network);
}


function getWallet(privateKey: string, provider: Provider) {
  return new ethers.Wallet(privateKey, provider);
}

function getProviderAndWallet(network: Network, walletInfo: Wallet) {
  const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
  let wallet;
  if (walletInfo && walletInfo.privateKey) {
    wallet = new ethers.Wallet(walletInfo.privateKey, provider);
  }
  return {provider, wallet};
}


function createMnemonic(wordList) {
  return ethers.utils.entropyToMnemonic(
    ethers.utils.randomBytes(16),
    wordList
  );
}

function createWalletFormMnemonic(mnemonic: string, index: number, wordlist: string) {
  if (!mnemonic) return;
  let node = ethers.utils.HDNode.fromMnemonic(
    mnemonic, "", wordlist);
  // return ethers.Wallet.fromMnemonic(mnemonic,path + index);
  return node.derivePath(path + index);
}

function createWalletFormPrivateKey(privateKey: string) {
  return new ethers.Wallet(privateKey);
}


export default {
  getProvider,
  getWallet,
  getProviderAndWallet,
  createMnemonic,
  createWalletFormMnemonic,
  createWalletFormPrivateKey,
}
