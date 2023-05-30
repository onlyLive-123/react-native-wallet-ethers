import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import Input from '../../components/Input';
import {Icon} from '@rneui/base';
import {Button} from '@rneui/themed';
import React from "react";
import {_password} from "../../types/constant";
import {getStorage} from "../../utils/Storage";

export default ({navigation, route}: any) => {
  const [secureText, setSecureText] = React.useState(true);
  const [eyeState, setEyeState] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    console.log("confirmPassword useEffect");
    //初始化
    pageInit();

  }, [])

  const pageInit = async () => {

  }

  const eysClick = () => {
    setEyeState(!eyeState);
    setSecureText(!secureText);
  }

  const onChangeText = (type: number, text: string) => {
    if (type == 1) {
      setPassword(text);
    }
  }

  const checkPassword = async () => {
    setLoading(true);
    try {
      if (!password) return Alert.alert("密码不能为空!");
      //取出缓存中的密码
      let cachePassword: string = await getStorage(_password);
      if (password != cachePassword) {
        return Alert.alert("密码错误", "请输入您设置的钱包密码");
      }
      //验证完回调
      await route.params.callback();
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollview}>
        <Input
          value={password}
          onChangeText={text => onChangeText(1, text)}
          label="验证密码以继续"
          placeholder="验证您的密码"
          keyboardType="ascii-capable"
          secureTextEntry={secureText}
          rightIcon={
            // "eye-outline"
            <Icon type="ionicon" onPress={eysClick} size={18}
                  name={eyeState ? "eye-outline" : "eye-off-outline"}/>
          }
        />

        <Button
          title="验证"
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
          onPress={checkPassword}
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
