// @flow

import * as React from 'react';
import { Component } from 'react-simplified';
import chatService from './chat-service.js';
import { Alert } from './widgets';

export class Chat extends Component {
  canvas = null;
  lastPos: ?{ x: number, y: number } = null;
  subscription = null;
  connected = false;

  render() {
    return (
      <>
        <h3>{this.connected ? 'Chat (Connected)' : 'Chat (Not connected)'}</h3>
        <canvas
          ref={(e) => (this.canvas = e) /* Store canvas element */}
          onMouseMove={(event: SyntheticMouseEvent<HTMLCanvasElement>) => {
            // Send lines ts Chat server
            const pos = { x: event.clientX, y: event.clientY };
            if (this.lastPos && this.connected) {
              chatService.send({ line: { from: this.lastPos, to: pos } });
            }
            this.lastPos = pos;
          }}
          width={400}
          height={400}
          style={{ border: '2px solid black' }}
        />
        
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
