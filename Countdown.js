import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Countdown = ({ minutes, onTimeout }) => {
  const [seconds, setSeconds] = useState(minutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds > 0) {
          return prevSeconds - 1;
        } else {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeout]);

  const displayTime = () => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{displayTime()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 40,
  },
});

export default Countdown;
