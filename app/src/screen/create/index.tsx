import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Modal,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Input from '../../components/Input';
import {CheckBox, Icon} from '@rneui/base';
import {Button} from '@rneui/themed';
import React from "react";
import {_mnemonic, _mnemonicWord, _password, _wallet, _walletIndex, HomeRefresh} from "../../types/constant";
import {Wallet} from "../../types";
import {getStorage, getStorageToArr, setStorage} from "../../utils/Storage";
import ChainUtils from "../../utils/ChainUtils";
import NativeUtils from "../../utils/NativeUtils";
import {isEmpty} from "../../utils/Utils";

const {WalletBridge} = NativeModules;

export default ({navigation}: any) => {

  const [secureText, setSecureText] = React.useState(true);
  const [eyeState, setEyeState] = React.useState(false);
  const [secureCheckText, setSecureCheckText] = React.useState(true);
  const [eyeCheckState, setEyeCheckState] = React.useState(false);
  const [cachePassword, setCachePassword] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [checkPassword, setCheckPassword] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [wallets, setWallets] = React.useState<Wallet[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setIndex] = React.useState(0);
  const [mnemonicWord, setMnemonicWord] = React.useState();

  React.useEffect(() => {
    console.log("createIndex useEffect");
    //初始化
    pageInit();

  }, [])

  const pageInit = async () => {
    let walletCaches: [Wallet] = await getStorageToArr(_wallet);
    if (!isEmpty(walletCaches)) {
      setWallets(walletCaches);
    }
    let index = await getStorage(_walletIndex);
    let accountName = "主账户";
    if (index) {
      accountName = "Account " + index;
    }
    setAccount(accountName);
    let cachePassword: string = await getStorage(_password);
    if (cachePassword) {
      setCachePassword(cachePassword);
    }
    //已存在的助记词的语种
    let mnemonicWord: string = await getStorage(_mnemonicWord);
    if (mnemonicWord) {
      setMnemonicWord(mnemonicWord);
      setIndex(parseInt(mnemonicWord));
    }
  }

  const eysClick = (type: number) => {
    if (type == 1) {
      setEyeState(!eyeState);
      setSecureText(!secureText);
    } else {
      setEyeCheckState(!eyeCheckState);
      setSecureCheckText(!secureCheckText);
    }
  }

  const onChangeText = (type: number, text: string) => {
    if (type == 0) {
      setCheckPassword(text);
    } else if (type == 1) {
      setPassword(text);
    } else if (type == 2) {
      setAccount(text);
    } else if (type == 3) {
      setCheckPassword(text);
    }
  }

  const createWallet = async () => {
    if (!password) return Alert.alert("密码不能为空!");
    if (!account) return Alert.alert("账户名不能为空!");
    //取出缓存中的密码
    if (cachePassword) {
      if (cachePassword != password) {
        return Alert.alert("密码错误", "请输入您设置的钱包密码");
      }
    } else {
      if (password != checkPassword) {
        return Alert.alert("密码错误", "两次密码输入不一致");
      }
    }
    setLoading(true);
    // try {
    // 如果已经生成过用户了 助记词则从缓存取
    let mnemonic: any = await getStorage(_mnemonic);
    if (!mnemonic) {
      mnemonic = ChainUtils.createMnemonic(selectedIndex == 0 ? "en" : "zh");
    }
    let index = 0;
    for (let i = 0; i < wallets.length; i++) {
      if (1 == wallets[i].type) {
        index += 1;
      }
    }
    console.log("获取助记词:", mnemonic, index);
    // const createWallet: any = ChainUtils.createWalletFormMnemonic(mnemonic, wallets.length);
    NativeUtils.createWalletFrom({
      mnemonic: mnemonic,
      index: parseInt(index),
      wordlist: selectedIndex == 1 ? "zh" : "en"
    }, async (createWallet: any) => {
      setLoading(false);
      if (!createWallet.address) {
        return Alert.alert("导入失败", "请仔细检查您的助记词!");
      }
      index = await getStorage(_walletIndex);
      index = index ? index : "0";
      await setStorage(_walletIndex, parseInt(index) + 1 + "")
      await setStorage(_mnemonicWord, selectedIndex + "")
      const wallet: Wallet = {
        name: account,
        mnemonic: mnemonic,
        privateKey: createWallet.privateKey,
        publicKey: createWallet.publicKey,
        address: createWallet.address.toLowerCase(),
        balance: "0.0",
        type: 1   //1 创建 2/导入助记词 3/导入私钥
      }
      wallets.push(wallet);
      await setStorage(_wallet, JSON.stringify(wallets));
      await setStorage(_mnemonic, mnemonic);
      await setStorage(_password, password);
      // 通知到原生
      NativeUtils.createWallet({
        name: account,
        address: createWallet.address
      })
      Alert.alert("创建成功", "您的钱包已创建成功", [
        {
          text: "立即体验",
          onPress: async () => {
            DeviceEventEmitter.emit(HomeRefresh, {})
            navigation.goBack();
          },
          style: "default"
        },
      ])
    });

    // } catch (err) {
    //   console.log("创建异常", err);
    // } finally {
    //   setLoading(false);
    // }
  }

  return (
    <View style={styles.container}>
      {!WalletBridge ?
        <Modal
          animationType="slide"
          transparent={true}
          visible={loading}
        >
          <View
            style={{
              flex: 1, justifyContent: "center", alignItems: "center",
              backgroundColor: "#000", opacity: 0.8
            }}>
            <ActivityIndicator size={"large"} color={"#ddd"}/>
            <Text style={{fontSize: 18, color: "#ddd", marginVertical: 8}}>正在创建您的钱包...</Text>
            <Text style={{fontSize: 12, color: "#ddd"}}>
              由于数据需要加密并存储在您的本地,这需要一些时间
            </Text>
            <Text style={{fontSize: 12, color: "#ddd"}}>请耐心等待...</Text>
          </View>
        </Modal>
        : <Text/>
      }

      <ScrollView style={styles.scrollview}>
        <Input
          value={password}
          onChangeText={text => onChangeText(1, text)}
          label="密码"
          placeholder="输入您的钱包密码"
          keyboardType="ascii-capable"
          secureTextEntry={secureText}
          rightIcon={
            // "eye-outline"
            <Icon type="ionicon" onPress={() => eysClick(1)} size={18}
                  name={eyeState ? "eye-outline" : "eye-off-outline"}/>
          }
        />

        {cachePassword ? <Text/> :
          <Input
            value={checkPassword}
            onChangeText={text => onChangeText(0, text)}
            label="确认密码"
            placeholder="请确认您的密码"
            keyboardType="ascii-capable"
            secureTextEntry={secureCheckText}
            rightIcon={
              // "eye-outline"
              <Icon type="ionicon" onPress={() => eysClick(2)} size={18}
                    name={eyeState ? "eye-outline" : "eye-off-outline"}/>
            }
          />
        }

        <Input label="账户名称" placeholder="账户名称"
               value={account}
               onChangeText={text => onChangeText(2, text)}
        />

        {
          mnemonicWord ? <Text/> :
            <View>
              <Text style={styles.label}>选择生成的助记词</Text>
              <View style={{flexDirection: "row"}}>
                <CheckBox
                  title={"English"}
                  checked={selectedIndex === 0}
                  onPress={() => setIndex(0)}
                  iconType="ionicon"
                  checkedIcon="checkmark-circle-outline"
                  uncheckedIcon="ellipse-outline"
                />
                <CheckBox
                  title={"中文"}
                  checked={selectedIndex === 1}
                  onPress={() => setIndex(1)}
                  iconType="ionicon"
                  checkedIcon="checkmark-circle-outline"
                  uncheckedIcon="ellipse-outline"
                />
              </View>
            </View>
        }

        <Button
          title="添加账户"
          loading={loading}
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
          onPress={createWallet}
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
  label: {
    paddingVertical: 8,
    color: '#333',
    fontSize: 14,
  },
});
