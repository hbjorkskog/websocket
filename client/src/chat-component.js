// @flow

import * as React from 'react';
import { Component } from 'react-simplified';
import chatService from './chat-service.js';
import { Alert, Button, ButtonPrimary, Card, Column, Form, Row } from './widgets';

export class Chat extends Component {
  subscription = null;
  connected = false;
  input = '';
  users : string[] = [];
  messages : string[] = []; 
  user = '';
  message = '';
  
  
  render() {
    return (
      <Card title={this.connected ? 'Chat (Connected)' : 'Chat (Not connected)'}>
        <Card title="Join with username">
          <Row>
              <Column width={5}>
                <Form.Input 
                  type="text" 
                  placeholder="User" 
                  value={this.user} 
                  onChange={(e) => (this.user = e.currentTarget.value)}
                  disabled={this.subscription}
                />
              </Column>
              <Column width={3}>
                <Button.Primary onClick={ () => {
                  // Subscribe to chatService to receive events fros Chat server in this component
                  if (!this.subscription) {
                    this.subscription = chatService.subscribe();

                    // Called when the subscription is ready
                    this.subscription.onopen = () => {
                      this.connected = true;
                      chatService.send({addUser: this.user})
                    };

                    // Called on incoming message
                    this.subscription.onmessage = (message) => {
                      if (message.text) this.messages.push(message.text);
                      if (message.users) this.users = message.users;
                    };

                    // Called if connection is closed
                    this.subscription.onclose = (code, reason) => {
                      this.connected = false;
                      Alert.danger('Connection closed with code ' + code + ' and reason: ' + reason);
                    };

                    // Called on connection error
                    this.subscription.onerror = (error) => {
                      this.connected = false;
                      Alert.danger('Connection error: ' + error.message);
                    };       
                }}}>
                  Log in
                </Button.Primary>
              </Column>
              <Column width={3}>
              <Button.Danger onClick={ () => {
                  // Subscribe to chatService to receive events fros Chat server in this component
                  if (this.subscription) {
                    this.connected = false;
                    
                    Alert.success('Successfully logged out');     
                }}}>Log out</Button.Danger>
              </Column>
          </Row>
        </Card>
        <Card title="Connected users">
          {this.users.map((user, i) => {
            <div key={i}>{user}</div>
            console.log({user});
          })}
        </Card>
        <Card title="Chat messages">
          <Row>
            {this.messages.map((message, i) => (  
              <div key={i}>{message}</div>
            ))}
          </Row>
          <Row>
              <Form.Input 
                width={6}
                type="text" 
                placeholder="Type your message here" 
                value={this.message} 
                onChange={(e) => (this.message = e.currentTarget.value)}
              />
              <Button.Success onClick={ () => {
                  if (this.connected) {
                    chatService.send({ text: this.user + ': ' + this.message });
                    this.message = '';
                  } else Alert.danger('Not connected to server');
              }}>Send</Button.Success>
          </Row>
        </Card>
      </Card>
    );
  }

  // Unsubscribe from chatService when component is no longer in use
  beforeUnmount() {
    chatService.unsubscribe(this.subscription);
  }
}
