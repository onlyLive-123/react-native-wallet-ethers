import {applyMiddleware, legacy_createStore as createStore} from 'redux'
import reduxThunk from 'redux-thunk'
import reducers from './reducers'

// const store = createStore(
//     reducers,
//     applyMiddleware(reduxThunk)
// )
const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
const store = createStoreWithMiddleware(reducers);

export default store;
