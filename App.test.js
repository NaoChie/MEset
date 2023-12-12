import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import App from './App';

describe('App Component', () => {
  test('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    
    // Check if key components are rendered
    expect(getByText('Select date & time for your next break')).toBeDefined();
    expect(getByPlaceholderText('Add New Activity')).toBeDefined();
    expect(getByText('Try one of these today...')).toBeDefined();
  });

  test('schedules a notification', async () => {
    const { getByText } = render(<App />);
    
    // Mock functions and values
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2023-01-01T12:00:00Z'));
    jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => 'January 1, 2023 12:00 PM');
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({ json: () => ({ data: 'dummyToken' }) });
    jest.spyOn(global, 'alert').mockImplementation(() => {});

    // Trigger notification button
    fireEvent.press(getByText('Schedule'));

    // Wait for notification scheduling process
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Alarm Scheduled',
        'Break scheduled for January 1, 2023 12:00 PM!'
      );
    });
  });

  test('toggles menu visibility', async () => {
    const { getByText } = render(<App />);

    // Check initial state
    expect(getByText('Show Menu')).toBeDefined();

    // Toggle the menu
    fireEvent.press(getByText('Show Menu'));

    // Check updated state
    await waitFor(() => {
      expect(getByText('Hide Menu')).toBeDefined();
    });

    // Toggle the menu again
    fireEvent.press(getByText('Hide Menu'));

    // Check final state
    await waitFor(() => {
      expect(getByText('Show Menu')).toBeDefined();
    });
  });

  // Add more tests based on specific functionalities and scenarios
});
