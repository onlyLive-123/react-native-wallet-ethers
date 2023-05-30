import {clearStorage, getStorage, getStorageToArr, setStorage} from './Storage';
import {_nativeId, _wallet} from '../types/constant';
import {Alert, NativeModules} from 'react-native';
import ChainUtils from "./ChainUtils";
import {isEmpty} from "./Utils";

const {WalletBridge} = NativeModules;

//app初始化/重新登录 native->react  {nativeInit:nativeId}
const initNative = async (nativeId: string) => {
  if (!nativeId) return;
  //nativeId 原生的唯一标识id 每次初始化APP调用
  const cacheId = await getStorage(_nativeId);
  if (nativeId != cacheId) {
    await clearStorage();
  }
  await setStorage(_nativeId, nativeId);
};


//创建 react->native  ("createFromMnemonic",{mnemonic/助记词})
const createWalletFrom = (data: { mnemonic: string, index: number, wordlist: string }, callback: any) => {
  // name/别名 address/地址
  if (WalletBridge) {
    WalletBridge.callNative('createFromMnemonic', data, (result: {}) => {
      callback(result);
    });
  } else {
    let result: any = {};
    try {
      result = ChainUtils.createWalletFormMnemonic(data.mnemonic, data.index, data.wordlist);
    } catch (e) {
      console.log("create err", e);
    }
    callback(result);
  }
};


//创建 react->native  ("create",{name/别名 address/地址})
const createWallet = (data: {}) => {
  // name/别名 address/地址
  if (WalletBridge) {
    WalletBridge.callNative('create', data, () => {
    });
  }
};

//发起转账/红包 native->react(发送交易页面)
//{eventType:"route",value:{name:"home/transaction",params:{name/addressList}}}
const sendTransaction = async (data: any, navigation: any) => {
  //name/名称 addressList/转账接收人地址
  const routeName = data.value.name;
  const params = data.value.params;
  //推出当前堆栈并回到第一个页面
  navigation.popToTop();
  if (routeName === 'transaction') {
    //卡权限
    const walletCache = await getStorageToArr(_wallet);
    if (isEmpty(walletCache)) {
      return Alert.alert("暂无钱包账户,请先添加", "", [
        {
          text: "稍后创建",
          onPress: async () => {
            closeReact();
          },
          style: "cancel"
        },
        {
          text: "立即添加",
          onPress: async () => {
            navigation.replace('Home');
          },
          style: "default"
        },
      ])
    }
    params.formNative = true;
    navigation.replace('SendTransaction', params);
  } else if (routeName == 'itemDetail') {
    params.formNative = true;
    navigation.replace('ItemDetail', params);
  } else {
    navigation.replace('Home')
  }
};

//直接走钱包发送界面 获取联系人列表 react->native ("contact",{},()=>{})
const getWalletContact = (callback: any) => {
  //name/名称 nativeId/用户唯一标识 addressList/转账接收人地址
  if (WalletBridge) {
    WalletBridge.callNative(
      'contact',
      {},
      (
        result: {
          name: string;
          nativeId: number;
          addressList: { name: string; address: string }[];
        }[],
      ) => callback(result),
    );
  } else {
    callback([])
  }
};

//获取交易记录 react->native ("items",{address:"0xxxx"},()=>{})
const getWalletItems = (data: {}, callback: any) => {
  //address  page/页码,从0开始
  if (WalletBridge) {
    WalletBridge.callNative('items', data, (result: any) => callback(result));
  } else {
    callback([]);
    // if (data.timestamp) return callback([]);
    // callback(
    //   [
    //     {
    //       sender: true,
    //       from: "1234567890987654321234567890876543212345",
    //       to: '0x4561234567890987654323456787654323456712',
    //       amount: '99',
    //       timestamp: 1684912343,
    //       unit: "ZLC",
    //       name: "张三",
    //       gas: "0.001",
    //       hash: "123456787654323434242332",
    //     },
    //   ]
    // )
  }
};

//发送交易完成 react->native ("transaction",{xxx})
const transactionNotice = (data: {}) => {
  //nativeId/nativeId  hash/本笔交易的唯一串 nonce/交易nonce from/发起人address to/接收人address
  //amount/交易金额 type 1/硬币转账 2/代币转账 timestamp/事件戳 unit/币种 gas/消耗的汽油费
  if (WalletBridge) {
    WalletBridge.callNative('transaction', data, () => {
    });
    console.log('发送交易通知', data);
  }
};

//关闭当前窗口 react->native ("close",{})
const closeReact = () => {
  if (!WalletBridge) return Alert.alert('暂未加载原生模块');
  WalletBridge.callNative('close', {}, () => {
  });
};

//("qrCode",{},()=>{}) 相机扫描的
const scannerQrcode = (callback: any) => {
  if (!WalletBridge) return Alert.alert('暂未加载原生模块');
  WalletBridge.callNative('qrCode', {}, (result: string) => callback(result));
};

//删除账户 react->native ("delete",{})
const deleteAccount = (address: string) => {
  if (WalletBridge) {
    WalletBridge.callNative('delete', {address: address}, () => {
    });
  }
};

const clearRoute = (navigation: any) => {
  if (navigation) {
    setTimeout(() => {
      //情况当前栈 再回到过度页面
      navigation.popToTop();
      navigation.replace('Empty');
    }, 300)
  }
}

export default {
  initNative,
  createWalletFrom,
  createWallet,
  sendTransaction,
  getWalletContact,
  getWalletItems,
  transactionNotice,
  closeReact,
  scannerQrcode,
  deleteAccount,
  clearRoute
};
