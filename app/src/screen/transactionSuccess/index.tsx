import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Avatar, Button} from '@rneui/themed';
import React from "react";
import NativeUtils from "../../utils/NativeUtils";

export default ({navigation, route}: any) => {

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollview}>
        <View style={{marginVertical: 60}}>
          <View style={{marginVertical: 10, flexDirection: "row", justifyContent: "center"}}>
            <Avatar
              size={55}
              rounded
              icon={{name: "checkmark-outline", type: "ionicon"}}
              containerStyle={{backgroundColor: "#3DADDF"}}/>
          </View>
          <Text style={{textAlign: "center"}}>本笔交易已成功</Text>
        </View>
        <Button
          title="确认"
          buttonStyle={{
            backgroundColor: '#3DADDF',
            borderRadius: 10,
          }}
          containerStyle={{
            marginTop: 40,
            width: '100%',
            marginHorizontal: 50,
            alignSelf: 'center',
          }}
          onPress={() => {
            //如果是native发起的 直接调用native关闭
            if (route.params && route.params.fromNative) {
              NativeUtils.closeReact();
              NativeUtils.clearRoute(navigation);
            } else {
              navigation.navigate("Home");
            }
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flex: 1,
  },
  scrollview: {
    paddingVertical: 30,
    flex: 1,
  },
});
