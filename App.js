import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, TextInput, Keyboard, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Alert } from 'react-native';

const activities = [
  'Yoga',
  'Reading an interesting book',
  'Folding/doing laundry',
  'Dishwashing',
  'Cleaning and organizing',
  'Gardening',
  'Cooking/meal prep',
  'Washing the car',
  'Knitting, crocheting, simple DIYs',
  'Walking/light exercise',
  'Listening to an audiobook',
  'Solve a puzzle',
  'Cleaning your computer desktop',
  'Yard work'
];

export default function App() {
  const [notificationToken, setNotificationToken] = useState(null);
  const [alarmTime, setAlarmTime] = useState(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  useEffect(() => {
    // Request permissions for notifications
    registerForPushNotificationsAsync();

    // Handle notifications when app is open
    Notifications.addNotificationReceivedListener(handleNotification);
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setNotificationToken(token);
    } else {
      console.log('Permission denied for notifications');
    }
  };

  const handleNotification = notification => {
    console.log('Received notification:', notification);
    // Handle the notification here
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDateTimePicker(false);
    if (selectedDate) {
      setAlarmTime(selectedDate);
    }
  };

  const showPicker = () => {
    setShowDateTimePicker(true);
  };

  const scheduleNotification = async () => {
    Alert.alert('Alarm Scheduled', `Break scheduled for ${alarmTime}!`);
    Keyboard.dismiss(); // Hide the keyboard
    if (alarmTime) {
      const trigger = new Date(alarmTime);
      const now = new Date();

      if (trigger > now) {
        const secondsUntilNotification = Math.round((trigger - now) / 1000);

        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Alarm',
            body: 'Break, activated!',
          },
          trigger: {
            seconds: secondsUntilNotification,
            repeats: false,
          },
        });

        console.log('Notification scheduled:', identifier);
      } else {
        console.log('Selected date and time is in the past.');
      }
    } else {
      console.log('Please select a date and time for the alarm.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Select date & time for your next break"
        value={alarmTime ? alarmTime.toString() : ''}
        editable={false}
        onTouchStart={showPicker}
      />
      {showDateTimePicker && (
        <DateTimePicker
          value={alarmTime ? alarmTime : new Date()}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={styles.header}>Activities:</Text>
      <View>
        {activities.map((activity, index) => (
          <Text key={index}>{`\u2022 ${activity}`}</Text>
        ))}
      </View>
      <Button title="Schedule A Break" onPress={scheduleNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    textAlign: 'center',
  },
});
