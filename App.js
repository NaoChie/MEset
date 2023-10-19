import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, TextInput, Keyboard, Text, TouchableOpacity, Image } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Alert } from 'react-native';

function formatAlarmTime(date) {
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return date.toLocaleString(undefined, options);
}

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

const getRandomActivities = () => {
  const shuffledActivities = activities.sort(() => 0.5 - Math.random());
  return shuffledActivities.slice(0, 3);
};

export default function App() {
  const [notificationToken, setNotificationToken] = useState(null);
  const [alarmTime, setAlarmTime] = useState(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [randomActivities, setRandomActivities] = useState([]);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    registerForPushNotificationsAsync();
    Notifications.addNotificationReceivedListener(handleNotification);
    setRandomActivities(getRandomActivities());
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
    setCountdown(15 * 60); // Start the 15-minute countdown
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDateTimePicker(false);
    if (selectedDate) {
      setAlarmTime(selectedDate);
    }
  };

  const regenerateRandomActivities = () => {
    setRandomActivities(getRandomActivities());
  };

  const showPicker = () => {
    setShowDateTimePicker(true);
  };

  const scheduleNotification = async () => {
    if (alarmTime) {
      const trigger = new Date(alarmTime);
      const now = new Date();

      if (trigger > now) {
        Alert.alert('Alarm Scheduled', `Break scheduled for ${formatAlarmTime(alarmTime)}!`);
        Keyboard.dismiss();

        const secondsUntilNotification = Math.round((trigger - now) / 1000);

        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Alarm',
            body: 'Break, activated! Pick an activity now.',
          },
          trigger: {
            seconds: secondsUntilNotification,
            repeats: false,
          },
        });

        console.log('Notification scheduled:', identifier);
      } else {
        console.log('Selected date and time is in the past.');
        Alert.alert('Failed.', `Selected date and time is in the past.`);
      }
    } else {
      console.log('Please select a date and time for the alarm.');
      Alert.alert('Please select a date and time for the alarm.');
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const countdownInterval = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
        if (countdown === 0) {
          Alert.alert('Time flew by.', '15 minutes has passed.', 'Please schedule another break!');
        }
      };
    }
  }, [countdown]);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('./Logo.png')}
          style={styles.image}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Select date & time for your next break"
        value={alarmTime ? formatAlarmTime(alarmTime) : ''}
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
      <Button title="Schedule" onPress={scheduleNotification} />
      <Text style={styles.header}>Try one of these today...</Text>
      <View>
        {randomActivities.map((activity, index) => (
          <Text key={index}>{`\u2022 ${activity}`}</Text>
        ))
        }
      </View>

      <TouchableOpacity onPress={regenerateRandomActivities} style={styles.regenerateButton}>
        <Text style={styles.regenerateButtonText}>Regenerate</Text>
      </TouchableOpacity>
      
      <View>
        {countdown > 0 && (
          <Text style={styles.countdownText}>{`${Math.floor(countdown / 60)}:${countdown % 60} More minutes! You can do it.`}</Text>
        )}
      </View>
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
  imageContainer: {
    marginBottom: 10,
  },
  image: {
    width: 400,
    height: 150,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    textAlign: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  regenerateButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  regenerateButtonText: {
    color: 'white',
    fontSize: 16,
  },
  countdownText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
});
