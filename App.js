import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Platform, Button } from 'react-native';
import { DeviceMotion, Barometer } from 'expo-sensors';
import React, { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export default function App() {
  const [{ pressure, relativeAltitude }, setData] = useState({ pressure: 0, relativeAltitude: 0 });
  const [subscription, setSubscription] = useState(null);
  const [sound, setSound] = useState();

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync( require('./assets/hissmusik.mp3'));
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const toggleListener = () => {
    subscription ? unsubscribe() : subscribe();
  };

  const subscribe = () => {
    setSubscription(Barometer.addListener(setData));
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    console.log("here we go");
    setTimeout(() => {
      console.log("timeout");
    }, 5000);

    DeviceMotion.addListener(onDeviceMotionChange);
    return () => {
      // DeviceMotion.removeListener(onDeviceMotionChange);
    };


  }, []);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onDeviceMotionChange = (event) => {
    // const { x, y } = event.accelerationIncludingGravity;
    // setCircle1Position({ x: x * 200, y: y * 200 });
    // setCircle2Position({ x: -x * 200, y: -y * 200 });
    console.log("event", event);
  }

  return (
    <View style={styles.wrapper}>
      <Text>Oskar testar nytt</Text>
      <Text>Barometer: Listener {subscription ? 'ACTIVE' : 'INACTIVE'}</Text>
      <Text>Pressure: {pressure} hPa</Text>
      <Text>
        Relative Altitude:{' '}
        {Platform.OS === 'ios' ? `${relativeAltitude} m` : `Only available on iOS`}
      </Text>
      <TouchableOpacity onPress={toggleListener} style={styles.button}>
        <Text>Toggle listener</Text>
      </TouchableOpacity>
      <Button title="Play Sound" onPress={playSound} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    marginTop: 15,
  },
  wrapper: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
