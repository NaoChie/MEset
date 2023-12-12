import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, TextInput, Keyboard, Text, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

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

// Set defaul activities
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

// Get and shuffle activities
const getRandomActivities = () => {
  const shuffledActivities = activities.sort(() => 0.5 - Math.random());
  return shuffledActivities.slice(0, 3);
};

export default function App() {
  // Declaring all functions and constants here!
  const [notificationToken, setNotificationToken] = useState(null);
  const [alarmTime, setAlarmTime] = useState(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [randomActivities, setRandomActivities] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const breakTimePickerRef = useRef(null);
  const [selectedActivityToDelete, setSelectedActivityToDelete] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  var newBreakTime;

  const deleteActivity = () => {
    if (selectedActivityToDelete) {
      const updatedActivities = activities.filter(activity => activity !== selectedActivityToDelete);
      setAllActivities(updatedActivities);
      setSelectedActivityToDelete(null);
      Alert.alert('Activity Deleted', `The activity "${selectedActivityToDelete}" has been deleted.`);
    } else {
      Alert.alert('No Activity Selected', 'Please select an activity to delete.');
    }
  };
  const handleNotification = notification => {
    console.log('Received notification:', notification);
    setCountdown(15 * 60);
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
  const addNewActivity = () => {
    if (newActivity.trim() !== '') {
      setActivities([...activities, newActivity]);
      setNewActivity('');
      Alert.alert('Activity Deleted', `The activity "${newActivity}" has been added.`);
    }
  };
  const setActivities = () => {
    activities.push(newActivity);
  };
  const setAllActivities = (updatedActivities) => {
    activities.length = 0;
    activities.push(...updatedActivities);
  }
  const setNewBreakTime = (_, newBreakTime) => {
    updateBreakTime(newBreakTime);
  };
  const handleBreakTimeChange = (_, selectedTime) => {
    if (selectedTime) {
      setNewBreakTime(selectedTime);
    }
  };
  const updateBreakTime = (_, newBreakTime) => {
    if (newBreakTime) {
      setAlarmTime(newBreakTime);
      Alert.alert('Alarm time updated.', `Break scheduled for ${formatAlarmTime(newBreakTime)}!`);
      setShowMenu(false);
    }
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

  // Checker for Notification Permission
  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setNotificationToken(token);
    } else {
      console.log('Permission denied for notifications');
    }
  };

  // What to do after rendering
  useEffect(() => {
    if (countdown > 0) {
      handleNotification()
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

  // Return visual formatting
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
        ))}
      </View>

      <TouchableOpacity onPress={regenerateRandomActivities} style={styles.regenerateButton}>
        <Text style={styles.regenerateButtonText}>Regenerate</Text>
      </TouchableOpacity>
      <Text style={styles.countdownText}>{`${Math.floor(countdown / 60)}:${countdown % 60} minutes left for your break!`}</Text>
      {showMenu && (
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Add New Activity"
            value={newActivity}
            onChangeText={(text) => setNewActivity(text)}
          />
          <TouchableOpacity onPress={addNewActivity} style={styles.addNewActivityButton}>
            <Text style={styles.addNewActivityButtonText}>Add Activity</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.deleteActivityButton}>
            <Text style={styles.addNewActivityButtonText}>Delete Activity</Text>
          </TouchableOpacity>
          <DateTimePicker
            style={styles.dateTime}
            value={newBreakTime ? newBreakTime : new Date()}
            mode="time"
            display="default"
            onChange={handleBreakTimeChange}
          />
          {/* Currently does not work!!  */}
          <TouchableOpacity onPress={updateBreakTime} style={styles.addNewActivityButton}>
            <Text style={styles.addNewActivityButtonText}>Update Break Time</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close button at the top right */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text>Select activity to delete...</Text>
            <Picker
              style={styles.picker}
              selectedValue={selectedActivityToDelete}
              onValueChange={(itemValue) => setSelectedActivityToDelete(itemValue)}
            >
              <Picker.Item label="Select activity to delete..." value={null} />
              {activities.map((activity, index) => (
                <Picker.Item key={index} label={activity} value={activity} />
              ))}
            </Picker>
            <TouchableOpacity
              onPress={() => {
                deleteActivity();
                setModalVisible(false);
              }}
              style={styles.addNewActivityButton}
            >
              <Text style={styles.addNewActivityButtonText}>Delete Activity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
        <Text style={styles.toggleMenu}>{showMenu ? 'Hide Menu' : 'Show Menu'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Visual styles
const styles = StyleSheet.create({
  dateTime: {
    alignItems: 'center',
    marginTop: 10,
  },
  toggleMenu: {
    fontStyle: 'italic'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 400,
    height: 150,
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    padding:15,
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
    borderRadius: 10,
    marginTop: 20,
  },
  regenerateButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  addNewActivityButton: {
    backgroundColor: '#9cc2ff',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  deleteActivityButton: {
    backgroundColor: '#d4e4ff',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  addNewActivityButtonText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
  picker: {
    height: 40,
    width: 200,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    marginBottom: 180,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,

  },
});