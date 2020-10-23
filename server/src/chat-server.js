// @flow

import WebSocket from 'ws';

// In message from client

export type ClientMessage = {| text: string |} | {| addUser: string |} | {| removeUser: string |};

// Out message from server to client

export type ServerMessage = {|  text: string |} | {| users: string[] |};

/**
 * Chat server
 */
export default class ChatServer {
  users: string[] = [];
  /**
   * Constructs a WebSocket server that will respond to the given path on webServer.
   */
  constructor(webServer: http$Server | https$Server, path: string) {
    const server = new WebSocket.Server({ server: webServer, path: path + '/chat' });

// Kopierte dette fra løsningsforslaget
    server.on('connection', (connection, request) => {
      connection.on('message', (message) => {
        if (typeof message == 'string') {
          const data: ClientMessage = JSON.parse(message);
          if (data.addUser) {
            this.users.push(data.addUser);
            const message = JSON.stringify(({ users: this.users }: ServerMessage));
            server.clients.forEach((connection) => connection.send(message));
          }
          if (data.removeUser) {
            this.users = this.users.filter((e) => e != data.removeUser);
            const message = JSON.stringify(({ users: this.users }: ServerMessage));
            server.clients.forEach((connection) => connection.send(message));
          }
          if (data.text) {
            // Send the message to all current client connections
            server.clients.forEach((connection) => connection.send(message));
          }
        }
      });  
    });
  }
}
