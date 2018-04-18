'use strict';
import { describe, it } from 'mocha';
import expect from 'expect';
import reducer from '../../src/app/redux/ducks/bots';

describe('bots reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('should handle ADD_BOT', () => {
    const action = {
      type: 'ADD_BOT',
      payload: {
        name: '@foo',
        avatar: { emoji: '🐨' }
      }
    };
    const expected = {
      '@foo': {
        name: '@foo',
        avatar: { emoji: '🐨' },
        currentMessage: '',
        messages: []
      }
    };
    expect(reducer({}, action)).toEqual(expected);
  });
});
