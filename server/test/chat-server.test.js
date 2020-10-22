// @flow

import http from 'http';
import WebSocket from 'ws';
import ChatService from '../src/chat-server.js';

let webServer;
beforeAll((done) => {
  webServer = http.createServer();
  const chatServer = new ChatService(webServer, '/api/v1');
  // Use separate port for testing
  webServer.listen(3001, () => done());
});

afterAll((done) => {
  if (!webServer) return done.fail(new Error());
  webServer.close(() => done());
});

describe('ChatService tests', () => {
  test('Connection opens successfully', (done) => {
    const connection = new WebSocket('ws://localhost:3001/api/v1/chat');

    connection.on('open', () => {
      connection.close();
      done();
    });

    connection.on('error', (error) => {
      done.fail(error);
    });
  });

  test('ChatService replies correctly', (done) => {
    const connection = new WebSocket('ws://localhost:3001/api/v1/chat');

    connection.on('open', () => connection.send('test'));

    connection.on('message', (data) => {
      expect(data).toEqual('test');
      connection.close();
      done();
    });

    connection.on('error', (error) => {
      done.fail(error);
    });
  });
});
