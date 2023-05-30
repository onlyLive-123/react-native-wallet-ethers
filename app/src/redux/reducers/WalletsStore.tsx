import {Wallet} from "../../types";
import {_setWallet, _setWalletsKey} from "../actions/Constant";

const walletInitState: Wallet[] = [];
// {
//   name: "",
//   mnemonic: "",
//   privateKey: "",
//   publicKey: "",
//   address: "",
//   balance: "0.00",
//   coins: COIN_LIST
// }


export default (state = walletInitState, action: { type: any, payload: any }) => {
  let type: any = action.type;
  if (![_setWallet, _setWalletsKey].includes(type)) return state;
  if (type == _setWallet) {
    state = action.payload;
  } else if (type == _setWalletsKey) {
    //{address / key / value}
    let stateTemp = state;
    const payload: any = action.payload;
    let key = payload["key"];
    for (let i = 0; i < stateTemp.length; i++) {
      let wallet: any = stateTemp[i];
      if (payload && payload.address == wallet.address) {
        wallet[key] = payload.value;
        stateTemp[i] = wallet;
        break;
      }
    }
    state = stateTemp;
  }
  return [...state];
}




