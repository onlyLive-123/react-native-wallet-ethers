import {
  ActionSheetIOS,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from '@rneui/themed';
import {Button} from '@rneui/base';
import Input from '../../components/Input';
import React from 'react';
import {Coin, Wallet} from '../../types';
import {connect} from 'react-redux';
import {fetchCopiedText, isEmpty} from '../../utils/Utils';
import HeaderLeft from '../../components/HeaderLeft';

const mapStateToProps = (state: any) => {
  return {
    wallets: state.WalletsStore,
    coins: state.CoinsStore,
  };
};

const SendTransaction = ({
                           navigation,
                           wallets,
                           route,
                           coins,
                         }: {
  navigation: any;
  wallets: Wallet[];
  route: any;
  coins: Record<string, Coin[]>;
}) => {
  const [wallet, setWallet] = React.useState<Wallet>({});
  const [coin, setCoin] = React.useState<Coin>({});
  const [amount, setAmount] = React.useState<string>('');
  const [toAddress, setToAddress] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [to, setTo] = React.useState('');
  const [revUser, setRevUser] = React.useState('');
  const [revNativeId, setRevNativeId] = React.useState<number>();
  const [revAddressList, setRevAddressList] = React.useState<{ name: string; address: string }[]>([]);

  React.useEffect(() => {
    //处理进来的参数 to/扫码  原生:name/转账人昵称 nativeId/(可选) addressList:[{name/address}]/地址列表
    let params = route.params;
    // let params: any = {
    //   name: "李四",
    //   nativeId: 10689,
    //   addressList: [
    //     {
    //       name: "account1",
    //       address: "123421234567876543234567654345654sd1212112"
    //     },
    //     {
    //       name: "account2",
    //       address: "121212122456567433565345434434343121212121"
    //     }
    //   ]
    // };
    if (!params) return;
    let isNative = params.formNative;
    //to 扫描跳转
    if (params.to) {
      setTo(params.to);
      setToAddress(params.to);
    } else {
      if (params.name) {
        setRevUser(params.name);
      }
      if (params.nativeId) {
        setRevNativeId(params.nativeId);
      }
      if (!isEmpty(params.addressList)) {
        setRevAddressList(params.addressList);
        setTo(params.addressList[0].address);
        setToAddress(params.addressList[0].address);
      }
    }
    if (isNative) {
      //修改返回按钮事件
      navigation.setOptions({
        headerLeft: () => <HeaderLeft nav={navigation}/>,
      });
    }
  }, [navigation]);

  React.useEffect(() => {
    console.log('send index useEffect');
    //初始化
    pageInit();
  }, [coins]);

  const pageInit = async () => {
    let initWallet = wallets[0];
    if (JSON.stringify(initWallet) == JSON.stringify(wallet)) return;
    let params = route.params;
    //首次进来且有form传参
    if (params && params.form && !wallet.address) {
      for (let i = 0; i < wallets.length; i++) {
        if (wallets[i].address == params.form) {
          initWallet = wallets[i];
          break;
        }
      }
    } else {
      //无参 或者 数据有变更时
      for (let i = 0; i < wallets.length; i++) {
        if (wallets[i].address == wallet.address) {
          initWallet = wallets[i];
          break;
        }
      }
    }
    //当前指定的账号
    setWallet(initWallet);
    let coinList = coins[initWallet.address];
    //指定coin
    let initCoin = coinList[0];
    for (let i = 0; i < coinList.length; i++) {
      if (coinList[i].unit == coin.unit) {
        initCoin = coinList[i];
        break;
      }
    }
    //用户不同的coins
    setCoin(initCoin);
  };

  const showCoinActionSheet = () => {
    let coinArr: any[] = [];
    let coinList = coins[wallet.address];
    coinList.forEach((coin, index) => {
      coinArr.push(coin.name + '-' + coin.unit);
    });
    coinArr.push('关闭');
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: coinArr,
        // destructiveButtonIndex: 3,
        cancelButtonIndex: coinArr.length - 1,
      },
      buttonIndex => {
        if (buttonIndex == coinArr.length - 1) return;
        setCoin(coinList[buttonIndex]);
      },
    );
  };

  const showWalletActionSheet = () => {
    let walletArr: any[] = [];
    wallets.forEach((wallet, index) => {
      walletArr.push(wallet.name);
    });
    walletArr.push('关闭');
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: walletArr,
        // destructiveButtonIndex: 3,
        cancelButtonIndex: walletArr.length - 1,
      },
      buttonIndex => {
        if (buttonIndex == walletArr.length - 1) return;
        let selWallet = wallets[buttonIndex];
        setWallet(selWallet);
        //切换账户时币种不重置
        let coinList = coins[selWallet.address];
        let coinDefault = coinList[0];
        for (let i = 0; i < coinList.length; i++) {
          if (coinList[i].unit == coin.unit) {
            coinDefault = coinList[i];
            break;
          }
        }
        setCoin(coinDefault);
      },
    );
  };

  const toNext = () => {
    setLoading(true);
    try {
      let amountTemp = parseFloat(amount);
      if (!amount || amountTemp <= 0) return Alert.alert('转账资金必须大于0!');
      if (!toAddress) return Alert.alert('转账地址必填!');
      if (amountTemp > parseFloat(coin.balance + ''))
        return Alert.alert('资金不足');
      let addressPass = toAddress.startsWith('0x') && toAddress.length == 42;
      if (addressPass) {
        try {
          parseInt(toAddress.substring(2), 16);
        } catch (err) {
          addressPass = false;
        }
      }
      if (!addressPass) return Alert.alert('输入的地址不合法');
      if (toAddress == wallet.address) return Alert.alert("不能自己转自己");
      const params = {
        name: coin.name,
        unit: coin.unit,
        amount: amount,
        formAddress: wallet.address,
        formPrivate: wallet.privateKey,
        toAddress: toAddress,
        address: coin.address,
        balance: coin.balance,
        fromNative: revAddressList.length > 0,
        nativeId: revNativeId,
      };
      navigation.navigate('ConfirmTransaction', params);
    } finally {
      setLoading(false);
    }
  };

  const paste = async () => {
    let text = await fetchCopiedText();
    if (text) setToAddress(text);
  };

  const goContactIndex = () => {
    navigation.navigate('ContactIndex', {
      callback: (data: { name: string; address: string; nativeId: number }) => {
        setRevUser(data.name);
        setRevNativeId(data.nativeId);
        setTo(data.address);
        setToAddress(data.address);
      },
    });
  };

  const selContactClick = () => {
    if (revAddressList.length == 0) {
      goContactIndex();
    } else {
      const strArr = [];
      revAddressList.forEach((item, index) => {
        strArr.push(item.name + " (" + item.address.substring(38) + ")");
      });
      strArr.push('关闭');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: strArr,
          // destructiveButtonIndex: 3,
          cancelButtonIndex: strArr.length - 1,
        },
        buttonIndex => {
          if (buttonIndex == strArr.length - 1) return;
          const list = revAddressList[buttonIndex];
          setTo(list.address);
          setToAddress(list.address);
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 资金不足alert */}
        {amount && parseFloat(amount) > parseFloat(coin.balance + '') ? (
          <View style={[styles.alert]}>
            <Text style={styles.alert_text}>资金不足</Text>
          </View>
        ) : (
          <Text/>
        )}

        {/* 输入金额 */}
        <View style={styles.amount_box}>
          <View style={styles.amount_content}>
            <TextInput
              value={amount}
              onChangeText={text => setAmount(text)}
              // 资金不足 add styles.amount_input_warning
              style={[styles.amount_input]}
              keyboardType="numeric"
              placeholder="0.0"
            />
            <TouchableOpacity
              style={styles.currency_box}
              onPress={showCoinActionSheet}>
              <Image
                style={styles.currency_logo}
                source={coin.logo ?? require('../../assets/ZLC.jpg')}
              />
              <Text style={styles.currency_name}>{coin.unit}</Text>
              <Icon
                name="chevron-down-outline"
                type="ionicon"
                size={16}
                color="#bbb"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.worth}>
            {coin.balance ?? 0} {coin.unit ?? 'ZLC'}
          </Text>
          <TouchableOpacity
            style={{width: '40%'}}
            onPress={() => setAmount(coin.balance + '')}>
            <View style={[styles.set_max_button]}>
              <Text style={styles.set_max_button_label}>设至上限</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.separate_line}/>

        {/* 选择账户 */}

        <View style={styles.account_box}>
          <Text style={styles.label}>从</Text>
          <TouchableOpacity onPress={showWalletActionSheet}>
            <View style={styles.sender_box}>
              <View style={styles.sender_avatar}>
                <Text style={styles.sender_avatar_label}>
                  {wallet.name?.substring(0, 1) ?? '主'}
                </Text>
              </View>
              <View style={styles.sender_inf}>
                <Text style={styles.sender_name}>{wallet.name}</Text>
                <Text style={styles.sender_balance}>
                  {coin.balance ?? 0} {coin.unit ?? 'ZLC'}
                </Text>
              </View>
              <Icon
                name="chevron-forward-outline"
                type="ionicon"
                size={16}
                color="#bbb"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.label}>到</Text>
          <TouchableOpacity onPress={selContactClick}>
            <View style={styles.sender_box}>
              <View
                style={[styles.sender_avatar, {backgroundColor: '#f54c52'}]}>
                <Icon
                  name="add-outline"
                  type="ionicon"
                  size={16}
                  color="#bbb"
                />
              </View>
              <View style={styles.sender_inf}>
                <Text style={styles.sender_name}>
                  {revUser || '选择联系人'}
                </Text>
              </View>
              <Icon
                name="chevron-forward-outline"
                type="ionicon"
                size={16}
                color="#bbb"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.receiver_box}>
            <View style={styles.receiver_header}>
              <Text>收款地址</Text>
              <TouchableOpacity onPress={paste}>
                {to ? '' : <Text style={styles.paste_btn}>粘贴</Text>}
              </TouchableOpacity>
            </View>
            {to ? (
              <Text>{to}</Text>
            ) : (
              <Input
                multiline
                placeholder="0x..."
                value={toAddress}
                onChangeText={text => setToAddress(text)}
              />
            )}
          </View>
        </View>

        <Button
          title="下一步"
          loading={loading}
          buttonStyle={{
            backgroundColor: '#3DADDF',
            borderRadius: 10,
          }}
          containerStyle={{
            marginTop: 40,
            width: '90%',
            alignSelf: 'center',
          }}
          onPress={toNext}
        />
      </ScrollView>
    </View>
  );
};

