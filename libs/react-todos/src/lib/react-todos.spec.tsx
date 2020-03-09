import React from 'react';
import { render } from '@testing-library/react';

import ReactTodos from './react-todos';

describe(' ReactTodos', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactTodos />);
    expect(baseElement).toBeTruthy();
  });
});
