import React, { Component, ReactNode, createContext } from 'react';
import { ClerkProvider, useClerk, useUser } from '@clerk/react';

// Zero 3rd-party keys by default: Native Indian Citizen Auth is the primary mode
export const DEFAULT_CLERK_KEY = '';

export interface SafeClerkState {
  isAvailable: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: any;
  clerk: any;
  openSignIn?: (props?: any) => void;
  openSignUp?: (props?: any) => void;
  signOut: () => Promise<void>;
}

export const SafeClerkContext = createContext<SafeClerkState>({
  isAvailable: false,
  isLoaded: true,
  isSignedIn: false,
  user: null,
  clerk: null,
  signOut: async () => {},
});

const ClerkBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const clerk = useClerk();
  const userContext = useUser();

  const value: SafeClerkState = {
    isAvailable: true,
    clerk,
    isLoaded: userContext.isLoaded,
    isSignedIn: !!userContext.isSignedIn,
    user: userContext.user,
    openSignIn: (props?: any) => clerk.openSignIn?.(props),
    openSignUp: (props?: any) => clerk.openSignUp?.(props),
    signOut: () => clerk.signOut?.(),
  };

  return (
    <SafeClerkContext.Provider value={value}>
      {children}
    </SafeClerkContext.Provider>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ClerkErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('ClerkProvider error caught, falling back smoothly to native app auth:', error.message, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const ClerkSafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('mausam_clerk_key') : null;
  const publishableKey = customKey || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || DEFAULT_CLERK_KEY;

  const fallbackContext: SafeClerkState = {
    isAvailable: false,
    isLoaded: true,
    isSignedIn: false,
    user: null,
    clerk: null,
    signOut: async () => {},
  };

  if (!publishableKey) {
    return (
      <SafeClerkContext.Provider value={fallbackContext}>
        {children}
      </SafeClerkContext.Provider>
    );
  }

  return (
    <ClerkErrorBoundary
      fallback={
        <SafeClerkContext.Provider value={fallbackContext}>
          {children}
        </SafeClerkContext.Provider>
      }
    >
      <ClerkProvider 
        publishableKey={publishableKey} 
        signInFallbackRedirectUrl="/home"
        signUpFallbackRedirectUrl="/home"
        afterSignOutUrl="/"
      >
        <ClerkBridge>
          {children}
        </ClerkBridge>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
};

