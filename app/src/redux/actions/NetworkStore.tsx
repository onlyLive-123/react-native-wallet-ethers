import {Network} from "../../types";
import {_setNetwork} from "./Constant";

export const setNetwork = (value: Network) => {
  return {
    type: _setNetwork,
    payload: value
  }
}

