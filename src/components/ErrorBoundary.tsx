import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught WebGL Error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default CSS-only fallback if WebGL completely crashes
      return (
        <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[#05060f]">
          {/* Simple CSS stars fallback */}
          <div className="absolute inset-0 opacity-50" style={{ 
            backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #ffffff, rgba(0,0,0,0))',
            backgroundSize: '120px 120px'
          }} />
          <div className="absolute inset-0 opacity-20" style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(70,30,120,0.4) 0%, transparent 60%)'
          }} />
        </div>
      );
    }

    return this.props.children;
  }
}
