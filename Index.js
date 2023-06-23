import React, { useContext } from "react";
import StackNavigator from './components/StackNavigator';
import BottomNavigator from './components/BottomNavigator';
import { UserContext } from "./services/UserContext";

const Index = () => {
    const { userData: {user} } = useContext(UserContext);
    return (
        <>
            {user ? <BottomNavigator /> : <StackNavigator />}
        </>
    )
}

export default Index;