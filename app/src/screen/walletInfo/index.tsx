import {
  Alert,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Dialog, Icon, ListItem} from '@rneui/themed';
import React from 'react';
import {Coin, Wallet} from '../../types';
import {
  _mnemonic, _mnemonicWord, _password,
  _wallet,
  _walletIndex,
  ACCOUNT_SCHEME,
  COIN_LIST,
  CoinsData,
  HomeRefresh,
  ItemsData
} from '../../types/constant';
import {connect} from 'react-redux';
import {CurrencyCoins} from '../../components/CurrencyCoins';
import {copyToClipboard, dateFormat, isEmpty, toFixed} from "../../utils/Utils";
import QRCode from "react-native-qrcode-svg";
import {Button} from "@rneui/base";
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";
import {delStorage, getStorageToArr, setStorage} from "../../utils/Storage";
import NativeUtils from "../../utils/NativeUtils";

//https://reactnavigation.org/docs/material-top-tab-navigator/
const MTop = createMaterialTopTabNavigator();

const mapStateToProps = (state: any) => {
  return {
    wallets: state.WalletsStore,
    coins: state.CoinsStore,
  };
};

const Qrcode = ({qrcodeShow, wallet, onBackdropPress}:
                  { qrcodeShow: boolean, wallet: Wallet, onBackdropPress: () => (void) }) => {

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: wallet.address,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  let logoFromFile = require('../../assets/test_logo.webp');
  return (
    <Dialog
      overlayStyle={{
        width: parseInt(Dimensions.get("window").width * 0.8 + ""),
        justifyContent: "center"
      }}
      isVisible={qrcodeShow}
      onBackdropPress={onBackdropPress}
    >
      <View style={{alignItems: "center", flexDirection: "column", marginBottom: 5}}>
        <Dialog.Title title={wallet.name}/>
        <View style={{borderWidth: 1, borderColor: "#999", borderRadius: 10}}>
          <View style={{padding: 16}}>
            <QRCode
              size={parseInt(Dimensions.get("window").width * 0.6 + "")}
              value={wallet.address}
              logo={logoFromFile}
            />
          </View>
        </View>
      </View>
      <Text style={{color: "#999"}}>以太坊地址</Text>
      <Text style={{fontSize: 16}}>{wallet.address}</Text>
      <Button
        title="分享地址"
        buttonStyle={{
          backgroundColor: '#3DADDF',
          borderRadius: 10,
        }}
        containerStyle={{
          marginTop: 5,
          width: '100%',
        }}
        onPress={onShare}
      />
    </Dialog>
  )
}


const Items = ({navigation}: any) => {
  const [address, setAddress] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [dataList, setDataList] = React.useState<any>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [hasNext, setHasNet] = React.useState<boolean>(true);

  React.useEffect(() => {
    //添加一个监听事件 获取coins参数
    DeviceEventEmitter.addListener(ItemsData, async (data) => {
      setAddress(data);
      initItemList(data);
    })
    return () => {
      DeviceEventEmitter.removeAllListeners(ItemsData);
    }
  }, [])

  const initItemList = (currentAddress: string) => {
    if (loading || !hasNext || !currentAddress) return;
    const params = {
      address: currentAddress,
      timestamp: 0
    }
    if (dataList.length > 0) {
      params.timestamp = dataList[dataList.length - 1].timestamp
    }
    //通过native获取记录
    NativeUtils.getWalletItems(params, (result: any) => {
      setLoading(loading);
      let oldArr = result;
      if (page > 0) {
        if (result.length == 0) return setHasNet(false);
        oldArr = JSON.parse(JSON.stringify(dataList));
        oldArr = oldArr.concat(result);
      }
      // 由于组件无法传参 需要将address发送者写入
      for (let i = 0; i < oldArr.length; i++) {
        if (currentAddress == oldArr[i].from) {
          oldArr[i].sender = true;
        } else {
          oldArr[i].sender = false;
        }
      }
      setDataList(oldArr);
    })
  }

  const itemsRender = ({item}: any) => (
    <ListItem bottomDivider
      onPress={() => navigation.navigate("ItemDetail", item)}
    >
      <Icon name={"arrow-forward-circle-outline"}
            style={item.sender ? styles.burden : styles.just}
            type="ionicon" color={item.sender ? "green" : "red"} size={30}/>
      <ListItem.Content>
        <ListItem.Title style={{marginBottom: 6}}>
          <View style={{width: "100%", justifyContent: "space-between", flexDirection: "row"}}>
            <Text style={styles.itemTitle}>{
              item.sender ? "发送" : "接收"
            }</Text>
            <Text style={styles.itemTitle}>
              {item.sender ? "-" : ""}{item.amount} {item.unit}
            </Text>
          </View>
        </ListItem.Title>
        <ListItem.Subtitle>
          <View>
            <View style={{flexDirection: "row"}}>
              <Text style={{fontSize: 14, width: "33%"}}>
                {dateFormat(new Date(item.timestamp * 1000), "MM/dd hh:mm")}
              </Text>
              <Text style={{fontSize: 14, width: "33%", textAlign: "center"}}>
                {item.sender ? "转给" : "来自"}
              </Text>
              <Text style={{fontSize: 14, width: "34%", textAlign: "right"}}>
                {item.sender ? item.to.substring(0, 5) + "..." + item.to.substring(37)
                  : item.from.substring(0, 5) + "..." + item.from.substring(37)}
              </Text>
            </View>
          </View>
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
  return (
    <View style={{backgroundColor: "white", height: "100%"}}>
      <FlatList
        style={{marginHorizontal: 16}}
        data={dataList}
        renderItem={itemsRender}
        keyExtractor={(item: any, index) => index + ""}
        //数组为空时的展示
        ListEmptyComponent={() => {
          return (
            <View style={{flex: 1, marginTop: "20%", justifyContent: "center", alignItems: "center"}}>
              <Text>暂无数据!</Text>
            </View>
          )
        }}
        // showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          setLoading(true);
          setPage(page + 1);
          initItemList(address)
        }}
        //列表页脚组件
        ListFooterComponent={() => {
          return hasNext ? <Text/> :
            <Text style={{color: "#999", textAlign: "center", marginVertical: 10}}>没有更多数据了</Text>
        }}
      />
    </View>
  );
};


