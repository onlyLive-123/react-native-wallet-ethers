import {Coin, Network} from "./index";

export const NETWORK: Network = {
  name: "EVM",
  rpcUrl: "http://127.0.0.1:7545",
  chainId: 1337
}
// export const NETWORK: Network = {
//   name: "Polygon",
//   rpcUrl: "http://xx.xx.xx.xx:7545",
//   chainId: 777777
// }

export const COIN_LIST: Coin[] = [
  {
    name: "Hh-Polygon",
    unit: "ZLC",
    balance: "0",
    cnyBalance: "0.00",
    logo: require("../assets/ZLC.jpg")
  },
  {
    name: "MzlcCoin",
    unit: "MZLC",
    balance: "0",
    cnyBalance: "0.00",
    logo: require("../assets/MZLC.jpg"),
    address: "0x83FEF8B8058698eA48e1Ea75305ce9Ae4BAaD68a"
  },
  {
    name: "EzlcCoin",
    unit: "EZLC",
    balance: "0",
    cnyBalance: "0.00",
    logo: require("../assets/EZLC.jpg"),
    address: "0xA67A1097b1Ad8DdD8F64e1f8f79B75C05ac37720"
  },
  {
    name: "QzlcCoin",
    unit: "QZLC",
    balance: "0",
    cnyBalance: "0.00",
    logo: require("../assets/QZLC.jpg"),
    address: "0x20ECd94cC88B1665ef37883FA29a3EB192FdC904"
  },
]

export const ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function transfer(address _to, uint256 _value) public returns (bool success)",
  "function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)"
]

export const ACCOUNT_SCHEME = ["#2d32b4", "#6c47c8", "#4ef666", "#f6f04e", "#651fe6", "#f64e66"]

export const _contractPrivateKey = "";

//事件key
export const HomeRefresh = "HomeRefresh";
export const SendTxSuccess = "SendTxSuccess";
export const CoinsData = "CoinsData";
export const ItemsData = "ItemsData";
//缓存key
export const _mnemonic = "_mnemonic";
export const _mnemonicWord = "_mnemonicWord";
export const _password = "_password";
export const _wallet = "_wallet";
export const _walletIndex = "_walletIndex";
export const _network = "_network";
export const _nativeId = "_nativeId";
