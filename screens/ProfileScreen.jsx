import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { auth, firestore } from '../firebase';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { addDoc, collection } from 'firebase/firestore';
import HistoryModal from '../components/HistoryModal';
import LottieView from 'lottie-react-native';

const ProfileScreen = ({navigation}) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [result, setResult] = useState(false);
    const [prediction, setPrediction] = useState('');
    const [test, setTest] = useState('');
    const [image, setImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [sentRequest, setSentRequest] = useState(false);

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


    //function to save classification data to each user using firestore
    const saveClassification = async (plantName, imageUri) => {
        try{

            const user = auth.currentUser;
            if (!user){
                setError('User not authenticated or found');
                return;
            }

            const userRef = collection(firestore, 'users', user.uid, 'classifications');

            //create new document with the classification details
            await addDoc(userRef, {
                plant_name: plantName,
                image: imageUri,
                timestamp: new Date(),
            });

            console.log('Classification saved successfully');

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    }


    const classifyImage = async () => {
        setResult(false);
        setPrediction('');
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
                
                setSentRequest(true);
                const response = await fetch('http://192.168.0.103:5000/classify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: base64Image }),
                });

                const data = await response.json();

                if (response.ok) {
                    setSentRequest(false);
                    setResult(true);
                    setPrediction(`Predicted Plant: ${data.plant_name}`);
                    await saveClassification(data.plant_name, result.assets[0].uri);
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
            <Text style={styles.text}>Pick a plant image to classify</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {result ? <Text style={styles.prediction}>{prediction}</Text> : null}
            {test ? <Text style={styles.text}>{test}</Text> : null}
            {sentRequest ? <LottieView
                source={require('../assets/loading.json')}
                autoPlay
                loop
                style={{ width: 50, height: 50 }}
            /> : null}
            {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
            
            <View style={styles.button_container}>
                <TouchableOpacity onPress={handleSignOut} style={styles.button}>
                    <Text>Sign Out</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={classifyImage}>
                    <Text style={styles.buttonText}>Pick an Image</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                <Text>Show History</Text>
            </TouchableOpacity>

            <HistoryModal visible={modalVisible} onClose={() => setModalVisible(false)} />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9bd3b4',
    },
    button_container: {
        flexDirection: 'row',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 20,
        marginTop: 10,
        borderRadius: 10,
    },
    text: {
        fontSize: 20,
        color: '#000',
    },
    prediction: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#77bc96',
        padding: 10,
        margin: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
    },
});

export default ProfileScreen;