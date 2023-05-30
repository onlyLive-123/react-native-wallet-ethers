import {combineReducers} from 'redux'

import WalletsStore from "./WalletsStore";
import TestMap from "./TestMap";
import CoinsStore from "./CoinsStore";
import NetworkStore from "./NetworkStore";

export default combineReducers({
  WalletsStore,
  TestMap,
  CoinsStore,
  NetworkStore,
})
