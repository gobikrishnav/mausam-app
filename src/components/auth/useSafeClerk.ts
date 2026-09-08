import { useUser, useClerk } from '@clerk/react';

export function useSafeClerk() {
  try {
    const clerk = useClerk();
    const userContext = useUser();
    return {
      isAvailable: true,
      clerk,
      isLoaded: userContext.isLoaded,
      isSignedIn: userContext.isSignedIn,
      user: userContext.user,
      openSignIn: () => clerk.openSignIn?.(),
      openSignUp: () => clerk.openSignUp?.(),
      signOut: () => clerk.signOut?.(),
    };
  } catch (err) {
    return {
      isAvailable: false,
      isLoaded: true,
      isSignedIn: false,
      user: null,
      clerk: null,
      openSignIn: undefined,
      openSignUp: undefined,
      signOut: async () => {},
    };
  }
}
