import {Text, View} from "react-native";
import React from "react";
import {Button} from "@rneui/base";
import {connect} from "react-redux";
import {setWallets, setWalletValue} from "../../redux/actions/WalletsStore";
import {Wallet} from "../../types";
import {setWalletKey} from "../../redux/actions/TestMap";
// import {Camera, useCameraDevices} from "react-native-vision-camera";


const mapStateToProps = (state: any) => {
  return {
    wallets: state.WalletsStore,
    testMap: state.TestMap
  }
}


const TestIndex = ({
                     navigation,
                     route,
                     wallets,
                     testMap,
                     setWalletKey,
                     setWalletValue
                   }: {
  navigation: any,
  route: any,
  wallets: Wallet[],
  testMap: Wallet,
  setWalletKey: any,
  setWalletValue:any
}) => {
  const [testAddr, setTestAddr] = React.useState("");

  React.useEffect(() => {
    console.log("123454321")
    setTestAddr(testMap.address);
  }, [testMap])


  const onAdd = () => {
    // wallets[0].address = "12345432123432123";
    // setWallets(wallets);
    setWalletValue("address", {
      "address": "0xD3f3c1f8D0FbCf030ba685425D6449b2443c9d55",
      value: "222222"
    });
    setWalletKey("address", "23232");
  }

  return (
    <View>
      <Text>{wallets[0].address}</Text>
      <Text>{testMap.address}</Text>
      <Text>{testAddr}</Text>
      <Button style={{marginVertical: 10}} title={"permission"} onPress={onAdd}/>
      <Button title={"open camera"}/>
    </View>
  )
}

export default connect(mapStateToProps, {setWallets, setWalletValue, setWalletKey})(TestIndex);
