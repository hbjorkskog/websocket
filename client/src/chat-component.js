// @flow

import * as React from 'react';
import { Component } from 'react-simplified';
import chatService from './chat-service.js';
import { Alert, ButtonSuccess } from './widgets';

export class ChatMessage extends Component {
  subscription = null;
  connected = false;
  input = '';

  render() {
    return (
      <>
        <h3>{this.connected ? 'Chat (Connected)' : 'Chat (Not connected)'}</h3>
        <input type="text" id="messageBox" placeholder="Type your text here"/>
        <ButtonSuccess onClick={ () => (console.log('Clicked Send button'))} >Send message</ButtonSuccess>   
      </>
    );
  }

  mounted() {
    // Subscribe to chatService to receive events fros Chat server in this component
    this.subscription = chatService.subscribe();

    // Called when the subscription is ready
    this.subscription.onopen = () => {
      this.connected = true;
    };

    // Called on incoming message
    this.subscription.onmessage = (message) => {
      if (this.canvas) {
        const context = this.canvas.getContext('2d');
        context.beginPath();
        context.moveTo(message.line.from.x, message.line.from.y);
        context.lineTo(message.line.to.x, message.line.to.y);
        context.closePath();
        context.stroke();
      }
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
  }

  // Unsubscribe from chatService when component is no longer in use
  beforeUnmount() {
    chatService.unsubscribe(this.subscription);
  }
}
