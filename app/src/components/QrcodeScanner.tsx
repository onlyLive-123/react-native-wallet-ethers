import * as React from 'react';

import {Alert, Dimensions, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {BarcodeFormat, useScanBarcodes} from 'vision-camera-code-scanner';


export default function App({navigation, route}: any) {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [active, setActive] = React.useState(true);
  const devices = useCameraDevices();
  const device = devices.back;
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });
  React.useEffect(() => {
    if (barcodes.length > 0) {
      setActive(false);
      const displayValue = barcodes[0].displayValue;
      navigation.goBack();
      route.params.callback(displayValue);
    }
  }, [barcodes]);

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  return (active && device && hasPermission) ? (
    <SafeAreaView>
      <View style={{height: Dimensions.get("window").height}}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
        {/*{barcodes.map((barcode, idx) => (*/}
        {/*  <Text key={idx} style={styles.barcodeTextURL}>*/}
        {/*    {barcode.displayValue}*/}
        {/*  </Text>*/}
        {/*))}*/}
      </View>

      {/*<Button title={"qrcodeScanner"} onPress={() => setActive(!active)}/>*/}
      {/*{*/}
      {/*  active ? <CameraModule hasPermission={hasPermission}/> : <Text/>*/}
      {/*}*/}
    </SafeAreaView>
  ) : (<Text/>);
}

const styles = StyleSheet.create(
  {
    barcodeTextURL: {
      marginTop: "50%",
      fontSize: 20,
      color: 'white',
      fontWeight: 'bold',
    }
  }
);
