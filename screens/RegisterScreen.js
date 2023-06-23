import React, { useContext, useState } from 'react';
import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import { auth } from '../firebase';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../firebase';
import { UserContext } from '../services/UserContext';
import { Switch } from 'react-native-paper';

const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('')
    const [isSwitchOn, setIsSwitchOn] = React.useState(false);
    const {userData: {setUser}} = useContext(UserContext);

    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    const handleSignUp = async () => {
        await auth
        .createUserWithEmailAndPassword(email, password)
        .then(async () => {
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                name: name,
                email: email,
                isManager: isSwitchOn}).then(() => {
                console.log('user data save')
                }).catch((error) => {
                    console.log(error);
                })     
                
             setUser({
                name: name,
                email: email,
                isManager: isSwitchOn
            })
        })
        .catch(error => alert(error.message))
    }
    

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.inputContainer}>
                <TextInput placeholder='Name' value={name} onChangeText={text => {setName(text)}} style={styles.input}></TextInput>
                <TextInput placeholder='Email' value={email} onChangeText={text => {setEmail(text)}} style={styles.input}></TextInput>
                <TextInput placeholder='Password' value={password} onChangeText={text => {setPassword(text)}} style={styles.input} secureTextEntry></TextInput>
            </View>
            <View style={{marginTop: "5%", marginBottom: "10%"}}>
                <TouchableOpacity style={{alignItems: 'center', flexDirection: 'row'}} onPress={() => {}}>
                    <Text>Waiter </Text>
                    <Switch value={isSwitchOn} onValueChange={onToggleSwitch} color='#dddddd'/>
                    <Text>  Manager</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleSignUp} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen