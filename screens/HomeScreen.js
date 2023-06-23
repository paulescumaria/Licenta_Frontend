import { React, useContext} from 'react'
import { Text, View } from 'react-native'
import { styles } from '../styles'
import { UserContext } from '../services/UserContext'
import { auth } from '../firebase'
import { Avatar, Button } from 'react-native-paper'

const HomeScreen = () => {

const {userData: {user, setUser}} = useContext(UserContext);

const handleSignOut = () => {
  auth
    .signOut()
    .then(() => {
      setUser(null);
    })
    .catch(error => alert(error.message))
}

  return (
    <View style={styles.homeContainer}>
      {user?.isManager ? 
      <Avatar.Icon size={70} icon="account" style={{backgroundColor:"#ffffff", borderColor: "gray", borderWidth: "1%"}}/>
      :
      <Avatar.Icon size={70} icon="account-tie" style={{backgroundColor:"#ffffff", borderColor: "gray", borderWidth: "1%"}}/>}
        <Text style={{alignItems: "center", marginTop: "5%", fontWeight: "500", fontSize: "16"}}>{user?.name}</Text>      
      <View style={{width:"35%", position:"absolute", bottom:"0%"}}>
        <Button onPress={handleSignOut} style={{position: "relative", backgroundColor: '#00c04d', borderColor: "green", borderWidth: "1%", borderRadius:"25%", marginVertical:"50%"}}>
          <Text style={{color:"white", fontSize: "15"}}>Sign-Out</Text>
        </Button>
      </View>
    </View>
  )
}

export default HomeScreen