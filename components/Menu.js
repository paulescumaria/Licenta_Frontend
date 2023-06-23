import { styles } from '../styles'
import { auth } from '../firebase'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

const Menu = (props) => {
    const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        // navigation.navigate("Login")
      })
      .catch(error => alert(error.message))
  }

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <DrawerItem label="SignOut" onPress={handleSignOut} style={styles.signOut}/>
        </DrawerContentScrollView>
    )
}

export default Menu