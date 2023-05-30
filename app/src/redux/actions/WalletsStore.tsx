import {Wallet} from "../../types";
import {_setWallet, _setWalletsKey} from "./Constant";


export const setWallets = (value: Wallet) => {
  return {
    type: _setWallet,
    payload: value
  }
}

export const setWalletKey = (value: any) => {
  return {
    type: _setWalletsKey,
    //address / key / value
    payload: value
  }
}

