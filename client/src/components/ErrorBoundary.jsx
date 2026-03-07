import { Component } from "react";

export class ChunkErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-[#c9d1d9] gap-4">
          <p className="text-red-400">Failed to load this page.</p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
