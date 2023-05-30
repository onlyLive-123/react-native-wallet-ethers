import {Dimensions, Text, View} from "react-native";
import {Button} from "@rneui/base";
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from "react";



export default function HomeIndex({route, navigation}:any) {
    return (
        <View style={{height: '100%', width: '100%'}}>
            {/*<Button*/}
            {/*    radius={'lg'} type="solid" size={'sm'}*/}
            {/*    containerStyle={{*/}
            {/*        width: Dimensions.get('window').width / 3,*/}
            {/*        marginHorizontal: 5,*/}
            {/*        marginVertical: 5*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <Ionicons name={"person"} color={"white"} size={18}/>*/}
            {/*    暂无用户*/}
            {/*</Button>*/}
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text>暂无钱包</Text>
                <Button
                    size={'md'} type="solid"
                    containerStyle={{
                        width: Dimensions.get('window').width / 3,
                        marginVertical: 10
                    }}
                    onPress={() => navigation.navigate("Create")}
                >
                    <Ionicons name={"add"} color={"white"} size={24}/>
                    ETH钱包
                </Button>
                <Button
                    size={'md'} type="solid"
                    containerStyle={{
                        width: Dimensions.get('window').width / 3,
                        marginVertical: 10
                    }}
                    onPress={() => navigation.navigate("Contract")}
                >
                    <Ionicons name={"chatbubble"} color={"white"} size={24}/>
                    合约测试
                </Button>
                <Button
                    size={'md'} type="solid"
                    containerStyle={{
                        width: Dimensions.get('window').width / 3,
                        marginVertical: 10
                    }}
                    onPress={() => navigation.navigate("Bitcoin")}
                >
                    <Ionicons name={"wallet"} color={"white"} size={24}/>
                    BTC钱包
                </Button>
            </View>

        </View>
    )
}
