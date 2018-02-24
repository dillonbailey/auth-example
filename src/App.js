import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify, { Analytics, Auth } from 'aws-amplify';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import aws_exports from './aws-exports';

import Login from  "./Auth/Login";
import Main from "./Main";


Amplify.configure(aws_exports);

const PublicRoute = ({ component: Component, authStatus, ...rest}) => (
    <Route {...rest} render={props => authStatus === false
        ? ( <Component {...props} /> ) : (<Redirect to="/main" />)
    } />
)

const PrivateRoute = ({ component: Component, authStatus, ...rest}) => (
    <Route {...rest} render={props => authStatus === false
        ? ( <Redirect to="/login" /> ) : ( <Component {...props} /> )
    } />
)

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authStatus: this.props.authStatus || false,
    };

    this.handleWindowClose = this.handleWindowClose.bind(this);

    Auth.currentSession().then(d => console.log(d)).catch(err => console.log(err));
  }

  handleWindowClose = async (e) => {
      e.preventDefault();
      Auth.signOut()
        .then(
            sessionStorage.setItem('isLoggedIn', false),
            this.setState(() => {
                return {
                    authStatus: false
                }
            })
        )
        .catch(err => console.log(err))
  }

  componentWillMount() {
      this.validateUserSession();
      window.addEventListener('beforeunload', this.handleWindowClose);
  }

  componentWillUnMount() {
      window.removeEventListener('beforeunload', this.handleWindowClose);
  }

  validateUserSession() {
    let checkIfLoggedIn = sessionStorage.getItem('isLoggedIn');
    if(checkIfLoggedIn === 'true'){
        this.setState(() => {
            return {
                authStatus: true
            }
        })
    } else {
        this.setState(() => {
            return {
                authStatus: false
            }
        })
    }
  }

  render() {
    Analytics.record('appRender');

    return (
      <div className="App">
        <BrowserRouter>
          <Switch>
            <PublicRoute authStatus={this.state.authStatus} path='/' exact component={Login} />
            <PrivateRoute authStatus={this.state.authStatus} path='/main' component={Main} />
            <Route render={() => (<Redirect to="/" />)} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}