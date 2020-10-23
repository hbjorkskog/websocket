// @flow

import * as React from 'react';
import { Component } from 'react-simplified';
import chatService from './chat-service.js';
import { Alert, Button, Card, Column, Form, Row } from './widgets';

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
              <Column width={3}>
                <Form.Input 
                  type="text" 
                  placeholder="User" 
                  value={this.user} 
                  onChange={(e) => (this.user = e.currentTarget.value)}
                />
              </Column>
              <Column>
              <Button.Primary disabled={this.subscription} onClick={ () => {
                // Subscribe to chatService to receive events fros Chat server in this component
                this.subscription = chatService.subscribe();

                // Called when the subscription is ready
                this.subscription.onopen = () => {
                  this.connected = true;
                  chatService.send({addUser: this.user})
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
                
              }}>Add user</Button.Primary>
              </Column>
          </Row>
        </Card>
        <Card title="Connected users" width={3}>
          {this.users.map((users, i) => {
            <div key={i}>{user}</div>
          })}
        </Card>
        <Card title="Chat messages">
          <Row>
            {this.messages.map((message, i) => (
              
              <div key={i}>{message}</div>
            ))}
          </Row>
          <Row>
            <Column>
              <Form.Input 
                width={6}
                type="text" 
                placeholder="Type your message here" 
                value={this.message} 
                onChange={(e) => (this.message = e.currentTarget.value)}
              />
            </Column>
            <Column>
              <Button.Success onClick={ () => {
                // Called on incoming message
                this.subscription.onmessage = (message) => {
                  if (message.text) this.messages.push(message.text);
                  if (message.users) this.users = message.users;
                };
              }}>Send</Button.Success>
            </Column>
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
