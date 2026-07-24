import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto mt-16 max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <h1 className="mb-2 text-lg font-bold text-destructive">Something went wrong</h1>
          <p className="mb-4 text-sm text-destructive/80">{this.state.error.message}</p>
          <Button onClick={() => (window.location.href = "/")}>Back to home</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
