import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// API base URL for frontend-backend communication
// 1) Prefer explicit Netlify env var VITE_API_URL
// 2) Auto-resolve for deployed frontend domain
// 3) Fallback to localhost for local development
const deployedBackend = "https://compilancesystem-api.onrender.com"; // << your backend URL
const isProdNetlify = window.location.hostname.includes("netlify.app") || window.location.hostname.includes("appspot.com");

export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (isProdNetlify ? deployedBackend : "http://localhost:5000");

// Global fetch wrapper so hardcoded backend URLs are redirected to API_BASE
const originalFetch = window.fetch.bind(window);
window.fetch = (resource, init) => {
  if (typeof resource === "string") {
    if (resource.startsWith("http://localhost:5000")) {
      resource = resource.replace("http://localhost:5000", API_BASE);
    } else if (resource.startsWith("https://compilancesystem.netlify.app")) {
      // avoid same-origin loop; frontend-to-backend should use API_BASE + /api
      resource = resource.replace("https://compilancesystem.netlify.app", API_BASE);
    }
  }
  return originalFetch(resource, init);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
