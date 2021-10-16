import React, {createContext, useReducer, useContext} from 'react';
import jwtDecode from "jwt-decode";

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const token = localStorage.getItem('auth-token');
let user = null;
if(token){
    let decodedToken = jwtDecode(token);
    let expiresAt = new Date(decodedToken.exp * 1000);

    if(new Date() > expiresAt){
        localStorage.removeItem('auth-token')
    }else {
        user = decodedToken;
    }
}else {
    console.log('no auth token found')
}

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            localStorage.setItem('auth-token', action.payload.token);
            return {...state, user: action.payload}

        case 'LOGOUT':
            localStorage.removeItem('auth-token');
            return {...state, user: null}

        default:
            throw new Error(`Unknown action type ${action.type}`);
    }
}

export const AuthProvider = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, {user});
    return (
        <AuthDispatchContext.Provider value={dispatch}>
            <AuthStateContext.Provider value={state}>
                {children}
            </AuthStateContext.Provider>
        </AuthDispatchContext.Provider>
    );
};

export const useAuthState = () => {
    return useContext(AuthStateContext);
}
export const useAuthDispatch = () => {
    return useContext(AuthDispatchContext);
}