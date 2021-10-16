import React from 'react';
import {useAuthState} from "../contexts/auth";
import {Redirect, Route} from "react-router-dom";

const DynamicRoute = ({authenticated, guest, component, ...props}) => {

    const {user} = useAuthState();

    if (authenticated && !user) {
        return <Redirect to="/login"/>
    } else if (guest && user) {
        return <Redirect to="/"/>
    } else {
        return <Route component={component} {...props}/>
    }
};

export default DynamicRoute;