// @flow

// In message from client

export type ClientMessage = {| text: string |} | {| addUser: string |} | {| removeUser: string |};

// Out Message from server to client

export type ServerMessage = {| text: string |} | {| users: string[] |};

/**
 * Subscription class that enables multiple components to receive events from Chat server.
 */
export class Subscription {
  onopen: () => mixed = () => {};
  onmessage: (ServerMessage) => mixed = () => {};
  onclose: (code: number, reason: string) => mixed = () => {};
  onerror: (error: Error) => mixed = () => {};
}

/**
 * Service class to communicate with Chat server.
 *
 * Variables and functions marked with @private should not be used outside of this class.
 */
class ChatService {
  /**
   * Connection to Chat server.
   *
   * @private
   */
  connection = new WebSocket('ws://localhost:3000/api/v1/chat');
  /**
   * Component subscriptions.
   *
   * @private
   */
  subscriptions = new Set<Subscription>();

  constructor() {
    this.connection.onopen = () => {
      // Call subscription onopen functions when connection is ready
      this.subscriptions.forEach((subscription) => subscription.onopen());
    };

    this.connection.onmessage = (event) => {
      // Call subscription onmessage functions on messages from Chat server
      const data = event.data;
      if (typeof data == 'string')
        this.subscriptions.forEach((subscription) => subscription.onmessage(JSON.parse(data)));
    };

    this.connection.onclose = (event) => {
      // Call subscription onclose functions when connection is closed
      this.subscriptions.forEach((subscription) => subscription.onclose(event.code, event.reason));
    };

    this.connection.onerror = () => {
      // Call subscription onerror functions on connection error
      const error = this.createError();
      this.subscriptions.forEach((subscription) => subscription.onerror(error));
    };
  }

  /**
   * Create Error object with more helpful information from connection ready state.
   *
   * @private
   */
  createError() {
    if (this.connection.readyState == WebSocket.CLOSING)
      return new Error('The connection is in the process of closing.');
    else if (this.connection.readyState == WebSocket.CLOSED)
      return new Error("The connection is closed or couldn't be opened.");
    else return new Error();
  }

  /**
   * Returns a subscription that enables multiple components to receive events from Chat server.
   */
  subscribe() {
    const subscription = new Subscription();
    this.subscriptions.add(subscription);

    // Call subscription.onopen or subscription.onerror() after subscription is returned
    setTimeout(() => {
      // Call subscription.onopen() if connection is already opened
      if (this.connection.readyState == WebSocket.OPEN) subscription.onopen();
      // Call subscription.onerror() if connection is already in a closing or closed state
      else if (
        this.connection.readyState == WebSocket.CLOSING ||
        this.connection.readyState == WebSocket.CLOSED
      )
        subscription.onerror(this.createError());
    });

    return subscription;
  }

  /**
   * Given subscription will no longer receive events from Chat server.
   */
  unsubscribe(subscription: ?Subscription) {
    if (subscription) this.subscriptions.delete(subscription);
  }

  /**
   * Send message to Chat server.
   */
  send(message: ClientMessage) {
    this.connection.send(JSON.stringify(message));
  }
}

const chatService = new ChatService();
export default chatService;
