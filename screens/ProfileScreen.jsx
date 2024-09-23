import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({navigation}) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [result, setResult] = useState(false);
    const [prediction, setPrediction] = useState('');
    const [test, setTest] = useState('');

    const handleSignOut = async () => {
        try{
            await signOut(auth);
            setUser(null);
            navigation.replace('Auth');
            await AsyncStorage.removeItem('user');
        } catch (err) {
            setError(err.message);
        }
    };


    const checkServer = async () => {
        try {
            const response = await fetch('http://192.168.1.139:5000/test'); // Replace with your IP
            const data = await response.json();

            if (response.ok) {
                setTest(data.message);
            } else {
                setTest('Error: ' + data.message);
            }
        } catch (error) {
            console.error(error);
            //Alert.alert('Error', 'Failed to reach the server');
        }
    };


    const classifyImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission to access camera roll is required!');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      
        const formData = new FormData();
        formData.append('image', {
            uri: result.uri,
            name: 'image.jpg',
            type: 'image/jpeg',
        });
      
        try {
            const response = await fetch('http://192.168.1.139:5000/classify', {
              method: 'POST',
              body: formData,
            });
      
            const data = await response.json();
            setError('sent');
            if (response.ok) {
                //Alert.alert(`Predicted Plant: ${data.plant_name}, Confidence: ${data.confidence}`);
                setResult(true);
                setPrediction(`Predicted Plant: ${data.plant_name}`);
            } else {
                //Alert.alert('Error', data.error);
                setError(data.error);
            }
        } catch (error) {
                console.error(error);
                //Alert.alert('Error', 'An error occurred while classifying the image.');
                setError(error.message);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Profile</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {result ? <Text style={styles.text}>{prediction}</Text> : null}
            {test ? <Text style={styles.text}>{test}</Text> : null}
            <TouchableOpacity onPress={handleSignOut} style={styles.button}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={classifyImage}>
                <Text style={styles.buttonText}>Pick an Image</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        color: '#000',
    },
    button: {
        backgroundColor: '#DDDDDD',
        padding: 10,
        margin: 10,
    },
    errorText: {
        color: 'red',
    },
});

export default ProfileScreen;