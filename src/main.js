import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Error boundary component to catch React rendering errors
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("React Error Boundary caught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (_jsxs("div", { style: {
                    padding: '20px',
                    margin: '20px',
                    backgroundColor: '#ffdddd',
                    border: '1px solid #ff0000',
                    borderRadius: '5px'
                }, children: [_jsx("h2", { children: "Something went wrong." }), _jsxs("details", { style: { whiteSpace: 'pre-wrap' }, children: [_jsx("summary", { children: "Show Error Details" }), this.state.error && this.state.error.toString()] })] }));
        }
        return this.props.children;
    }
}
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { children: _jsxs(HeroUIProvider, { children: [_jsx(ToastProvider, {}), _jsx("main", { className: "text-foreground bg-background", children: _jsx(App, {}) })] }) }) }));
