import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  componentName?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, componentName, fallback } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      return fallback || (
        <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 space-y-2 m-2 min-h-32">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
            {componentName ? `${componentName} Error` : 'Component Error'}
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400">
            {error?.message || 'Something went wrong. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
