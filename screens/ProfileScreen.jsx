import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({navigation}) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

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

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Profile Screen</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity onPress={handleSignOut} style={styles.button}>
                <Text>Sign Out</Text>
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
});

export default ProfileScreen;