const Coins = () => {
  const [coinsArr, setCoinsArr] = React.useState<Coin[]>(COIN_LIST);
  React.useEffect(() => {
    //添加一个监听事件 获取coins参数
    DeviceEventEmitter.addListener(CoinsData, async (data) => {
      setCoinsArr(data);
    })
    return () => {
      DeviceEventEmitter.removeAllListeners(CoinsData);
    }
  }, [])
  return (
    <View style={{backgroundColor: "white", height: "100%"}}>
      <ScrollView style={{marginTop: 10, marginHorizontal: 16}}>
        {coinsArr.map((item, index) => (
          <CurrencyCoins coin={item} key={index}/>
        ))}
      </ScrollView>
    </View>
  );
};

const TopTab = ({coinList, address}: { coinList: Coin[], address: any }) => {
  React.useEffect(() => {
    if (isEmpty(address)) return;
    setTimeout(() => {
      DeviceEventEmitter.emit(ItemsData, address);
    }, 1000)
  }, [address])

  React.useEffect(() => {
    if (isEmpty(coinList)) return;
    //Tab组件中的component 不支持传参 初始化initialParams不会变更 暂时用事件传递
    DeviceEventEmitter.emit(CoinsData, coinList);
  }, [coinList])

  return (
    <MTop.Navigator
      screenOptions={{
        tabBarStyle: {
          // borderWidth: 1,
          // borderColor: "#1d26af",
          marginHorizontal: 12
        },
        tabBarLabelStyle: {
          fontSize: 16
        },
        tabBarActiveTintColor: "#1d26af",
        tabBarInactiveTintColor: "#999"
      }}
    >
      <MTop.Screen
        name="balance"
        component={Coins}
        options={{
          title: '资产'
        }}
      />
      <MTop.Screen
        name="items"
        initialParams={address}
        component={Items}
        options={{
          title: '历史记录'
        }}
      />
    </MTop.Navigator>
  )
}

