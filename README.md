# react-native-wallet-ethers

一款react-native + ethers + react-native-vision-camera 实现的web3钱包

如果需要测试合约,请按一下操作

1.部署合约,项目根目录下-0]

```angular2html
yarn install

truffle-config.js 里面修改为自己的地址和发布者私钥

truffle migrate --network edgechain
```

2.取出部署完的合约地址,修改下列文件

```
app/src/types/constant.tsx 修改network和合约address
```

3.正常启动

```
cd app
yarn install && yarn pods
yarn ios
```

因本项目是集成到原生使用,相机和扫描依赖是新加提交上来的,不用可以去掉.代码有支持原生相机判断
`
目前存在问题,在没有引入相机依赖安卓IOS可正常启动,引入相机依赖只能启动IOS,Android版本等待修复
`
