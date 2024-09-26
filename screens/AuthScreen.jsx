import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';

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
            <View style={styles.title_container}>
                <View style={styles.title_wrapper}>
                    <FontAwesome name="leaf" size={70} color="green" style={styles.logo}/>
                    <Text style={styles.title}>Plant Identifier</Text>
                </View>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.input_container}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#9bd3b4',
    },
    title_container: {
        alignItems: 'center',
        marginTop: 60,
    },
    title_wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 55,
    },
    input_container: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 180,
    },
    title: {
        fontSize: 38,
        color: '#000',
        margin: 60,
        fontFamily: 'Cochin',
        marginLeft: 10,
    }, 
    logo: {
        margin: 0,
    },
    text: {
        fontSize: 20,
        color: '#000',
    },
    input: {
        color: '#000',
        width: '80%', // Make the input wider
        padding: 10,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        marginVertical: 10,
    },
    button: {
        padding: 10,
        backgroundColor: '#77bc96',
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
