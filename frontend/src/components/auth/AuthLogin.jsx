/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";

export const AuthLogin = ({children})=>{
    const isAuth = localStorage.getItem('accessToken');
    return isAuth ? <Navigate to='/' /> : <>{children}</> 
 }
 