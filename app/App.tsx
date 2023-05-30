// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */
//
// import type {PropsWithChildren} from 'react';
// import React from 'react';
// import {Alert, Button, Dimensions, SafeAreaView, StyleSheet, Text, useColorScheme, View,} from 'react-native';
//
// import {Colors,} from 'react-native/Libraries/NewAppScreen';
// import {Camera, useCameraDevices} from "react-native-vision-camera";
// import {BarcodeFormat, useScanBarcodes} from "vision-camera-code-scanner";
//
//
// type SectionProps = PropsWithChildren<{
//   title: string;
// }>;
//
// function Section({children, title}: SectionProps): JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// }
//
// function App(): JSX.Element {
//
//   const [hasPermission, setHasPermission] = React.useState(false);
//   const [active, setActive] = React.useState(false);
//   const devices = useCameraDevices();
//   const device = devices.back;
//   console.log(devices, device)
//   const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
//     checkInverted: true,
//   });
//
//   React.useEffect(() => {
//     if (barcodes.length > 0) {
//       setActive(false);
//       const displayValue = barcodes[0].displayValue;
//       setActive(false);
//       Alert.alert(displayValue);
//     }
//   }, [barcodes]);
//
//   React.useEffect(() => {
//     const get = async () => {
//       const status = await Camera.requestCameraPermission();
//       setHasPermission(status === 'authorized');
//       console.log(1111, status);
//     }
//     get();
//   }, []);
//
//   const getPermission = async () => {
//     const status = await Camera.requestCameraPermission();
//     Alert.alert(status)
//   }
//   const openCamera = async () => {
//     setActive(!active);
//   }
//   return (
//     <SafeAreaView>
//       <View>
//         <Button title={"getPermission"} onPress={getPermission}/>
//         <Button title={"openCamera"} onPress={openCamera}/>
//         {(active && device && hasPermission) ?
//           <View style={{height: Dimensions.get("window").height}}>
//             <Camera
//               style={StyleSheet.absoluteFill}
//               device={device}
//               isActive={true}
//               frameProcessor={frameProcessor}
//               frameProcessorFps={5}
//             />
//           </View> : <Text/>
//         }
//       </View>
//     </SafeAreaView>
//   );
// }
//
// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });
//
// export default App;

//引入手势触碰组件
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import WalletConnectProvider from 'react-native-walletconnect';
import React from 'react';
import {Provider as StoreProvider} from 'react-redux'
import {createTheme, ThemeProvider} from '@rneui/themed';
import {AppRegistry, DeviceEventEmitter, SafeAreaView} from 'react-native';
import AppMain from './src';
import store from "./src/redux/store";
import NativeUtils from "./src/utils/NativeUtils";
import {Network, Wallet} from "./src/types";
import {getStorageToArr, getStorageToJson, setStorage} from "./src/utils/Storage";
import {_network, _wallet, ABI, COIN_LIST, HomeRefresh, NETWORK} from "./src/types/constant";
import {isEmpty} from "./src/utils/Utils";
import {_balance} from "./src/redux/actions/Constant";
import {BigNumber, ethers} from "ethers";
import ChainUtils from "./src/utils/ChainUtils";


AppRegistry.registerRunnable('RunableTask', () => {
  setInterval(() => {
    homeInit();
  }, 3000);
})
AppRegistry.runApplication('RunableTask', {});

const homeInit = async () => {
  //获取钱包账户缓存
  let wallets: Wallet[] = await getStorageToArr(_wallet);
  console.log('index home init', wallets.length, new Date().getTime());
  if (!wallets || !wallets.length) {
    return;
  }
  let network: Network = await getStorageToJson(_network);
  if (isEmpty(network)) {
    network = NETWORK;
    await setStorage(_network, JSON.stringify(network));
  }
  const provider = ChainUtils.getProvider(network);
  for (let i = 0; i < wallets.length; i++) {
    let walletTemp = wallets[i];
    let coinList = JSON.parse(JSON.stringify(COIN_LIST));
    // 获取当前账户下的资产
    for (let j = 0; j < coinList.length; j++) {
      let coinTemp: any = coinList[j];
      if (isEmpty(coinTemp.address)) {
        //获取缓存中的默认值
        // coinTemp.walletAddress = walletTemp.address;
        //异步查余额
        provider
          .getBalance(walletTemp.address)
          .then(balance => {
            let value = ethers.utils.formatUnits(balance);
            //更新余额后存入缓存
            setStorage(_balance + '_' + walletTemp.address, value);
          })
          .catch((err: any) => {
            //异常捕获一下
            console.log('get_balance err');
          });
      } else {
        // 代币 只读取数据 不用钱包签名
        try {
          const contract = new ethers.Contract(
            coinTemp.address,
            ABI,
            provider,
          );
          if (contract == null) continue;
          //名称和单位添加的时候查
          contract
            .balanceOf(walletTemp.address)
            .then((balanceOf: BigNumber) => {
              let balanceForm = ethers.utils.formatUnits(balanceOf);
              // setCoinKey({
              //   key: _balance,
              //   walletAddress: address,
              //   unit: coinTemp.unit,
              //   value: balanceForm,
              // });
              //更新余额后存入缓存
              setStorage(
                _balance + '_' + coinTemp.unit + '_' + walletTemp.address,
                balanceForm,
              );
            })
            .catch((err: any) => {
              //异常捕获一下
              console.log('get_abi_balance err');
            });
        } catch (e) {
          console.log('e', '代币不存在!');
        }
      }
    }
  }
}

const theme = createTheme({
  lightColors: {},
  darkColors: {},
});

export default function App(props: any) {
  //native 初始化模块可直接带参进来
  React.useEffect(() => {
    let nativeId = props.nativeInit;
    if (nativeId) {
      console.log("native init ", nativeId);
      NativeUtils.initNative(nativeId);
    }
    DeviceEventEmitter.addListener(HomeRefresh, async data => {
      console.log('RunableTask收到全局刷新事件', data);
      homeInit();
    });
  }, [])


  return (
    <SafeAreaView style={{flexDirection: 'row', height: '100%', width: '100%'}}>
      <WalletConnectProvider>
        <StoreProvider store={store}>
          <ThemeProvider theme={theme}>
            <AppMain/>
          </ThemeProvider>
        </StoreProvider>
      </WalletConnectProvider>
    </SafeAreaView>
  );
}
