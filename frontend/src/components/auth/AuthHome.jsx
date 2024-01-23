import { Navigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
export const AuthHome = ({children})=>{
    const isAuth = localStorage.getItem('accessToken');
    return isAuth ? <>{children}</> : <Navigate to="/login" />
}
