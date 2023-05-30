import {Alert, StyleSheet, Text, View} from "react-native";
import React from "react";
import {Button} from "@rneui/base";
import {copyToClipboard} from "../../utils/Utils";
import Input from '../../components/Input';
import {getStorage} from "../../utils/Storage";
import {_mnemonicWord} from "../../types/constant";


export default ({navigation, route}: any) => {

  const [mnemonic, setMnemonic] = React.useState<string[]>([]);
  const [input, setInput] = React.useState<string>("");
  const [random, setRandom] = React.useState<number>();
  const [mnemonicWord, setMnemonicWord] = React.useState<number>(0);

  React.useEffect(() => {
    console.log("backupsIndex useEffect");
    //初始化
    pageInit();

  }, [])

  React.useEffect(() => {
    if (mnemonic.length == 0) return;
    console.log("random useEffect");
    //0.9659226274786259
    let number = Math.random() * 100;
    number = parseInt(number + "") % (mnemonic.length - 1) + 1;
    setRandom(number);
    console.log("random", number, mnemonic.length);

  }, [mnemonic])

  const pageInit = async () => {
    const data = route?.params?.mnemonic;
    setMnemonic(data);
    let mnemonicWord: string = await getStorage(_mnemonicWord);
    if (mnemonicWord) {
      setMnemonicWord(mnemonicWord);
    }
  }

  const onSubmit = async () => {
    if (mnemonic[random - 1] !== input) return Alert.alert("错误的单词");
    const res = await copyToClipboard(mnemonic.join(" "));
    console.log(mnemonic.join(" "));
    if (res) {
      Alert.alert("验证成功", "助记词已复制", [
        {
          text: "确认",
          onPress: async () => {
            navigation.navigate("Home");
          },
          style: "default"
        },
      ]);
    } else {
      Alert.alert("复制失败,请检查!")
    }
  }

  return (
    <View style={[styles.container]}>
      <View style={{flexDirection: "row", marginVertical: 16}}>
        <Text style={{fontSize: 18}}>查看您的助记词 </Text>
        <Text style={{fontSize: 18, color: "#999"}}>{random}#</Text>
      </View>
      <View>
        <Input
          value={input}
          onChangeText={text => setInput(text)}
          placeholder="请输入单词"
          keyboardType={mnemonicWord == 1 ? "" : "ascii-capable"}
        />
        <Text style={{
          fontSize: 15,
          color: "#999",
          marginTop: 10,
          marginBottom: 50
        }}>为了确认您是否正确备份了助记词，请在上方输入{random}#单词。</Text>
        <Button title={"确认"} onPress={onSubmit}
                buttonStyle={{
                  backgroundColor: '#3DADDF',
                  borderRadius: 10,
                }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flex: 1,
  },
});

