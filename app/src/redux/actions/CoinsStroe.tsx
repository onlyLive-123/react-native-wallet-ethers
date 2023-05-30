import {_setCoinKey, _setCoins} from "./Constant";
import {Coin} from "../../types";

export const setCoinKey = (value: any) => {
  return {
    type: _setCoinKey,
    //{}
    payload: value
  }
}

export const setCoins = (value: Record<string, Coin[]>) => {
  return {
    type: _setCoins,
    //Coin[]
    payload: value
  }
}
