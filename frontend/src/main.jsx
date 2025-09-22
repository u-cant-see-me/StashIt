import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { FileProvider } from "./contexts/FileContext.jsx";
import NetworkProvider from "./contexts/NetworkContext.jsx";
import { SessionProvider } from "./contexts/SessionContext.jsx";
import { KeyProvider } from "./contexts/KeyContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NetworkProvider>
      <SessionProvider>
        <FileProvider>
          <KeyProvider>
            <App />
          </KeyProvider>
        </FileProvider>
      </SessionProvider>
    </NetworkProvider>
  </StrictMode>
);
