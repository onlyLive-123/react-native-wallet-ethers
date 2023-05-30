import {Text} from '@rneui/base';
import {StyleSheet, View, TextInput, TextInputProps} from 'react-native';
import React from "react";

interface InputProps extends TextInputProps {
  label?: string;
  rightIcon?: React.ReactElement<{}>;
}

const Input = (props: InputProps) => {
  return (
    <View style={[styles.container, props.label && {marginBottom: 8}]}>
      {props.label && <Text style={styles.label}>{props.label}</Text>}
      <View
        style={[
          styles.input_container,
          props.multiline && {
            height: 80,
            paddingVertical: 6,
          },
        ]}>
        <TextInput style={[styles.input]} {...props}></TextInput>
        {props.rightIcon}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    paddingVertical: 8,
    color: '#333',
    fontSize: 14,
  },
  input_container: {
    borderRadius: 12,
    height: 45,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8eef2',
  },
  input: {
    padding: 0,
    flex: 1,
    alignSelf: 'stretch',
    color: 'black',
  },
});

export default Input;
