import React, { useState, useMemo, createContext } from 'react';

export const UserContext = createContext(null)

  const UserProvider = props => {
    const [user, setUser] = useState(null)
    const userData = useMemo(
        () => ({user, setUser}),
        [user, setUser]
    )

    return (
        <UserContext.Provider value={{userData}}>
            {props.children}
        </UserContext.Provider>
    )
}

export default UserProvider