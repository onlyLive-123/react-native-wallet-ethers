import {
  ActionSheetIOS,
  Alert,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from '@rneui/themed';
import {Coin, Network, Wallet} from '../../types';
import React from 'react';
import Swiper from 'react-native-swiper';
import {getStorage,} from '../../utils/Storage';
import {_mnemonic, ACCOUNT_SCHEME, COIN_LIST,} from '../../types/constant';
import {isEmpty, toFixed} from '../../utils/Utils';
import {connect} from 'react-redux';
import {CurrencyCoins, Money} from '../../components/CurrencyCoins';
import {setWallets} from '../../redux/actions/WalletsStore';
import {setNetwork} from '../../redux/actions/NetworkStore';
import {setCoinKey, setCoins} from '../../redux/actions/CoinsStroe';
import {Button} from '@rneui/base';
import NativeUtils from '../../utils/NativeUtils';
import HeaderLeft from '../../components/HeaderLeft';

const {WalletBridge} = NativeModules;

const mapStateToProps = (state: any) => {
  return {
    wallets: state.WalletsStore,
    network: state.NetworkStore,
    coins: state.CoinsStore,
  };
};

const AccountSwiper = ({
                         swiperArr,
                         navigation,
                         coins,
                       }: {
  swiperArr: Wallet[][];
  navigation: any;
  coins: Record<string, Coin[]>;
}) => {
  const showActionSheet = () => {
    if (Platform.OS == 'android') {
      navigation.navigate('Create');
      return;
    }
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['创建钱包', '根据助记词导入', '根据私钥导入', '取消'],
        // destructiveButtonIndex: 3,
        cancelButtonIndex: 3,
      },
      buttonIndex => {
        if (buttonIndex == 0) {
          navigation.navigate('Create');
        } else if (buttonIndex == 1) {
          navigation.navigate('CreateByPhrases');
        } else if (buttonIndex == 2) {
          navigation.navigate('CreateByKey');
        }
      },
    );
  };
  const getUnitBalance = (walletTwo: Wallet) => {
    if (isEmpty(coins) || isEmpty(coins[walletTwo.address])) return '0.0';
    return toFixed(coins[walletTwo.address][0].balance);
  };

  return (
    <Swiper loop={false} style={{height: 240}}>
      {swiperArr.map((walletOne: Wallet[], index: number) => (
        <View key={'one' + index}>
          {walletOne.map((walletTwo: Wallet, indexTow: number) =>
            walletTwo.name ? (
              <TouchableOpacity
                key={index + '-' + indexTow}
                style={[
                  styles.account_container,
                  {
                    backgroundColor:
                      ACCOUNT_SCHEME[
                      (index * 2 + indexTow) % ACCOUNT_SCHEME.length
                        ],
                  },
                ]}
                onPress={() =>
                  navigation.navigate('WalletInfo', {
                    index: index * 2 + indexTow,
                    address: walletTwo.address,
                  })
                }>
                <View style={{marginVertical: 12, marginHorizontal: 8}}>
                  <View style={styles.account_address}>
                    <Text style={[styles.account_text]}>{walletTwo.name}</Text>
                    <Text style={[styles.account_text]}>
                      {walletTwo.address.substring(0, 5)}...
                      {walletTwo.address.substring(37)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.account_text, {fontSize: 26, margin: 4}]}>
                    {getUnitBalance(walletTwo)} ZLC
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={'none' + index}
                style={styles.add_account_box}
                onPress={() => showActionSheet()}>
                <Icon
                  name="add-circle-outline"
                  type="ionicon"
                  size={20}
                  color="#3DADDF"
                />
                <Text style={styles.add_account_text}>添加账户</Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      ))}
    </Swiper>
  );
};

const HomeIndex = ({
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
}) => {
  // //native事件监听器
  React.useEffect(() => {
    if (WalletBridge == null) {
      navigation.setOptions({
        headerLeft: () => <Text/>,
      });
      return
    }
    //修改返回按钮事件
    navigation.setOptions({
      headerLeft: () => <HeaderLeft nav={navigation}/>,
    });
  }, []);

  const [mnemonic, setMnemonic] = React.useState('');
  const [swiperArr, setSwiperArr] = React.useState<Wallet[][]>([[]]);
  const [timeTask, setTimeTask] = React.useState<any>();

  React.useEffect(() => {
    //初始化
    initMnemonic();
  }, [wallets]);

  const initMnemonic = async () => {
    //初始化助记词
    let mnemonicCache: string = await getStorage(_mnemonic);
    if (mnemonicCache) {
      setMnemonic(mnemonicCache);
    } else {
      setMnemonic('');
    }
  };

  React.useEffect(() => {
    // [[wallet1,wallet2],[...]]
    const swiperArr: Wallet[][] = [];
    let swiperTwo: Wallet[] = [];
    for (let i = 0; i < wallets.length; i++) {
      swiperTwo.push(wallets[i]);
      if (i > 0 && (i + 1) % 2 == 0) {
        swiperArr.push(swiperTwo);
        swiperTwo = [];
      }
    }
    //swiperTwo 奇个元素时直接添加一个空的到swiperTwo 标识添加账户
    if (swiperTwo.length % 2 != 0) {
      swiperTwo.push({});
      swiperArr.push(swiperTwo);
    } else {
      //如果是偶数(空的) 则再新增一个数组添加进去
      swiperArr.push([{}]);
    }
    setSwiperArr(swiperArr);
  }, [wallets]);

  const getAllMoney = (type: number) => {
    if (isEmpty(coins)) return '0.0';
    //所有的硬币
    let all = 0;
    for (let key in coins) {
      let coinList = coins[key];
      for (let i = 0; i < coinList.length; i++) {
        let coin = coinList[i];
        if (!coin.address) {
          all += parseFloat(coinList[i].balance);
          break;
        }
      }
    }
    if (type == 2 && all > 0) {
      all = all * 1983;
    }
    return toFixed(all);
  };

  const scannerQrcode = () => {
    if (WalletBridge) {
      NativeUtils.scannerQrcode((result: string) => {
        let toAddress = result;
        let addressPass = toAddress.startsWith('0x') && toAddress.length == 42;
        if (addressPass) {
          try {
            parseInt(toAddress.substring(2), 16);
          } catch (err) {
            addressPass = false;
          }
        }
        if (!addressPass) return Alert.alert('不是合法的地址');
        navigation.navigate('SendTransaction', {to: toAddress});
      });
    } else {
      navigation.navigate("QrcodeScanner", {
        callback: (scannerCode: string) => {
          console.log(123456723456, scannerCode)
          let toAddress = scannerCode;
          let addressPass = toAddress.startsWith("0x") && toAddress.length == 42;
          if (addressPass) {
            try {
              parseInt(toAddress.substring(2), 16)
            } catch (err) {
              addressPass = false;
            }
          }
          if (!addressPass) return Alert.alert("不是合法的地址");
          navigation.navigate("SendTransaction", {to: toAddress})
        }
      })
    }

  };

  const goMnemonic = () => {
    navigation.navigate('ConfirmPassword', {
      callback: () => navigation.navigate('Mnemonic'),
    });
  };

  return (
    <View style={styles.container}>
      {/*底部弹窗*/}
      <ScrollView style={styles.scrollview_box}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginBottom: 8,
          }}>
          {isEmpty(wallets) ? (
            <Text/>
          ) : (
            <TouchableOpacity onPress={scannerQrcode}>
              <Icon
                name="scan-outline"
                type="ionicon"
                size={24}
                color="#3DADDF"
                style={{marginRight: 15}}
              />
            </TouchableOpacity>
          )}
          {isEmpty(mnemonic) ? (
            <Text/>
          ) : (
            <TouchableOpacity onPress={goMnemonic}>
              <Icon
                name="newspaper-outline"
                type="ionicon"
                size={24}
                color="#3DADDF"
                style={{marginRight: 15}}
              />
            </TouchableOpacity>
          )}
        </View>

        <Money money={getAllMoney(1)} desc="ZLC" appearance={{size: 'big'}}/>
        {/*<Text style={styles.worth_desc}>总价值 {getAllMoney(2)} USD</Text>*/}
        {/*账户导航*/}
        <AccountSwiper
          swiperArr={swiperArr}
          navigation={navigation}
          coins={coins}
        />

        <View style={styles.currency_list}>
          {!isEmpty(coins) && !isEmpty(wallets)
            ? coins[wallets[0].address].map((item, index) => (
              <CurrencyCoins coin={item} key={index}/>
            ))
            : COIN_LIST.map((item, index) => (
              <CurrencyCoins coin={item} key={index}/>
            ))}
        </View>
      </ScrollView>

      <TouchableHighlight onPress={() => {
      }}>
        <View style={styles.send_box}>
          <Button
            radius={50}
            color={'#3DADDF'}
            type="solid"
            onPress={() => {
              if (wallets.length == 0)
                return Alert.alert('暂无钱包账户,请先添加');
              navigation.navigate('SendTransaction');
            }}>
            <Icon
              name="send-outline"
              size={30}
              type="ionicon"
              color="white"
              style={styles.send_icon}
            />
          </Button>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default connect(mapStateToProps, {
  setWallets,
  setNetwork,
  setCoinKey,
  setCoins,
})(HomeIndex);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollview_box: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  worth_desc: {
    marginTop: 3,
    marginBottom: 12,
    fontSize: 14,
    color: '#999',
  },
  add_account_box: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  add_account_text: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3DADDF',
    fontWeight: '500',
  },
  currency_list: {
    marginTop: 20,
  },
  send_box: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{translateX: -25}],
  },
  send_icon: {
    transform: [{rotate: '-90deg'}],
  },
  account_container: {
    marginVertical: 8,
    borderRadius: 18,
    backgroundColor: '#2d32b4',
    height: 80,
  },
  account_address: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 4,
  },
  account_text: {
    color: 'white',
    fontSize: 18,
  },
});
