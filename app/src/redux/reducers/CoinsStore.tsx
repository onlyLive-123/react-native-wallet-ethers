import {Coin} from "../../types";
import {_setCoinKey, _setCoins} from "../actions/Constant";

const CoinsInit: Record<string, Coin[]> = {};

export default (state = CoinsInit, action: { type: any, payload: any }) => {
  let type = action.type;
  if (![_setCoins, _setCoinKey].includes(type)) return state;
  if (type == _setCoins) {
    state = action.payload;
  } else if (type == _setCoinKey) {
    const payload: any = action.payload;
    let key: string = payload.key;
    let coins = state[payload.walletAddress];
    for (let i = 0; i < coins.length; i++) {
      let coin: any = coins[i];
      if (coin.unit == payload.unit) {
        coin[key] = payload.value;
        break;
      }
    }
  }
  return {...state};
}




