import React from 'react'
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from '../styles'


const SignOut = () => {
    const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
      })
      .catch(error => alert(error.message))
  }

    return (
        <View style={styles.container}>
             <TouchableOpacity onPress={handleSignOut} style={styles.buttonSignOut}>
                <Text style={styles.buttonText}>Sign out</Text>
            </TouchableOpacity>
        </View>
    )
}

export default SignOut