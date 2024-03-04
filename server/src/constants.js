import Razorpay from 'razorpay';
export const DB_NAME = 'backend-auth';

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes

export let instance = new Razorpay({
    key_id: 'rzp_test_dKsNwz2IzPfCKz',
    key_secret: 'ue8dR6oxZ2f7RhA5mYVbFjC4',
});

export const UserRolesEnum = {
    ADMIN: "ADMIN",
    USER: "USER",
  };
  
export const AvailableUserRoles = Object.values(UserRolesEnum);

export const UserLoginType = {
    GOOGLE: "GOOGLE",
    GITHUB: "GITHUB",
    EMAIL_PASSWORD: "EMAIL_PASSWORD",
  };
  
  export const AvailableSocialLogins = Object.values(UserLoginType);
  
  