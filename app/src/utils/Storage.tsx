import AsyncStorage from "@react-native-async-storage/async-storage";

export const getStorage = async (key: string) => {
  return getLocalStorage(key, false, false);
}

export const getStorageToJson = async (key: string) => {
  return getLocalStorage(key, true, false);
}

export const getStorageToArr = async (key: string) => {
  return getLocalStorage(key, false, true);
}

export const getLocalStorage = async (key: string, isJson: boolean, isArr: boolean) => {
  let value;
  try {
    const cache: any = await AsyncStorage.getItem(key);
    if (isJson || isArr) {
      if (cache) {
        value = JSON.parse(cache);
      } else {
        value = isJson ? {} : [];
      }
    } else {
      value = cache;
    }
    return value;
  } catch (err) {
    console.log("获取缓存异常:", err);
    return null;
  }
}


export const setStorage = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.log("err", err);
  }
}


export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (err) {
    console.log("err", err);
  }
}

export const delStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.log("err", err);
  }
}
