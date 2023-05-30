import {Alert, DeviceEventEmitter, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Icon} from '@rneui/themed';
import React from "react";
import {getStorage, getStorageToJson} from "../../utils/Storage";
import {_nativeId, _network, ABI, HomeRefresh} from "../../types/constant";
import {Network, SendData} from "../../types";
import ChainUtils from "../../utils/ChainUtils";
import {BigNumber, ethers} from "ethers";
import {FeeData} from "@ethersproject/abstract-provider/src.ts/index";
import {Provider} from "@ethersproject/abstract-provider";
import {copyToClipboard, toNumberFixed} from "../../utils/Utils";
import NativeUtils from "../../utils/NativeUtils";

export default ({navigation, route}: any) => {

  const [sendData, setSendData] = React.useState<SendData>({});
  const [loading, setLoading] = React.useState(false);
  const [gasPrice, setGasPrice] = React.useState("25");
  const [gas, setGas] = React.useState("0.000525");
  const [gasUsd, setGasUsd] = React.useState("0.000525");
  const [gasLimit, setGasLimit] = React.useState("21000");

  React.useEffect(() => {
    console.log("confirmTransaction index useEffect");
    //初始化
    pageInit();

  }, []);

  const pageInit = async () => {
    setLoading(true);
    let data = route.params;
    //计算gas费
    let network: any = await getStorageToJson(_network);
    const provider = ChainUtils.getProvider(network);
    //获取当前汽油费价格 单位wei
    let feeData: FeeData = await provider.getFeeData();
    const gasPrice: any = feeData.gasPrice;
    console.log("获取到当前汽油费价格", feeData);
    //预估汽油费
    let preSendData = {
      data: "0x",
      to: data.toAddress,
      value: "0x0"
    }
    console.log("pre", preSendData);
    //返回gwei
    const estimateGas = await provider.estimateGas(preSendData);
    const gasLimit = estimateGas.toString();
    console.log("预估汽油个数:", gasLimit);
    // ((100/10) * (100/10)) == (100 * 100 /100)
    const gas = ethers.utils.formatUnits(estimateGas.mul(gasPrice));
    console.log("消耗的汽油费", gas)
    let price = gasPrice.toString();
    setGasPrice(price);
    setGas(gas);
    setGasUsd((parseFloat(gas) * 1983) + "");
    setGasLimit(gasLimit)
    setSendData(data);
    console.log("data:", data, price, gas);
    setLoading(false);
  }

  const sendTx = async () => {
    let success: any;
    setLoading(true);
    try {
      const params: SendData = {
        formPrivate: sendData.formPrivate,
        formAddress: sendData.formAddress,
        toAddress: sendData.toAddress,
        address: sendData.address,
        amount: sendData.amount,
        gasPrice: gasPrice,
        gasLimit: gasLimit
      }
      console.log("params", params);

      let network: any = await getStorageToJson(_network);
      //获取provider
      let provider = await ChainUtils.getProvider(network);
      if (params.address) {
        //合约
        success = await sendContract(params, network, provider);
      } else {
        success = await sendTransaction(params, network, provider);
      }
    } finally {
      setLoading(false);
    }
    if (success) {
      success["timestamp"] = parseInt(new Date().getTime() / 1000 + "");
      success["gas"] = gas;
      success["nativeId"] = await getStorage(_nativeId);
      console.log("send success", success)
      //发送原生通知
      NativeUtils.transactionNotice(success);
      setTimeout(() => {
        DeviceEventEmitter.emit(HomeRefresh, {});
      }, 3000)
      navigation.navigate("TxSuccess", {
        fromNative: sendData.fromNative
      })
    }
  }

  const sendTransaction = async (
    params: SendData,
    network: Network,
    provider: Provider
  ) => {
    const etherWallet: any = ChainUtils.getWallet(params.formPrivate, provider);
    console.log("send before:", network, etherWallet);
    const txCount = await provider.getTransactionCount(etherWallet.address);
    console.log("获取当前地址交易区块count:", txCount)
    let txData = {
      from: etherWallet.address,
      chainId: network.chainId,
      data: "0x",
      gasLimit: BigNumber.from(params.gasLimit).toHexString(),
      gasPrice: BigNumber.from(params.gasPrice).toHexString(),
      nonce: BigNumber.from(txCount).toHexString(),
      to: params.toAddress,
      value: ethers.utils.parseEther(params.amount + "").toHexString()
    }
    try {
      console.log("交易data:", txData);
      const callValue = await etherWallet.signTransaction(txData);
      console.log("签名当前交易返回:", callValue);
      //直接拿钱包发明文
      // const result = await wallet.sendTransaction(txData)
      //通过钱包签名后 用provider发送密文
      const tx = await provider.sendTransaction(callValue);
      console.log("发送交易完成:", tx)
      return {
        toNativeId: sendData.nativeId,
        hash: tx.hash,
        nonce: tx.nonce,
        from: params.formAddress,
        to: params.toAddress,
        amount: params.amount + "",
        type: 1,
        unit: sendData.unit
      }
    } catch (err) {
      console.log("请求异常:", err);
      if (err.toString().indexOf("cannot estimate gas")) {
        Alert.alert("账户余额不足以支付交易费!")
      } else {
        Alert.alert("发送交易异常")
      }
      return null;
    }
  }

  const sendContract = async (
    params: SendData,
    network: Network,
    provider: Provider
  ) => {
    try {
      //暂时先中心化钱包付合约gas费 _contractPrivateKey 暂未设置汽油费 先不考虑中心化
      const etherWallet: any = ChainUtils.getWallet(params.formPrivate, provider);

      console.log("send before:", network, etherWallet);
      console.log("contract user address", etherWallet.address);
      const contract = new ethers.Contract(
        params.address as string,
        ABI,
        //如果只用provider 则只能读
        etherWallet);
      console.log("获取到合约:", contract.address);
      const tx = await contract.transfer(
        params.toAddress,
        ethers.utils.parseEther(params.amount + ""));
      console.log("合约交易完成:", tx);
      return {
        toNativeId: sendData.nativeId,
        hash: tx.hash,
        nonce: tx.nonce,
        from: params.formAddress,
        to: params.toAddress,
        amount: params.amount + "",
        type: 2,
        unit: sendData.unit
      }
    } catch (err) {
      console.log("请求异常:", err);
      if (err.toString().indexOf("cannot estimate gas")) {
        Alert.alert("账户余额不足以支付交易费!")
      } else {
        Alert.alert("发送交易异常")
      }
      return null;
    }
  }

  const goConfirmPassword = () => {
    navigation.navigate("ConfirmPassword", {
      callback: () => sendTx()
    })
  }

  const copy = async (address: string) => {
    const res = await copyToClipboard(address);
    if (res) Alert.alert("复制成功");
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollview}>
        {/* 手续费 */}
        <View style={[styles.box_border, styles.charge_box]}>
          <Text style={[styles.black_bold, styles.charge_label]}>
            交易费
          </Text>
          <View style={styles.charge_time_box}>
            <Text style={[styles.black_bold, styles.charge_time_label]}>
              🚕市场
            </Text>
            <Text style={[styles.black_bold, styles.charge_time_val]}>
              ~30s
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={[styles.charge_val]}>{toNumberFixed(gas, 9)} ZLC</Text>
            {/*<Text style={[styles.charge_worth]}>$ {toNumberFixed(gasUsd, 9)} USD</Text>*/}
          </View>
        </View>

        {/* 交易明细 */}
        <View style={[styles.box_border, styles.transaction_detail_box]}>
          <View style={styles.transaction_detail_header}>
            <View style={styles.currency_type_box}>
              <Text style={styles.currency_type}>{sendData.unit}</Text>
            </View>
            <Text style={[styles.black_bold, styles.send]}>发送</Text>
          </View>

          <View style={styles.transaction_detail_content}>
            <Text style={[styles.black_bold, styles.amount]}>-{sendData.amount} {sendData.unit}</Text>

            <Text style={styles.account_label}>从</Text>
            <View style={[styles.account_content, {marginBottom: 16}]}>
              <Text style={styles.account_name}>{sendData.name} #({sendData.formAddress?.substring(37)})</Text>
              <Icon name="copy-outline" type="ionicon" size={16} color="#333"
                    onPress={() => copy(sendData.formAddress)}/>
            </View>
            <Text style={styles.account_label}>到</Text>
            <View style={styles.account_content}>
              <Text
                style={styles.account_name}>{sendData.toAddress?.substring(0, 6)}...{sendData.toAddress?.substring(37)}</Text>
              <Icon name="copy-outline" type="ionicon" size={16} color="#333" onPress={() => copy(sendData.toAddress)}/>
            </View>
          </View>
        </View>

        <View style={styles.balance_box}>
          <Text style={styles.balance_label}>余额：</Text>
          <Text style={styles.balance_val}>{sendData.balance} {sendData.unit}</Text>
        </View>
      </ScrollView>

      <View style={styles.actionbar}>
        <Button
          onPress={() => navigation.goBack()}
          title="取消"
          type="outline"
          containerStyle={[styles.button_container, {marginRight: 20}]}
          buttonStyle={[styles.button, styles.cancel_button]}
          titleStyle={[styles.button_title, styles.cancel_button_title]}
        />
        <Button
          loading={loading}
          title="确认"
          containerStyle={styles.button_container}
          buttonStyle={[styles.button, styles.confirm_button]}
          titleStyle={styles.button_title}
          onPress={goConfirmPassword}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box_border: {
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  black_bold: {
    color: '#000',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollview: {
    paddingHorizontal: 16,
  },

  charge_box: {
    marginTop: 20,
    padding: 18,
  },
  charge_label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8c8c8c',
  },
  charge_time_box: {
    paddingVertical: 8,
    flexDirection: 'row',
  },
  charge_time_label: {
    fontSize: 18,
  },
  charge_time_val: {
    marginLeft: 10,
    fontSize: 18,
    color: '#1581e2',
  },
  charge_val: {
    fontSize: 14,
    fontWeight: '600',
  },
  charge_worth: {
    marginLeft: 5,
    fontSize: 14,
    color: '#8c8c8c',
    fontWeight: '600',
  },
  transaction_detail_box: {
    marginTop: 30,
  },
  transaction_detail_header: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency_type_box: {
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#eee',
    width: 38,
    height: 38,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currency_type: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  send: {
    marginLeft: 13,
    fontSize: 18,
    color: '#353535',
  },
  transaction_detail_content: {
    padding: 18,
  },
  amount: {
    fontSize: 26,
    marginBottom: 30,
  },
  account_label: {
    color: '#8c8c8c',
    fontSize: 15,
  },
  account_content: {
    marginTop: 2,
    flexDirection: 'row',
  },
  account_name: {
    marginRight: 6,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  balance_box: {
    marginTop: 30,
    flexDirection: 'row',
  },
  balance_label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8c8c8c',
  },
  balance_val: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionbar: {
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button_container: {
    flex: 1,
  },
  button: {
    borderRadius: 5,
    height: 50,
  },
  button_title: {
    fontWeight: '500',
  },

  confirm_button: {
    backgroundColor: '#3DADDF',
  },
  cancel_button: {
    backgroundColor: '#efefef',
    borderColor: '#ddd',
  },
  cancel_button_title: {
    color: '#333',
  },
});
