import { useContext } from 'react';
import { SafeClerkContext, SafeClerkState } from './ClerkSafeProvider';

export function useSafeClerk(): SafeClerkState {
  return useContext(SafeClerkContext);
}
