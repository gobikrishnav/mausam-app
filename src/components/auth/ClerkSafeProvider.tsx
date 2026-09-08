import React, { Component, ReactNode } from 'react';
import { ClerkProvider } from '@clerk/react';

// Default Clerk Publishable Key for immediate out-of-the-box operation
export const DEFAULT_CLERK_KEY = 'pk_test_bW9yZS1tYXJtb3NldC0zNC5jbGVyay5hY2NvdW50cy5kZXYk';

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
    console.warn('ClerkProvider error caught, falling back smoothly to native app auth:', error.message);
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

  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkErrorBoundary fallback={<>{children}</>}>
      <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
        {children}
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
};
