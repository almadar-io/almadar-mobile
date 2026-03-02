import React, { ReactNode, ErrorInfo } from 'react';
import { View, ViewStyle } from 'react-native';
import { ErrorState } from './ErrorState';

export interface ErrorBoundaryProps {
  /** Content to render when no error */
  children: ReactNode;
  /** Fallback UI when an error is caught */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Additional styles for the wrapper */
  style?: ViewStyle;
  /** Called when an error is caught (for logging/telemetry) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * ErrorBoundary — catches React render errors in child components.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback, style } = this.props;

    if (error) {
      const fallbackContent = this.renderFallback(error, fallback);
      if (style) {
        return <View style={style}>{fallbackContent}</View>;
      }
      return fallbackContent;
    }

    return children;
  }

  private renderFallback(error: Error, fallback: ErrorBoundaryProps['fallback']): ReactNode {
    if (typeof fallback === 'function') {
      return fallback(error, this.reset);
    }
    if (fallback) {
      return fallback;
    }
    return (
      <ErrorState
        message={`Something went wrong: ${error.message}`}
        onRetry={this.reset}
      />
    );
  }
}
