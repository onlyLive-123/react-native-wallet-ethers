import {
  ActivityIndicator,
  DeviceEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import React from "react";
import NativeUtils from "../../utils/NativeUtils";
import {HomeRefresh} from "../../types/constant";

const {WalletBridge} = NativeModules;
const EmptyIndex = ({navigation}: any) => {

  React.useEffect(() => {
    if (WalletBridge) {
      const walletBridgeEmitter = new NativeEventEmitter(WalletBridge);
      const subscription = walletBridgeEmitter.addListener(
        'EventReminder',
        reminder => {
          console.log('native home', reminder);
          //{eventType:"route",value:{name:"home/transaction",params:{name/addressList}}}
          let eventType = reminder.eventType;
          if (eventType === 'route') {
            NativeUtils.sendTransaction(reminder, navigation);
          } else if (eventType === "notice") {
            //{eventType:"notice",value:{name:"homeRefresh"}} 收到交易以后通知查询余额
            setTimeout(() => {
              DeviceEventEmitter.emit(HomeRefresh, {});
            }, 2000)
          }
        },
      );
      return () => subscription.remove();
    } else {
      navigation.replace("Home");
      // NativeUtils.sendTransaction({
      //   value:{
      //     name:"transaction",
      //   }
      // }, navigation);
    }
    //不传当前页面发生变化就调用
    //不为空等同于监听这个值的变化
    //为空等同于componentDidMount 只会调用一次
  })

  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff"}}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <ActivityIndicator size={"large"}/>
        <Text style={{fontSize: 20, color: "#999"}}>正在进入钱包...</Text>
      </TouchableOpacity>
    </View>
  )
}

export default EmptyIndex;
