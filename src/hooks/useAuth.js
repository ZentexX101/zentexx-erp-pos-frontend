
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const authStates = useContext(AuthContext);
  return authStates;
};
