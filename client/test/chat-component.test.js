// @flow

import * as React from 'react';
import { Chat } from '../src/chat-component.js';
import { shallow } from 'enzyme';

jest.mock('../src/whiteboard-service', () => {
  class Subscription {
    onopen = () => {};
  }

  class ChatService {
    constructor() {}

    subscribe() {
      const subscription = new Subscription();

      // Call subscription.onopen after subscription is returned
      setTimeout(() => subscription.onopen());

      return subscription;
    }
  }
  return new ChatService();
});

describe('Chat component tests', () => {
  test('draws correctly when connected', (done) => {
    const wrapper = shallow(<Chat />);

    expect(wrapper.containsMatchingElement(<div>Not connected</div>)).toEqual(true);

    setTimeout(() => {
      expect(wrapper.containsMatchingElement(<div>Connected</div>)).toEqual(true);
      done();
    });
  });
});
