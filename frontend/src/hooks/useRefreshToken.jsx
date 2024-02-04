import { axiosInstance } from "../api/axios"

const useRefreshToken = () => {
    const refresh = async()=>{
    const response = await axiosInstance.post("/auth/refresh-token",{
        withCredentials:true
    })
    }
  return refresh
}
export default useRefreshToken