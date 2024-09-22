import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AuthScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    // On app start, check AsyncStorage for user info
    const checkUserSession = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    // Call checkUserSession in a useEffect hook when the app starts
    useEffect(() => {
        checkUserSession();
    }, []);

    const handleLogin = async () => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            setUser(response.user);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            setError('');
            navigation.replace('Profile');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegister = async () => {    
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            setUser(response.user);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            setError('');
            navigation.replace('Profile');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Authentication</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput 
                style={styles.input} 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail}
            />
            <TextInput 
                style={styles.input} 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword}
                secureTextEntry 
            />
            <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin} 
            >
                <Text>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleRegister} 
                style={styles.button}
            >
                <Text>Register</Text>
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
    input: {
        width: '80%', // Make the input wider
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginVertical: 10,
    },
    button: {
        padding: 10,
        backgroundColor: 'lightblue',
        borderRadius: 5,
        margin: 10,
        width: '80%', // Make the button wider
        alignItems: 'center', // Center button text
    },
    buttonText: {
        color: '#000', // Button text color
    },
    errorText: {
        color: 'red',
        marginVertical: 10,
    },
});

export default AuthScreen;
