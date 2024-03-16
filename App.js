import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Button,
} from "react-native";
import { DeviceMotion, Barometer } from "expo-sensors";
import React, { useState, useEffect } from "react";
import { Audio } from "expo-av";

export default function App() {
  // const [{ pressure, relativeAltitude }, setData] = useState({ pressure: 0, relativeAltitude: 0 });
  const [subscription, setSubscription] = useState(null);
  const [sound, setSound] = useState();
  const [acceleration, setAcceleration] = useState();
  const [accelerationIncludingGravity, setAccelerationIncludingGravity] =
    useState();
  const [orientation, setOrientation] = useState();
  const [rotation, setRotation] = useState();
  const [rotationRate, setRotationRate] = useState();
  const [altitude, setAltitude] = useState();

  // const [isPlaying, setIsplaying] = useState(false);

  // console.log("Ny isplaying");

  let latestZ = [];

  useEffect(() => {
    let isPlaying = false;
    let lastTime = Date.now();
    let lastAltitude = 0;
    let altitudes = [];
    let counter = 0;

    Barometer.setUpdateInterval(30);

    Barometer.addListener(function (e) {
      // setAltitude(e.relativeAltitude);

      if (lastAltitude == 0) lastAltitude = e.pressure;
      // console.log(e.relativeAltitude + " / " + lastAltitude + " / " + e.pressure);

      let change = e.pressure - lastAltitude;

      // console.log(change)

      altitudes.push(change);
      if (altitudes.length > 10) {
        altitudes.shift();
      }
      lastAltitude = e.pressure;

      let averageZ = altitudes.reduce((a, b) => a + b, 0) / altitudes.length;
      averageZ = Math.abs(Math.round(averageZ * 1000) / 1000);

      setAltitude(e.pressure + "\n" + change + "\n" + averageZ);
      // console.log(e.pressure + "\n" + change + "\n" + averageZ);

      if (averageZ > 0.012 && !isPlaying) {
        counter++;
        if (counter > 1) {
          playSound();
        }
      } else if (averageZ < 0.01 && isPlaying) {
        counter = 0;
        stopSound();
      } else {
        counter = 0;
      }
      // console.log(e.relativeAltitude + " / " + change);
      // setAltitude(e.relativeAltitude + " / " + change);
    });

    Barometer.setUpdateInterval(100);

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: 1,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: 1,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
      playThroughEarpieceAndroid: true,
    });

    let sound;
    Audio.Sound.createAsync(require("./assets/hissmusik.mp3")).then((snd) => {
      sound = snd.sound;
    });

    console.log("run");
    async function playSound() {
      console.log("Playing Sound");

      // setSound(sound);
      isPlaying = true;
      // console.log(sound);
      await sound.playAsync();
    }

    async function stopSound() {
      if (sound) {
        console.log("Stopping Sound");
        await sound.stopAsync(); // Stop the playback
        // await sound.unloadAsync(); // Unload the sound from memory
        isPlaying = false;
        // setSound(undefined); // Clear the sound object
      }
    }

    console.log("startar en listener");

    const onDeviceMotionChange = (event) => {
      // console.log("event", event);
      // setAcceleration("Acc x: " + event.acceleration.x + "\ny: " + event.acceleration.y + "\nz: " + event.acceleration.z);
      latestZ.push(Math.abs(event.acceleration.z));
      if (latestZ.length > 100) {
        latestZ.shift();
      }
      let averageZ = latestZ.reduce((a, b) => a + b) / latestZ.length;
      const latestOverThreshold = latestZ.filter((z) => z > 0.5);
      setAcceleration(
        "Over threshold: " + averageZ + "\n" + latestOverThreshold.length
      );
      if (averageZ > 0) {
        console.log("averageZ", averageZ);
      }
      console.log(averageZ);
      if (averageZ > 3 && !isPlaying) {
        isPlaying = true;
        console.log("start sound");
        playSound();
      } else if (latestOverThreshold.length < 50 && isPlaying) {
        isPlaying = false;
        console.log("stop sound");
        stopSound();
      }
      // if (averageZ > 0.1) {
      //   setAcceleration("VI RÖR OSS? " + latestOverThreshold);
      // } else {
      //   setAcceleration("STÅR STILLA: " + latestOverThreshold);
      // }

      // setAccelerationIncludingGravity("AccGrav x: " + event.accelerationIncludingGravity.x + "\ny: " + event.accelerationIncludingGravity.y + "\nz: " + event.accelerationIncludingGravity.z);
      // setOrientation("Or x: " + event.orientation);
      // setRotation("Rot alpha: " + event.rotation.alpha + "\nbeta: " + event.rotation.beta + "\ngamma: " + event.rotation.gamma);
      // setRotationRate("Rot alpha: " + event.rotationRate.alpha + "\nbeta: " + event.rotationRate.beta + "\ngamma: " + event.rotationRate.gamma);
    };

    // DeviceMotion.addListener(onDeviceMotionChange);

    return () => {
      console.log("remove");
      DeviceMotion.removeAllListeners();
      Barometer.removeAllListeners();
    };
  }, []);

  // const toggleListener = () => {
  //   subscription ? unsubscribe() : subscribe();
  // };

  // const subscribe = () => {
  //   setSubscription(Barometer.addListener(setData));
  // };

  // const unsubscribe = () => {
  //   subscription && subscription.remove();
  //   setSubscription(null);
  // };

  // useEffect(() => {
  //   // This will now correctly run as intended.
  //   console.log("startar en listener");

  //   DeviceMotion.addListener(onDeviceMotionChange);
  //   return () => {
  //     DeviceMotion.removeAllListeners();
  //   };
  // }, []);

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // const onDeviceMotionChange = (event) => {
  //   // console.log("event", event);
  //   // setAcceleration("Acc x: " + event.acceleration.x + "\ny: " + event.acceleration.y + "\nz: " + event.acceleration.z);
  //   latestZ.push(event.acceleration.z);
  //   if (latestZ.length > 100) {
  //     latestZ.shift();
  //   }
  //   let averageZ = latestZ.reduce((a, b) => a + b) / latestZ.length;
  //   const latestOverThreshold = latestZ.filter(z => z > 0.5);
  //   setAcceleration("Over threshold: " + latestOverThreshold.length);
  //   if (latestOverThreshold.length > 50 && !isPlaying) {
  //     console.log("start sound");
  //     setIsplaying(true);
  //     playSound();
  //   } else if (latestOverThreshold.length < 50 && isPlaying) {
  //     console.log("stop sound");
  //     stopSound();
  //   }
  //   // if (averageZ > 0.1) {
  //   //   setAcceleration("VI RÖR OSS? " + latestOverThreshold);
  //   // } else {
  //   //   setAcceleration("STÅR STILLA: " + latestOverThreshold);
  //   // }

  //   // setAccelerationIncludingGravity("AccGrav x: " + event.accelerationIncludingGravity.x + "\ny: " + event.accelerationIncludingGravity.y + "\nz: " + event.accelerationIncludingGravity.z);
  //   setOrientation("Or x: " + event.orientation);
  //   // setRotation("Rot alpha: " + event.rotation.alpha + "\nbeta: " + event.rotation.beta + "\ngamma: " + event.rotation.gamma);
  //   // setRotationRate("Rot alpha: " + event.rotationRate.alpha + "\nbeta: " + event.rotationRate.beta + "\ngamma: " + event.rotationRate.gamma);
  // }

  return (
    <View style={styles.wrapper}>
      <Text>Hoskar testar nytt</Text>
      <Text>Alt: {altitude}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
    marginTop: 15,
  },
  wrapper: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
