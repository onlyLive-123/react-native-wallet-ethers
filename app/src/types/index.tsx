export type Wallet = {
  name: string,
  mnemonic?: string,
  privateKey: string,
  publicKey: string,
  address: any,
  balance: string,
  type?: number,
}

export type Network = {
  name: string,
  rpcUrl: string,
  chainId: number
}

export type Coin = {
  name: string,
  unit: string,
  balance: string,
  cnyBalance: string,
  logo?: string,
  //如果这个不为空 则为代币合约地址
  address?: string
}

export type SendData = {
  name?: string,
  unit?: string,
  amount: number,
  formAddress: string,
  formPrivate: string,
  toAddress: string,
  //如果这个不为空 则为代币合约地址
  address?: string,
  balance?: number,
  gasLimit?: any,
  gasPrice?: any,
  //是否原生唤起 最后关闭的地址需要调用closeReact
  fromNative?: boolean
  //选择从联系人 转账发送的用户唯一标识
  nativeId?: number
}

export type Item = {
  form: string,
  to?: string,
  value: string,
  //0/硬币交易 2/合约
  type?: number | null,
  timestamp: number,
  //区块
  number: number,
  blockHash: string,
  hash: string
}


