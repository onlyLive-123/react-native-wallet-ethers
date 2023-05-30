import {Coin} from "../types";
import {Image, StyleSheet, Text, View} from "react-native";
import React from "react";
import {toFixed} from "../utils/Utils";

export function CurrencyCoins(props: { coin: Coin }) {
  const coin = props.coin;
  const itemStyles = StyleSheet.create({
    container: {
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
  });

  return (
    <View style={itemStyles.container}>
      <Image
        style={itemStyles.logo}
        source={coin.logo ?? require("../assets/ZLC.jpg")
        }/>
      <View>
        <Money money={coin.balance ?? "0.0"} desc={coin.unit ?? "ZLC"}/>
        {/*{coin.address ?*/}
        {/*  <Money money={""} desc={""} appearance={{plain: true}}/>*/}
        {/*  :*/}
        {/*  <Money money={coin.cnyBalance ?? "0.00"} desc={"USD"} appearance={{plain: true}}/>*/}
        {/*}*/}
      </View>
    </View>
  );
}

export function Money(props: {
  money: string;
  desc: string;
  appearance?: {
    size?: 'small' | 'big';
    plain?: boolean;
  }
}) {
  const fontSize = props.appearance?.size === 'big' ? 30 : 18;
  const mainColor = props.appearance?.plain ? '#999' : '#000';
  return (
    <View style={{flexDirection: 'row'}}>
      <Text
        style={{
          fontSize,
          marginRight: 6,
          color: mainColor,
          fontWeight: '500'
        }}>
        {props.appearance?.size === 'big' ? toFixed(props.money) : props.money}
      </Text>
      <Text style={{fontSize, color: '#999', fontWeight: '500'}}>
        {props.desc}
      </Text>
    </View>
  );
};
