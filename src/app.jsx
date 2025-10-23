// React types and functions
import React from "react";
import { Moon, Sun, Maximize2, Minimize2 } from "lucide-react";
// OpenAI types and functions
import { 
  useOpenAiGlobal,
  setOpenAIGlobal, 
  useWidgetState, 
  callTool,  
  sendMessage,  
  setDisplayMode,  
  openExternalURL
} from "./openai_utils";
import {
  SET_GLOBALS_EVENT_TYPE,
  SetGlobalsEvent,
  OpenAiGlobals,
  DeviceType,
  UserAgent,
  DisplayMode,
  RequestDisplayMode,
  CallToolResponse,
  CallTool,
  Theme
} from "./openai_types";


export default function App() {
  // Read actual display mode, max height, theme and device
  const displayMode = useOpenAiGlobal("displayMode");
  const rawMax = useOpenAiGlobal("maxHeight");
  const effectiveMax =
    typeof rawMax === "number" ? Math.max(0, rawMax - 40) : 480;
  const themeMode = useOpenAiGlobal('theme');
  const userAgent = useOpenAiGlobal('userAgent');
  const deviceType = userAgent.device;

  // Bind toolData to actual "toolOutput" data
  const toolData = useOpenAiGlobal('toolOutput');

  const isDarkMode = themeMode === "dark";
  const isFullscreen = displayMode === "fullscreen";

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    try {
      setOpenAIGlobal("theme", nextTheme);
    } catch (err) {
      console.error("[MCP app] toggleTheme failed:", err);
    }
  };

  const toggleFullscreen = async () => {
    const nextMode = isFullscreen ? "inline" : "fullscreen";
    try {
      await setDisplayMode(nextMode);
    } catch (err) {
      console.error("[MCP app] toggleFullscreen failed:", err);
    }
  };


  // --- Click handler for Watch button ---
  const onWatchClick = async () => {
    try {

      // 1) Open the external YouTube URL
      openExternalURL(toolData.app.video_url);

      // 2) Read user_session_id from toolOutput
      let sid = toolData.app.user_session_id ?? null;

      // 3. Call "watch_click_event" method
      const params = { user_session_id: sid };
      await callTool("watch_click_event", params);

    } catch (err) {
      console.error("[MCP app] onWatchClick failed:", err);
    }
  };



  // Build React template to display
  return (
    <div
      style={{
        maxHeight: rawMax,
        height: displayMode === "fullscreen" ? effectiveMax : 480,
      }}
      className={
        "relative antialiased w-full min-h-[480px] overflow-hidden " +
        (displayMode === "fullscreen"
          ? "rounded-none border-0"
          : "border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl")
      }
    >
      {!toolData ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          Waiting for structured content…
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-4 items-center text-center">
          <div className="w-full flex justify-end">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-black shadow-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white"
                aria-label="Toggle theme"
                title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-black shadow-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Maximize2 className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          {toolData.app.picture_url && (
            <img
              src={toolData.app.picture_url}
              alt={toolData.app.video_title || "Preview"}
              className="w-full max-w-md rounded-xl shadow-md"
            />
          )}


          {/* Bottom-right "Watch" button */}
          <button
            type="button"
            onClick={onWatchClick}
            className="absolute bottom-4 right-6 px-5 py-3 rounded-full bg-green-600 text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500/50 animate-pulse"
            aria-label="Watch on YouTube"
            title="Watch on YouTube"
          >
            Watch
          </button>

        </div>
      )}
    </div>
  );
}