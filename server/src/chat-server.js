// @flow

import WebSocket from 'ws';

// In message from client

export type ClientMessage = { addUser: string} | {removeUser: string} | {message: string};

// Out Message from server to client

export type ServerMessage = { users: string[] } | { user: string, message: string };

/**
 * Chat server
 */
export default class ChatServer {
  /**
   * Constructs a WebSocket server that will respond to the given path on webServer.
   */
  constructor(webServer: http$Server | https$Server, path: string) {
    const server = new WebSocket.Server({ server: webServer, path: path + '/chat' });

    server.on('connection', (connection, request) => {
      connection.on('message', (message) => {
        // Send the message to all current client connections
        server.clients.forEach((connection) => connection.send(message));
      });
    });
  }
}