const WalletInfo = ({
                      navigation,
                      wallets,
                      coins,
                      route
                    }: {
    navigation: any,
    wallets: Wallet[],
    coins: Record<string, Coin[]>,
    route: any
  }) => {
    const [wallet, setWallet] = React.useState<Wallet>({});
    const [coinList, setCoinList] = React.useState<Coin[]>(COIN_LIST);
    // 账户颜色
    const [walletColor, setWalletColor] = React.useState("#745ef8");
    const [qrcodeShow, setQrcodeShow] = React.useState(false);

    React.useEffect(() => {
      console.log('navigation useEffect');
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => {
          }}>
            <View>
              <Button
                type="clear"
                onPress={clearWallet}>
                <Icon
                  name="trash-outline"
                  type="ionicon"
                  size={24}
                  color="#3DADDF"
                  style={{marginRight: 15}}
                />
              </Button>
            </View>
          </TouchableOpacity>
        ),
      })
    }, [navigation]);

    React.useEffect(() => {
      //初始化
      pageInIt();
    }, [coins]);

    const pageInIt = () => {
      const index = route.params.index;
      if (wallets.length == 0 || isEmpty(wallets[index])) return;
      setWalletColor(ACCOUNT_SCHEME[index % ACCOUNT_SCHEME.length])
      const result = JSON.parse(JSON.stringify(wallets[index]));
      setWallet(result);
      setCoinList(coins[result.address]);
    };

    const clearWallet = async () => {
      const index = route.params.index;
      Alert.alert("删除账户", "是否删除该账户,请确定已保存可恢复的信息", [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "删除",
          onPress: async () => {
            let walletCaches: Wallet[] = await getStorageToArr(_wallet);
            console.log("before", walletCaches);
            let indexTemp = -1;
            let thisAddress = wallets[index].address;
            for (let i = 0; i < walletCaches.length; i++) {
              if (walletCaches[i].address == thisAddress) {
                indexTemp = i;
                break
              }
            }
            walletCaches.splice(indexTemp, 1);
            if (walletCaches.length == 0) {
              //如果是最后一个 直接清除相关
              await delStorage(_password);
              await delStorage(_mnemonic);
              await delStorage(_mnemonicWord);
              await delStorage(_wallet);
              await delStorage(_walletIndex);
            } else {
              await setStorage(_wallet, JSON.stringify(walletCaches));
            }
            DeviceEventEmitter.emit(HomeRefresh, {})
            console.log("after", walletCaches);
            //通知native
            NativeUtils.deleteAccount(thisAddress);
            navigation.goBack();
          },
          style: "default"
        }
      ])
    }

    const toggleQrcode = () => {
      setQrcodeShow(!qrcodeShow);
    }

    const copy = async () => {
      const res = await copyToClipboard(wallet.address);
      if (res) Alert.alert("复制成功");
    }

    return (
      <View style={styles.container}>
        {/*二维码*/}
        <Qrcode qrcodeShow={qrcodeShow} wallet={wallet} onBackdropPress={toggleQrcode}/>

        <View>
          <View style={{margin: 12}}>
            <View
              style={{
                backgroundColor: walletColor,
                height: 160,
                borderRadius: 8,
                overflow: 'hidden',
                padding: 14,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{fontSize: 28, fontWeight: '500', color: '#fff'}}>
                    {toFixed(coinList?.[0]?.balance || "0.00")}
                  </Text>
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 28,
                      fontWeight: '500',
                      color: '#eeeeee60',
                    }}>
                    ZLC
                  </Text>
                </View>
                <Icon
                  name="copy-outline"
                  type="ionicon"
                  size={26}
                  color="#fff"
                  onPress={copy}
                />
              </View>
              <Text style={{marginTop: 26, color: '#fff'}}>
                {wallet.address}
              </Text>

              <View style={styles.walletCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("SendTransaction", {form: wallet.address})}
                  style={[
                    styles.btn_box,
                    {borderRightColor: '#333', borderRightWidth: 1},
                  ]}>
                  <Icon
                    name="send-sharp"
                    type="ionicon"
                    size={18}
                    color="#fff"
                    style={{transform: [{rotate: '-90deg'}]}}
                  />
                  <Text style={styles.btn_text}>发送</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn_box}
                                  onPress={toggleQrcode}
                >
                  <Icon
                    name="send-sharp"
                    type="ionicon"
                    size={18}
                    color="#fff"
                    style={{transform: [{rotate: '90deg'}]}}
                  />
                  <Text style={styles.btn_text}>接收</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <TopTab coinList={coinList} address={route.params.address}/>
      </View>
    );
  }
;

export default connect(mapStateToProps, {})(WalletInfo);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  walletCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000060',
    // opacity: 0.5,
    height: 50,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  btn_box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn_text: {
    marginLeft: 10,
    fontSize: 14,
    color: '#fff',
  },
  tabText: {
    fontSize: 20,
    color: 'black',
  },
  tabSelectColor: {
    color: '#1d26af',
    fontSize: 20,
  },
  itemTitle: {
    fontWeight: "400",
    fontSize: 17
  },
  burden: {
    transform: [{rotate: '-45deg'}]
  },
  just: {
    transform: [{rotate: '45deg'}]
  }
});
