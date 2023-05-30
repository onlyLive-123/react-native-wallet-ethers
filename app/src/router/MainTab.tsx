import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Alert, Text, TouchableOpacity} from 'react-native';
import HomeScreen from '../screen/home/index';
import React from "react";


const Tab = createBottomTabNavigator();

export default function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName = '';
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name == 'UserTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        // headerShown: false
      })}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: '首页',
          headerRight: () => (
            <TouchableOpacity onPress={() => Alert.alert('切换网络')}>
              <Text style={{marginRight: 10}}>切换网络</Text>
            </TouchableOpacity>
          ),
        }}
      />
      {/*<Tab.Screen*/}
      {/*  name="UserTab"*/}
      {/*  component={UserScreen}*/}
      {/*  options={{*/}
      {/*    title: '我的',*/}
      {/*  }}*/}
      {/*/>*/}
    </Tab.Navigator>
  );
}
