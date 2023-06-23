import { startAfter } from "firebase/firestore";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 150,
  },
  inputContainer: {
    width: '75%',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
    marginTop: 5,
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#00c04b',
    width: '80%',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: '#00c04b',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#00c04b',
    fontWeight: '700',
    fontSize: 16,
  },

  homeText: {
    fontSize: 15,
    alignItems: 'flex-start',
    marginTop: 10,
    fontWeight: '20%'
  },

  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:"35%",
  },

  buttonSignOut: {
    backgroundColor: '#00c04b',
    width: '50%',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    signOut: {
      justifyContent:'flex-end',
      alignItems:'flex-end'
    }
  },

  buttonAddProduct: {
    backgroundColor: '#00c04b',
    width: '45%',
    padding: 5,
    borderRadius: 50,
    marginTop: 30,
    marginLeft: 110,
    borderColor: "green", borderWidth: "1%", borderRadius:"25%"
  },
  buttonEnd: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36
  },
  buttonsView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around"
  }

});