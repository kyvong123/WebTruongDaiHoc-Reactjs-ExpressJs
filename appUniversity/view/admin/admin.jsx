import './scss/bootstrap/bootstrap.scss';
import './scss/admin/main.scss';
import './admin.scss';

import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = '/js/plugins/pdf.worker.min.js';
import T from '../js/common';
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import AdminHeader from 'view/component/AdminHeader';
import AdminMenu from 'view/component/AdminMenu';
import MessagePage from 'view/component/MessagePage';

import { getSystemState, updateSystemState } from 'modules/_default/_init/reduxSystem';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import { componentModules } from 'view/component/tComponent';
import { modules } from './modules.jsx';
const reducers = {}, reducerContainer = {}, routeMapper = {},
    addRoute = route => routeMapper[route.path] = <Route key={route.path} exact {...route} />;
componentModules.forEach(module => module.init && module.init());
modules.forEach(module => {
    module.routes.forEach(route => route.path.startsWith('/user') && addRoute(route));

    if (module.redux) {
        if (module.redux.parent && module.redux.reducers) {
            if (!reducerContainer[module.redux.parent]) reducerContainer[module.redux.parent] = {};
            reducerContainer[module.redux.parent] = Object.assign({}, reducerContainer[module.redux.parent], module.redux.reducers);
        } else {
            Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
        }
    }
});
import extraReducers from './admin.reducer';
extraReducers.forEach(redux => {
    if (redux.parent && redux.reducers) {
        if (!reducerContainer[redux.parent]) reducerContainer[redux.parent] = {};
        reducerContainer[redux.parent] = Object.assign({}, reducerContainer[redux.parent], redux.reducers);
    } else {
        Object.keys(redux).forEach(key => reducers[key] = redux[key]);
    }
});
Object.keys(reducerContainer).forEach(key => reducers[key] = combineReducers(reducerContainer[key]));

const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
T.template = 'admin';
window.T = T;

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    state = { routes: [] };

    componentDidMount() {
        const routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);
        this.props.getSystemState(() => this.setState({ routes }));

        T.socket.on('debug-user-changed', user => {
            store.dispatch(updateSystemState({ user }));
        });

        T.socket.on('debug-role-changed', roles => {
            if (this.props.system && this.props.system.isDebug) {
                this.props.updateSystemState({ roles });
            }
        });
    }

    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                    <AdminHeader />
                    <AdminMenu />
                    <div className='site-content'>
                        <Switch>
                            {this.state.routes}
                            <Route path='**'><MessagePage ignorePrefix={[]} /></Route>
                        </Switch>
                    </div>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { updateSystemState, getSystemState })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('app'));
