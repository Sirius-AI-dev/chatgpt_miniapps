// React types and functions
import React, { useEffect, useState } from "react";
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
        <div className="p-4 flex flex-col items-center text-center gap-3">
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
            className="absolute bottom-4 right-4 px-5 py-3 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500/50"
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