export default connect(mapStateToProps, {})(SendTransaction);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  alert: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 6,
    height: 23,
    paddingHorizontal: 20,
    paddingTop: 3,
    shadowColor: '#aaa', //设置阴影色
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  alert_text: {
    fontSize: 12,
    color: '#ee0000',
  },
  scrollview_box: {
    flex: 1,
  },
  amount_box: {
    padding: 12,
    paddingTop: 16,
  },
  amount_content: {
    flexDirection: 'row',
    flex: 1,
  },
  amount_input: {
    marginRight: 10,
    minWidth: 70,
    maxWidth: '40%',
    fontSize: 35,
    fontWeight: '500',
    color: '#333',
  },
  amount_input_warning: {
    color: '#ee0000',
  },
  currency_box: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency_logo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 9,
  },
  currency_name: {
    fontSize: 18,
    color: '#333',
  },

  worth: {
    marginVertical: 10,
    fontSize: 14,
    color: '#8c8c8c',
  },

  set_max_button: {
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    backgroundColor: '#1581e220',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  set_max_button_label: {
    alignSelf: 'center',
    color: '#1581e2',
    fontSize: 15,
  },
  separate_line: {
    height: 1,
    backgroundColor: '#ececec',
  },

  account_box: {
    padding: 12,
    paddingTop: 15,
  },
  sender_box: {
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sender_avatar: {
    marginRight: 13,
    borderRadius: 19,
    width: 38,
    height: 38,
    backgroundColor: '#1581e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sender_avatar_label: {
    fontWeight: 'bold',
    color: '#ddd',
    fontSize: 18,
  },
  sender_inf: {
    justifyContent: 'center',
    flex: 1,
  },
  sender_name: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sender_balance: {
    marginTop: 2,
    fontSize: 14,
    color: '#8c8c8c',
  },
  receiver_box: {
    marginTop: 12,
  },
  receiver_header: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paste_btn: {
    padding: 4,
    fontSize: 16,
    color: '#1581e2',
  },
  label: {
    color: '#8c8c8c',
    fontSize: 15,
  },
});
