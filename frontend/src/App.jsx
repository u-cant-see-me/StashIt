import "./App.css";
import Main from "./components/Main";
import Nav from "./components/Nav";
import { Toaster } from "react-hot-toast";
import Download from "./components/Download";
import { useSessionContext } from "./contexts/SessionContext";
import { SpeedInsights } from "@vercel/speed-insights/react";
function App() {
  const { sessionInfo } = useSessionContext();
  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="h-screen w-screen px-1 sm:px-10 md:px-20 pt-5  ">
        <Nav />
        <main className="h-[85%]  bg-neutral-950 font-mono p-4 md:p-10 rounded-2xl text-neutral-200">
          {sessionInfo.page === "main" ? <Main /> : <Download />}
        </main>
      </div>
      <SpeedInsights />
    </>
  );
}

export default App;
