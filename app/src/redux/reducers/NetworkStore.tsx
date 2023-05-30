import {Network} from "../../types";
import {_setNetwork} from "../actions/Constant";

const networkState: Network = {};

export default (state = networkState, action: { type: any, payload: any }) => {
  let type: any = action.type;
  if (type != _setNetwork) return state;
  if (type == _setNetwork) {
    state = action.payload;
  }
  return {
    ...state
  };
}




