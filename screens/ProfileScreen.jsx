import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const ProfileScreen = ({navigation}) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [result, setResult] = useState(false);
    const [prediction, setPrediction] = useState('');
    const [test, setTest] = useState('');
    const [image, setImage] = useState(null);

    const convertToBase64 = async (uri) => {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
    };

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

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
                const base64Image = await convertToBase64(result.assets[0].uri);
                
                const response = await fetch('http://192.168.0.109:5000/classify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: base64Image }),
                });

                const data = await response.json();

                if (response.ok) {
                    setResult(true);
                    setPrediction(`Predicted Plant: ${data.plant_name}`);
                } else {
                    setError(data.error || 'An error occurred while classifying the image.');
                }
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred while processing the image.');
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Profile</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {result ? <Text style={styles.text}>{prediction}</Text> : null}
            {test ? <Text style={styles.text}>{test}</Text> : null}
            {image ? <Image source={{ uri: image }} style={{ width: 200, height: 200 }} /> : null}
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