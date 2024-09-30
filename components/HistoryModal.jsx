import React, { useState, useEffect } from 'react';
import { View, Text, Modal, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebase';

const HistoryModal = ({ visible, onClose }) => {
    const [classifications, setClassifications] = useState([]);

    // Fetch classifications from Firestore when the modal is opened
    useEffect(() => {
        if (visible) {
            fetchClassifications();
        }
    }, [visible]);

    // Function to fetch classifications for the current user
    const fetchClassifications = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Reference to the user's classifications collection in Firestore
            const classificationsRef = collection(firestore, 'users', user.uid, 'classifications');
            const querySnapshot = await getDocs(classificationsRef);

            // Map over the documents and save them in state
            const fetchedClassifications = querySnapshot.docs.map((doc) => doc.data());
            setClassifications(fetchedClassifications);
        } catch (error) {
        console.error('Error fetching classifications:', error);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
        <View style={styles.modalView}>
            <Text style={styles.title}>Classification History</Text>
            <FlatList
                data={classifications}
                style={styles.flatlist}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <Text style={styles.plantName}>{item.plant_name !== null ? item.plant_name : 'Unclassified'}</Text>
                        <Text style={styles.timestamp}>{item.timestamp.toDate().toString()}</Text>
                    </View>
                )}
                showsHorizontalScrollIndicator={false} // Hide horizontal scroll bar
                showsVerticalScrollIndicator={false} // Hide vertical scroll bar
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9bd3b4',
        padding: 20,
    },
    flatlist: {
        height: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 40,
    },
    item: {
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        backgroundColor: '#cee5d8',
        borderRadius: 10,
        width: 300,
        justifyContent: 'space-between',
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 10,
        borderRadius: 10,
    },
    plantName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    timestamp: {
        fontSize: 14,
        color: 'gray',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#77bc96',
        borderRadius: 5,
        width: 200,
    },
    closeButtonText: {
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default HistoryModal;
