import {StyleSheet, Text, View} from "react-native";
import React from "react";
import {Button} from "@rneui/base";
import {getStorage} from "../../utils/Storage";
import {_mnemonic} from "../../types/constant";


export default ({navigation, route}: any) => {
  const [mnemonic, setMnemonic] = React.useState<string[]>([]);

  React.useEffect(() => {
    console.log("backupsIndex useEffect");
    //初始化
    pageInit();

  }, [])

  const pageInit = async () => {
    const mnemonic = await getStorage(_mnemonic);
    setMnemonic(mnemonic.split(" "));
  }


  return (
    <View style={styles.container}>
      <Text>您的助记词</Text>
      <View style={{borderWidth: 1, borderColor: "#999", borderRadius: 15, marginVertical: 10}}>
        <View style={{flexDirection: "row", flexWrap: "wrap"}}>
          {mnemonic.map((item, index) =>
            <View key={index} style={{width: "50%"}}>
              <View style={{flexDirection: "row", width: "50%", marginLeft: "10%"}}>
                <View style={{flexDirection: "row", margin: 4}}>
                  <Text style={{color: "#999", fontSize: 16}}>{index + 1}   </Text>
                  <Text style={{fontSize: 16}}>{item}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <Text style={{marginBottom: 40}}>这是您的助记词。您需要用它来证明这个钱包属于您。请将其写在纸上并保存在安全的地方。如果丢失或者重新安装钱包，您需要用到这些助记词。</Text>
      <Button title={"我已牢记,下一步"} onPress={() => navigation.navigate("Backups", {mnemonic: mnemonic})}
              buttonStyle={{
                backgroundColor: '#3DADDF',
                borderRadius: 10,
              }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flex: 1,
    paddingTop: 12
  },
});
