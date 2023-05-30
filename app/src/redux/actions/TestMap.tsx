import {_setTest} from "./Constant";

export const setTestKey = (key: string, value: any) => {
  return {
    type: _setTest,
    payload: value
  }
}

