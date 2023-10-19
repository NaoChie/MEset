import { registerForPushNotificationsAsync } from './App.js'; // Import the function you want to test

// Mock the Notifications module
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'fake-push-token' })),
}));

describe('registerForPushNotificationsAsync', () => {
  it('should set notification token when permission is granted', async () => {
    // Mock the setNotificationToken function
    const setNotificationToken = jest.fn();

    // Call function
    await registerForPushNotificationsAsync(setNotificationToken);

    // Expect that requestPermissionsAsync was called
    expect(require('expo-notifications').requestPermissionsAsync).toHaveBeenCalled();

    // Expect that getExpoPushTokenAsync was called
    expect(require('expo-notifications').getExpoPushTokenAsync).toHaveBeenCalled();

    // Expect that setNotificationToken was called with the correct token
    expect(setNotificationToken).toHaveBeenCalledWith('fake-push-token');
  });

  it('should log an error message when permission is denied', async () => {
    // Mock the console.log function
    global.console.log = jest.fn();

    // Mock requestPermissionsAsync to return denied status
    require('expo-notifications').requestPermissionsAsync.mockImplementationOnce(() =>
      Promise.resolve({ status: 'denied' })
    );

    // Call the function
    await registerForPushNotificationsAsync();

    // Expect that requestPermissionsAsync was called
    expect(require('expo-notifications').requestPermissionsAsync).toHaveBeenCalled();

    // Expect that console.log was called with the error message
    expect(global.console.log).toHaveBeenCalledWith('Permission denied for notifications');
  });
});
