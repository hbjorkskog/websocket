// @flow

import ReactDOM from 'react-dom';
import * as React from 'react';
import { ChatMessage } from './chat-component.js';
import { Alert } from './widgets';

const root = document.getElementById('root');
if (root)
  ReactDOM.render(
    <>
      <Alert />
      <ChatMessage />
    </>,
    root
  );
