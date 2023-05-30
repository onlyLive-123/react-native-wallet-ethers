// 判断真假
import {Clipboard} from "react-native";

export function isEmpty(val: any) {
  if (val == null || typeof (val) === 'undefined' || val === undefined || val === 'undefined' || ('' + val)
      .toUpperCase() ===
    'NULL' || '' + val === '') {
    return true;
  }
  if (typeof val === 'boolean') {
    return !val;
  }
  if (val instanceof Error) return val.message === '';
  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case '[object String]':
    case '[object Array]':
      return !val.length;
    case '[object File]':
    case '[object Map]':
    case '[object Set]':
      return !val.size;
    case '[object Object]':
      return !Object.keys(val).length;
  }

  return false;
}

// 格式化时间的格式
export function dateFormat(date: Date, format: string) {
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  };
  if (/([Yy]+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return format;
}

export function toFixed(number: any) {
  return toNumberFixed(number, 2);
}

export function toNumberFixed(number: any, decimal: number) {
  if (!number) return "0.00";
  if (typeof number == "string") {
    number = parseFloat(number);
  }
  let decimalNumber = 10 ** decimal;
  let value = (number * decimalNumber).toFixed(decimal);
  value = (parseInt(value) / decimalNumber).toFixed(decimal);
  return value;
}

//获取粘贴板
export async function fetchCopiedText() {
  try {
    const text = await Clipboard.getString();
    return text;
  } catch (e) {
    console.log("获取剪贴板异常", e);
    return null;
  }
}


export async function copyToClipboard(text: string) {
  try {
    Clipboard.setString(text);
    return true;
  } catch (e) {
    console.log("复制到剪贴板异常", e);
    return false;
  }

}

