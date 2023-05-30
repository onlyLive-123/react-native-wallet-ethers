import {TouchableOpacity, View} from 'react-native';
import NativeUtils from '../utils/NativeUtils';
import {Icon} from '@rneui/themed';
import React from 'react';

const HeaderLeft = ({nav}: any) => {
  return (
    <TouchableOpacity
      onPress={() => {
        NativeUtils.closeReact();
        NativeUtils.clearRoute(nav);
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon
          name="close-outline"
          type="ionicon"
          size={28}
          color="#000"
          style={{marginLeft: 10}}
        />
      </View>
    </TouchableOpacity>
  );
};

export default HeaderLeft;
