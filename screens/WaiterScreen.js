import React, { useContext } from "react";
import { KeyboardAvoidingView, View, TextInput, TouchableOpacity, Text} from "react-native";
import { styles } from '../styles'
import { auth, db } from '../firebase'
import { useState } from "react";
import { UserContext } from "../services/UserContext";
import { doc, setDoc } from "firebase/firestore";

const WaiterScreen = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('')
    const { setUser } = useContext(UserContext);

    const addWaiter  = async () =>{
      const response = await auth
        .createUserWithEmailAndPassword(email, password)
        .then(userCredentials => {
            const email = userCredentials.user.email;
            console.log('Registered in with:', email);

             setDoc(doc(db, "users", auth.currentUser.uid), {
                name: name,
                email: email,
                isManager: false}).then(() => {
                console.log('user data save')
                }).catch((error) => {
                    console.log(error);
                }) 

             setUser({
                name: name,
                email: email,
                isManager: false})

            })
        .catch(error => alert(error.message))
        console.log('Password: ', password)   
    }
    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.inputContainer}>
                <TextInput placeholder='Name' value={name} onChangeText={text => {setName(text)}} style={styles.input}></TextInput>
                <TextInput placeholder='Email' value={email} onChangeText={text => {setEmail(text)}} style={styles.input}></TextInput>
            </View>
            <View  style={styles.buttonContainer}>
               <TouchableOpacity onPress={addWaiter} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>Add Waiter</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default WaiterScreen