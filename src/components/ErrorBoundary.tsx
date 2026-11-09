import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught error captured by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearStorage = () => {
    localStorage.removeItem('sc2_active_user_id');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070913] text-[#e1e1f1] flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl glass-modal p-6 sm:p-8 border border-rose-500/30 shadow-2xl relative animate-in fade-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-bold text-white tracking-tight">Something Went Wrong</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              An unexpected application error occurred. We have isolated the fault to protect your academic state.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full btn-spatial-primary text-xs font-semibold text-white flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleClearStorage}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full btn-spatial-secondary text-xs text-slate-300 flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
