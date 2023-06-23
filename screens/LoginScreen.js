import React, { useContext, useState } from 'react';
import { Button, KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/core'
import { styles } from '../styles';
import { collection, getDocs } from 'firebase/firestore';
import { UserContext } from '../services/UserContext';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {userData: {setUser}} = useContext(UserContext);


    const navigation = useNavigation()

    const handleLogin = async () => {
        const response = await auth
        .signInWithEmailAndPassword(email,password)

        if (response) {
            const colRef = collection(db, 'users')
            const snapshots = await getDocs(colRef)
            const docs = snapshots.docs
            .map((doc => {
                const data = doc.data()
                data.id = doc.id
                return data
            }))
            .filter(element => 
                element.email.toLowerCase().trim() === auth.currentUser.email.toLowerCase().trim()
            )
            if (docs.length > 0)
                setUser(docs[0])
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.inputContainer}>
                <TextInput placeholder='Email' value={email} onChangeText={text => {setEmail(text)}} style={styles.input}></TextInput>
                <TextInput placeholder='Password' value={password} onChangeText={text => {setPassword(text)}} style={styles.input} secureTextEntry></TextInput>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <Text></Text>
                <Text></Text>
                <Text>Don't have an account?</Text>
                <Button title="Sign up Here." onPress={() => navigation.navigate("Register")} />
            </View>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen

