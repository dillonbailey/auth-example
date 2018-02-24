/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

import logo from '../logo.svg';

import React, { Component } from 'react';
import { Row } from 'react-materialize';
import { Button, Input, Form, Label, Grid } from 'semantic-ui-react';
import { Auth } from 'aws-amplify';

import App from '../App';

export default class Login extends Component {
    state = {
        username: `${Math.floor(Math.random() * 1000)}`,
        password: '9!41#DSu^&&1UXs',
        code: '',
        verificationCode: '',
        logInStatus: false,
        invalidCodeMessage: '',
        cognitoUser: '',
        enterAuth: false,
        authSuccess: false,
        email: '',
    };

    handleError = err => {
      console.log(err);
      alert(JSON.stringify(err));
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const username = this.state.username.trim();
        const password = this.state.password.trim();
        const email = this.state.email.trim();

        Auth.signUp(username, password, email)
          .then(() => {
            this.setState(() => {
              return {
                enterAuth: true
              }
            })
          })
          .catch( err => this.handleError(err))
    }

    handleSubmitVerification = async (e) => {
        debugger;
        e.preventDefault();
        const verificationCode = this.state.code;
        const username = this.state.username;
        Auth.confirmSignUp(username, verificationCode)
          .then(data => {
            Auth.signIn(this.state.username, this.state.password)
              .then(data => {
                sessionStorage.setItem('isLoggedIn', true);

                this.setState(() => ({
                    cognitoUser: data,
                    logInStatus: true,
                    authSuccess: true,
                  })
                );
              })
              .catch(err => this.handleError(err));
          })
          .catch( err => this.handleError(err));
    }

    render() {
        const {
          logInStatus,
          invalidCodeMessage
        } = this.state;
        return (
          <div>

          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <Grid container>
            <Grid.Column mobile={16}>
                { !logInStatus && !this.state.enterAuth && (
                  <div>
                      <div className="fill-in">
                          <Row>
                            <Form>
                              <Form.Field>
                                  <Input type="text" icon="at" iconPosition="left" placeholder="E-mail Address"
                                      onChange = {(event) => this.setState({
                                        email:event.target.value,
                                        invalidCredentialsMessage: ''
                                      })} />
                              </Form.Field>
                            </Form>
                          </Row>
                      </div>
                      <Button primary fluid onClick={this.handleSubmit}>Login</Button>
                  </div>
                )}
                {this.state.enterAuth && !this.state.authSuccess && (
                  <div>
                      <div className="fill-in">
                          <Row>
                            <Form>
                              <Form.Field>
                                <Input type="text" icon="unlock alternate" iconPosition="left" placeholder="Verification Code"
                                onChange = {(event) => this.setState({code:event.target.value, invalidCodeMessage: ''})} />
                                { invalidCodeMessage && <Label basic color="red" pointing="left">Invalid verfication code</Label> }
                              </Form.Field>
                            </Form>
                          </Row>
                      </div>
                      <div className="button-holder">
                          <Button primary fluid onClick={ this.handleSubmitVerification }>Confirm</Button>
                      </div>
                  </div>
                )}
                { logInStatus && (<App authStatus={true} />)}
              </Grid.Column>
            </Grid>
          </div>
        );
    }
}
