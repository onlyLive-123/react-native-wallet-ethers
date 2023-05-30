import {ActionSheetIOS, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Avatar, ListItem} from "@rneui/themed";
import React from "react";
import {isEmpty} from "../../utils/Utils";
import NativeUtils from "../../utils/NativeUtils";

const ContactIndex = ({navigation, route}: any) => {

  const [contacts, setContacts] = React.useState<any>([
    // {
    //   name: "张三",
    //   nativeId: 12234,
    //   addressList: [
    //     {
    //       name: "主账户",
    //       address: "0x71b0c3b4f7e0a00accb7ddf4a65117a682860081"
    //     },
    //     {
    //       name: "account1",
    //       address: "1x71b0c3b4f7e0a00accb7ddf4a65117a682860082"
    //     },
    //     {
    //       name: "私人导入",
    //       address: "2x71b0c3b4f7e0a00accb7ddf4a65117a682860083"
    //     }
    //   ]
    // },
    // {
    //   name: "李四",
    //   nativeId: 12234,
    //   addressList: [
    //     {
    //       name: "主账户",
    //       address: "3x71b0c3b4f7e0a00accb7ddf4a65117a68286008c"
    //     }
    //   ]
    // }
  ]);
  const [noData, setNoData] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // [
  // {
  //   name: "张三",
  //   nativeId: 12234,
  //   addressList: [
  //     {
  //       name: "主账户",
  //       address: "0x71b0c3b4f7e0a00accb7ddf4a65117a682860081"
  //     },
  //     {
  //       name: "account1",
  //       address: "1x71b0c3b4f7e0a00accb7ddf4a65117a682860082"
  //     },
  //     {
  //       name: "私人导入",
  //       address: "2x71b0c3b4f7e0a00accb7ddf4a65117a682860083"
  //     }
  //   ]
  // },
  // {
  //   name: "李四",
  //   nativeId: 12234,
  //   addressList: [
  //     {
  //       name: "主账户",
  //       address: "3x71b0c3b4f7e0a00accb7ddf4a65117a68286008c"
  //     }
  //   ]
  // }
  // ]


  React.useEffect(() => {
    setLoading(true);
    //从native获取联系人
    NativeUtils.getWalletContact((result: any) => {
      setLoading(false)
      setContacts(result);
      if (result.length == 0) setNoData(true);
    })
  }, []);


  const clickListItem = (item: { name: string, nativeId: number, addressList: { name: string, address: string }[] }) => {
    const params: any = {
      name: item.name,
      nativeId: item.nativeId
    };
    let addressList = item.addressList;
    if (addressList.length == 1) {
      params["address"] = addressList[0].address;
      route.params.callback(params);
      navigation.goBack();
    } else {
      const strArr = [];
      addressList.forEach((item, index) => {
        strArr.push(item.name + " (" + addressList[index].address.substring(38) + ")");
      })
      strArr.push("关闭");
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: strArr,
          // destructiveButtonIndex: 3,
          cancelButtonIndex: strArr.length - 1,
        },
        buttonIndex => {
          if (buttonIndex == strArr.length - 1) return;
          params["address"] = addressList[buttonIndex].address;
          route.params.callback(params);
          navigation.goBack();
        }
      )
    }
  }
  return (
    <View style={{backgroundColor: "white", height: "100%"}}>
      {loading ?
        <View style={styles.viewCenter}>
          <ActivityIndicator size={"large"}/>
          <Text style={{fontSize: 20, color: "#999"}}>加载中...</Text>
        </View>
        : ""
      }
      {(isEmpty(contacts) && noData) ?
        <View style={styles.viewCenter}>
          <Text>暂无可用联系人</Text>
        </View>
        :
        contacts.map((item: any, index: number) =>
          <TouchableOpacity key={index} onPress={() => clickListItem(item)}>
            <ListItem bottomDivider>
              <Avatar
                rounded
                icon={{name: 'person-outline', type: 'ionicon', size: 26,}}
                containerStyle={{backgroundColor: '#c2c2c2'}}
              />
              <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
                <ListItem.Subtitle>
                  {item.addressList[0].address.substring(0, 5)}...
                  {item.addressList[0].address.substring(37)}
                </ListItem.Subtitle>
              </ListItem.Content>
              {item.addressList.length > 1 ? <ListItem.Chevron color="black"/> : <Text/>}
            </ListItem>
          </TouchableOpacity>
        )
      }
    </View>
  )
}

export default ContactIndex;

const styles = StyleSheet.create({
  viewCenter: {height: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center"}
})
