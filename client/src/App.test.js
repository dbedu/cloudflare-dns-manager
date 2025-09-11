// client/src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  const loginHeader = screen.getByText(/DNS Manager Login/i);
  expect(loginHeader).toBeInTheDocument();
});