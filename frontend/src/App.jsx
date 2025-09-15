import "./App.css";
import Main from "./components/Main";
import Nav from "./components/Nav";
import { Toaster } from "react-hot-toast";
import NetworkProvider from "./contexts/NetworkContext";
import { useState } from "react";
import { KeyProvider } from "./contexts/KeyContext";
import Download from "./components/Download";

function App() {
  const [currSection, setCurrSection] = useState("upload");

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* <NetworkProvider> */}
      <div className="h-screen w-screen px-20 pt-5  ">
        <Nav setCurrSection={setCurrSection} currSection={currSection} />
        <KeyProvider>
          <div className="h-[90%] bg-neutral-950 font-mono p-10 rounded-tl-2xl rounded-tr-2xl text-neutral-200">
            {currSection === "upload" ? <Main /> : <Download />}
          </div>
        </KeyProvider>
      </div>
      {/* </NetworkProvider> */}
    </>
  );
}

export default App;
