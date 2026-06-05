import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. Let's try reloading the game.
            </Text>
            
            {__DEV__ && this.state.error && (
              <Text style={styles.errorText}>
                {this.state.error.toString()}
              </Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReload}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Reload Game</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate-900
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    maxHeight: 150,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#14B8A6', // Neon Teal
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
