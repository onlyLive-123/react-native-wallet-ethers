import CreateAccount from '../screen/create';
import CreateAccount1 from '../screen/createByPhrases';
import CreateAccount2 from '../screen/createByKey';
import HomeIndex from '../screen/home';
import SendTransaction from '../screen/sendTransaction';
import ConfirmTransaction from '../screen/confirmTransaction';
import ConfirmPassword from '../screen/confirmPassword';
import MnemonicIndex from '../screen/mnemonic';
import BackupsIndex from '../screen/backups';
import TxSuccess from '../screen/transactionSuccess';
import WalletInfo from "../screen/walletInfo";
import ContactIndex from "../screen/contact";
import EmptyIndex from "../screen/empty";
import TestIndex from "../screen/test";
import ItemDetail from "../screen/itemDetail";
import QrcodeScanner from "../components/QrcodeScanner";

//路由
const routerPages = [
  {name: 'Empty', title: 'empty', component: EmptyIndex, headerShown: false},
  {name: 'Home', title: '钱包', component: HomeIndex},
  {name: 'Create', title: '生成账户', component: CreateAccount},
  {
    name: 'CreateByPhrases',
    title: '使用助记词添加账户',
    component: CreateAccount1,
  },
  {name: 'CreateByKey', title: '通过私钥添加账户', component: CreateAccount2},
  {name: 'SendTransaction', title: '发送交易', component: SendTransaction},
  {name: 'ConfirmTransaction', title: '交易确认', component: ConfirmTransaction},
  {name: 'ConfirmPassword', title: '验证密码', component: ConfirmPassword},
  {name: 'Mnemonic', title: '备份助记词', component: MnemonicIndex},
  {name: 'Backups', title: '备份', component: BackupsIndex},
  {name: 'TxSuccess', title: '交易成功', component: TxSuccess, headerShown: false},
  {name: 'WalletInfo', title: '账户详情', component: WalletInfo},
  {name: 'ContactIndex', title: '选择联系人', component: ContactIndex},
  {name: 'ItemDetail', title: '转账详情', component: ItemDetail},
  {name: 'QrcodeScanner', title: '扫描二维码', component: QrcodeScanner},
  {name: 'Test', title: 'test', component: TestIndex},
];
export default routerPages;
