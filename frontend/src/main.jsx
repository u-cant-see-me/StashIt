import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { FileProvider } from "./contexts/FileContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FileProvider>
      <App />
    </FileProvider>
  </StrictMode>
);
