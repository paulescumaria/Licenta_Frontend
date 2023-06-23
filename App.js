import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import UserProvider from './services/UserContext';
import { auth } from './firebase';
import { Provider as PaperProvider } from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates'
import Index from './Index';


export default function App() {
  const [isLogged, setIsLogged] = useState(true);

  useEffect(() => {
    registerTranslation('en', en);
    auth.onAuthStateChanged((userStatus) => {
      if (userStatus) {
        setIsLogged(true)
      }
        
      else
        setIsLogged(false)
      
    })
    console.log('asd');
  }, [])

  return (
    <UserProvider>
      <NavigationContainer>
        <PaperProvider>
            <Index />
        </PaperProvider>
      </NavigationContainer>
    </UserProvider>
  );
}
