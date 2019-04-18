import React from 'react';
import { render } from 'enzyme';
import toJson from 'enzyme-to-json';
import Layout from '../lib';

describe('自定义单测用例', () => {
  it('trigger true | false', () => {
    expect(true).toBe(true);
  });
});
