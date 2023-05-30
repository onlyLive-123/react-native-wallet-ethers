const EzlcCoin = artifacts.require("EzlcCoin");
const MzlcCoin = artifacts.require("MzlcCoin");
const QzlcCoin = artifacts.require("QzlcCoin");

module.exports = function (deployer) {
    //100000 * 1018 发行10W个
    deployer.deploy(EzlcCoin,"100000000000000000000000");
    deployer.deploy(MzlcCoin,"100000000000000000000000");
    deployer.deploy(QzlcCoin,"100000000000000000000000");
};
