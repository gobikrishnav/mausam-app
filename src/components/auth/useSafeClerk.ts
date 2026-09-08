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
      openSignIn: (props?: any) => clerk.openSignIn?.(props),
      openSignUp: (props?: any) => clerk.openSignUp?.(props),
      signOut: () => clerk.signOut?.(),
    };
  } catch (err) {
    return {
      isAvailable: false,
      isLoaded: true,
      isSignedIn: false,
      user: null,
      clerk: null,
      openSignIn: undefined as ((props?: any) => void) | undefined,
      openSignUp: undefined as ((props?: any) => void) | undefined,
      signOut: async () => {},
    };
  }
}
