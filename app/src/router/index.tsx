import {createStackNavigator} from '@react-navigation/stack';
import RouterPages from './RouterPages';
import React from "react";
import {DeviceEventEmitter} from "react-native";
import {_wallet, COIN_LIST, HomeRefresh} from "../types/constant";
import {isEmpty} from "../utils/Utils";
import {Coin, Network, Wallet} from "../types";
import {getStorage, getStorageToArr} from "../utils/Storage";
import {_balance} from "../redux/actions/Constant";
import {connect} from "react-redux";
import {setWallets} from "../redux/actions/WalletsStore";
import {setNetwork} from "../redux/actions/NetworkStore";
import {setCoinKey, setCoins} from "../redux/actions/CoinsStroe";

const Stack = createStackNavigator();


const mapStateToProps = (state: any) => {
  return {
    wallets: state.WalletsStore,
    network: state.NetworkStore,
    coins: state.CoinsStore,
  };
};

const AppIndex = (
  {
    navigation,
    wallets,
    setWallets,
    setNetwork,
    network,
    coins,
    setCoinKey,
    setCoins,
  }: {
    navigation: any;
    wallets: Wallet[];
    setWallets: any;
    setNetwork: any;
    network: Network;
    coins: Record<string, Coin[]>;
    setCoinKey: any;
    setCoins: any;
  }
) => {

  const [timeTask, setTimeTask] = React.useState<any>();

  React.useEffect(() => {
    //初始化
    homeInIt();
    //添加一个监听事件 如果再子页面修改了某些值 可以用来回调父页面
    DeviceEventEmitter.addListener(HomeRefresh, async data => {
      console.log('home收到全局刷新事件', data);
      setTimeout(() => {
        homeInIt();
      }, 1000)
    });
  }, []);

  React.useEffect(() => {
    //币种还没有值的情况 说明还没初始化完 或者是初始化也会走这里
    if (isEmpty(coins)) return;
    //开一个定时更新余额的定时
    const task: any = setInterval(() => {
      homeTask();
    }, 5000);
    setTimeTask(task);
    return () => clearInterval(task);
  }, [coins]);

  const homeTask = async () => {
    if (isEmpty(coins)) return;
    await homeInIt();
  }

  const homeInIt = async () => {
    try {
      //获取钱包账户缓存
      let walletCaches: Wallet[] = await getStorageToArr(_wallet);
      console.log('wallet home init', walletCaches.length, new Date().getTime());
      if (!walletCaches || !walletCaches.length) {
        clearInterval(timeTask);
        setCoins({});
        setWallets([]);
        return;
      }
      //先初始化账户
      setWallets(walletCaches);
    } catch (err) {
      console.log('home init err', err);
    }
  };

  React.useEffect(() => {
    if (isEmpty(wallets)) return;
    coinInit();
  }, [wallets]);

  const coinInit = async () => {
    if (wallets.length == 0) return;
    let coins: Record<string, Coin[]> = {};
    //获取账户的余额
    for (let i = 0; i < wallets.length; i++) {
      let walletTemp = wallets[i];
      let address = walletTemp.address.toString();
      let coinList = JSON.parse(JSON.stringify(COIN_LIST));
      // 获取当前账户下的资产
      for (let j = 0; j < coinList.length; j++) {
        let coinTemp: any = coinList[j];
        if (isEmpty(coinTemp.address)) {
          coinTemp.balance = await getStorage(
            _balance + '_' + walletTemp.address,
          );
          //获取缓存中的默认值
          // coinTemp.walletAddress = walletTemp.address;
          //异步查余额
        } else {
          // 代币 只读取数据 不用钱包签名
          try {
            coinTemp.balance = await getStorage(
              _balance + '_' + coinTemp.unit + '_' + walletTemp.address,
            );
          } catch (e) {
            console.log('e', '代币不存在!');
          }
        }
      }
      coins[address] = coinList;
    }
    setCoins(coins);
  };

  return (
    <Stack.Navigator>
      {RouterPages.map((item, index) => (
        <Stack.Screen
          key={item.name}
          name={item.name}
          component={item.component}
          options={{
            title: item.title,
            headerShown: item.headerShown
          }}
        />
      ))}
      {/*/!*tab导航*!/*/}
      {/*<Stack.Screen name={"Home"} component={MainTab}*/}
      {/*              options={{*/}
      {/*                  title: "首页",*/}
      {/*                  headerShown: false*/}
      {/*              }}*/}
      {/*/>*/}

      {/*/!*其他导航*!/*/}
      {/*<Stack.Screen name="Create" component={CreateIndex}*/}
      {/*              options={{*/}
      {/*                  title: "钱包"*/}
      {/*              }}*/}
      {/*/>*/}
      {/*<Stack.Screen name="Contract" component={ContractIndex}*/}
      {/*              options={{*/}
      {/*                  title: "合约"*/}
      {/*              }}*/}
      {/*/>*/}
    </Stack.Navigator>
  );
}

export default connect(mapStateToProps, {
  setWallets,
  setNetwork,
  setCoinKey,
  setCoins,
})(AppIndex);
