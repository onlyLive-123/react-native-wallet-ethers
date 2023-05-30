import {Image, NativeModules, ScrollView, StyleSheet, Text, View} from "react-native";
import {Icon} from "@rneui/themed";
import React from "react";
import {Button} from "@rneui/base";
import {dateFormat, isEmpty} from "../../utils/Utils";
import HeaderLeft from "../../components/HeaderLeft";
import NativeUtils from "../../utils/NativeUtils";

const {WalletBridge} = NativeModules;
const ItemDetail = ({navigation, route}: any) => {
  const [detail, setDetail] = React.useState({
    sender: false,
    from: "-",
    to: "-",
    amount: '0.00',
    timestamp: parseInt(new Date().getTime() / 1000 + ""),
    unit: "ZLC",
    name: "-",
    gas: "0.001",
    hash: "-",
    logo: "",
    formNative: false
  });

  React.useEffect(() => {
      const item = route.params;
      console.log("item:", item);
      if (item) {
        setDetail(item);
        if (item.unit == "MZLC") {
          item.logo = require("../../assets/MZLC.jpg")
        } else if (item.unit == "EZLC") {
          item.logo = require("../../assets/EZLC.jpg")
        } else if (item.unit == "QZLC") {
          item.logo = require("../../assets/QZLC.jpg")
        } else {
          item.logo = require("../../assets/ZLC.jpg")
        }
      }
      if (WalletBridge && item.formNative) {
        //修改返回按钮事件
        navigation.setOptions({
          headerLeft: () => <HeaderLeft nav={navigation}/>,
        });
      }
    }
    , [])

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={detail.logo ?? require("../../assets/ZLC.jpg")}
          />
          {detail.name ?
            <Text style={{marginTop: 10, fontSize: 16}}>{detail.name}</Text>
            : <Text style={{marginTop: -10}}/>
          }
          <View style={{flexDirection: "row", alignItems: "flex-end", marginTop: 10}}>
            <Text style={{fontSize: 28, fontWeight: 600}}>{detail.amount}</Text>
            <Text style={{paddingBottom: 4}}> {detail.unit}</Text>
          </View>
          <View style={{flexDirection: "row", marginVertical: 10}}>
            <Icon
              name="checkmark-circle-outline"
              type="ionicon"
              size={22}
              color="#3DADDF"
            />
            <Text style={{color: "#3DADDF", fontSize: 20}}> {
              detail.sender ? "转账完成" : "收款完成"
            }</Text>
          </View>
        </View>
        <View style={styles.box}>
          <View style={styles.boxView}>
            <Text style={styles.title}>收款地址</Text>
            <Text style={styles.text}>{detail.to}</Text>
          </View>
          <View style={styles.boxView}>
            <Text style={styles.title}>转账地址</Text>
            <Text style={styles.text}>{detail.from}</Text>
          </View>
          <View style={styles.boxView}>
            <Text style={styles.title}>交易手续费</Text>
            <Text style={styles.text}>{isEmpty(detail.gas) ? "0.0" : detail.gas} {detail.unit}</Text>
          </View>
          <View style={styles.boxView}>
            <Text style={styles.title}>交易流水号</Text>
            <Text style={styles.text}>{detail.hash}</Text>
          </View>
          <View style={styles.boxView}>
            <Text style={styles.title}>交易时间</Text>
            <Text style={styles.text}>{dateFormat(new Date(detail.timestamp * 1000), "MM/dd hh:mm")}</Text>
          </View>
        </View>
        <View style={{paddingBottom: 60}}/>
      </ScrollView>
      <View style={styles.finish}>
        <Button title={"完成"}
                buttonStyle={{
                  backgroundColor: '#3DADDF',
                  borderRadius: 20,
                }}
                onPress={() => {
                  if (detail.formNative) {
                    NativeUtils.closeReact();
                    NativeUtils.clearRoute(navigation);
                  } else {
                    navigation.goBack();
                  }
                }}
        />
      </View>
    </View>
  )
}

export default ItemDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: "column",
    alignItems: "center"
  },
  box: {
    marginVertical: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: "#999"
  },
  boxView: {
    marginHorizontal: 20,
    marginVertical: 12
  },
  finish: {
    position: "absolute",
    bottom: 10,
    width: "80%",
    left: "10%",
  },
  title: {
    fontSize: 20,
    color: "#999",
    marginBottom: 5
  },
  text: {
    fontSize: 18
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#ddd",
    marginTop: 10
  },
});
