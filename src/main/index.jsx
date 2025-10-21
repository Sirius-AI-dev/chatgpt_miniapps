import React, { useEffect, useRef, useState } from "react";
import { useOpenAiGlobal } from "../use-openai-global";
import { useMaxHeight } from "../use-max-height";
import {
  Routes,
  Route,
  BrowserRouter
} from "react-router-dom";

export default function App() {
  const [viewState, setViewState] = useState(() => ({
    version: "1.0"
  }));
  const displayMode = useOpenAiGlobal("displayMode");
  const maxHeight = useMaxHeight() ?? undefined;

  return (
    <>
      <div
        style={{
          maxHeight,
          height: displayMode === "fullscreen" ? maxHeight - 40 : 480,
        }}
        className={
          "relative antialiased w-full min-h-[480px] overflow-hidden " +
          (displayMode === "fullscreen"
            ? "rounded-none border-0"
            : "border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl")
        }
      >
        <button
          aria-label="Next"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-black shadow-lg ring ring-black/5 hover:bg-white"
          type="button"
        >
          Text
        </button>
      </div>
    </>
  );
}


function RouterRoot() {
  return (
    <Routes>
      <Route path="*" element={<App />}>
        <Route path="page/:pageId" element={<></>} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("chatgpt-app-root")).render(
  <BrowserRouter>
    <RouterRoot />
  </BrowserRouter>
);