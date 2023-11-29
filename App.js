import React, { useState, useEffect, useRef} from 'react';
import { View, Button, StyleSheet, TextInput, Keyboard, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';


function formatAlarmTime(date) { // Function that formats date and time, returned in order
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

const activities = [ // Can be edited. Ideas for "deep focus" and lack of distraction but still productive
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

const getRandomActivities = () => { // Shuffling and generating 3 random activities to be displayed
  const shuffledActivities = activities.sort(() => 0.5 - Math.random());
  return shuffledActivities.slice(0, 3);
};

export default function App() {
  const [notificationToken, setNotificationToken] = useState(null);
  const [alarmTime, setAlarmTime] = useState(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [randomActivities, setRandomActivities] = useState([]);
  const [countdown, setCountdown] = useState(0);

  //Update - New States for adding new activities and changing breaktime
  const [showMenu, setShowMenu] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const breakTimePickerRef = useRef(null);


  useEffect(() => {
    registerForPushNotificationsAsync();
    Notifications.addNotificationReceivedListener(handleNotification);
    setRandomActivities(getRandomActivities());
  }, []);

  const registerForPushNotificationsAsync = async () => { // Make sure notification permissions are on
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setNotificationToken(token);
    } else {
      console.log('Permission denied for notifications');
    }
  };

  const handleNotification = notification => { // What happens when the break notification goes off
    console.log('Received notification:', notification);
    setCountdown(15 * 60); // Start the 15-minute countdown
  };

  const handleDateChange = (event, selectedDate) => { // Hide the DateTimePicker when a date is selected
    setShowDateTimePicker(false);
    if (selectedDate) { // Set the selected date and time as the alarm time
      setAlarmTime(selectedDate);
    }
  };

  const regenerateRandomActivities = () => { // Constant for regenerating activity button
    setRandomActivities(getRandomActivities());
  };

  const showPicker = () => {
    setShowDateTimePicker(true); 
  };
  const addNewActivity = () => { // Add input to activity list 
    if (newActivity.trim() !== '') {
      setActivities([...activities, newActivity]);
      setNewActivity('');
    }
  };

  const handleBreakTimeChange = (_, selectedTime) => { // Set New Breaktime based on input value 
    if (selectedTime) {
      setNewBreakTime(selectedTime);
    }
  };

  const updateBreakTime = () => {
    if (newBreakTime) {
      setAlarmTime(newBreakTime);
      setShowMenu(false); // Hide the menu after updating break time
    }
  };
  
  // Use useEffect to focus on the DateTimePicker when the menu is shown
  useEffect(() => {
    if (showMenu) {
      breakTimePickerRef.current?.focus(); // Assuming the DateTimePicker supports the 'focus' method
    } else {
      Keyboard.dismiss(); // Dismiss the keyboard when hiding the menu
    }
  }, [showMenu]);
  const scheduleNotification = async () => { // Set up notifications and what happens when triggered
    if (alarmTime) {
      const trigger = new Date(alarmTime);
      const now = new Date();

      if (trigger > now) {
        Alert.alert('Alarm Scheduled', `Break scheduled for ${formatAlarmTime(alarmTime)}!`);
        Keyboard.dismiss();

        const secondsUntilNotification = Math.round((trigger - now) / 1000);

        const identifier = await Notifications.scheduleNotificationAsync({
          content: { // Might've needed a token recipient here, but couldn't get working
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
        console.log('Selected date and time is in the past.'); // Check for unaccepted inputs
        Alert.alert('Failed.', `Selected date and time is in the past.`);
      }
    } else {
      console.log('Please select a date and time for the alarm.');
      Alert.alert('Please select a date and time for the alarm.');
    }
  };

  useEffect(() => { // Step function that checks break countdown time
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

  return ( // Visual style formatting
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
          ref={breakTimePickerRef}
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
      <Text style={styles.countdownText}>{`${Math.floor(countdown / 60)}:${countdown % 60} Break minutes left!`}</Text>

      {showMenu && (
        <View style={styles.menuContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add new activity"
            value={newActivity}
            onChangeText={(text) => setNewActivity(text)}
          />
          <TouchableOpacity onPress={addNewActivity}>
            <Text style={styles.addButton}>Add Activity</Text>
          </TouchableOpacity>
          <DateTimePicker
            value={newBreakTime ? newBreakTime : new Date()}
            mode="time"
            display="default"
            onChange={handleBreakTimeChange}
          />
          <TouchableOpacity onPress={updateBreakTime}>
            <Text style={styles.updateButton}>Update Break Time</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
        <Text style={styles.toggleMenu}>{showMenu ? 'Hide Menu' : 'Show Menu'}</Text>
      </TouchableOpacity>
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
