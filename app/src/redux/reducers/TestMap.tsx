import {Wallet} from "../../types";

const walletInit: Wallet = {
  address: "1111"
};

export default (state = walletInit, action: { type: any, payload: any }) => {
  // console.log("1111", state);
  return state;
}




