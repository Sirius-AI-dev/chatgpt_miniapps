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
  const themeMode = useOpenAiGlobal("theme");
  const userAgent = useOpenAiGlobal("userAgent");
  const deviceType = userAgent.device;

  // Bind toolData to actual "toolOutput" data
  const toolData = useOpenAiGlobal("toolOutput");


  // --- Click handler for Watch button ---
  const onWatchClick = async () => {
    if (!toolData?.app?.video_url) {
      return;
    }
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

  const isMobile = deviceType === "mobile";
  const baseHeight = isMobile ? 360 : 480;
  const containerHeight =
    displayMode === "fullscreen" ? effectiveMax : baseHeight;
  const containerMinHeightClass = isMobile
    ? "min-h-[360px]"
    : "min-h-[480px]";
  const pictureUrl = isMobile
    ? toolData?.app?.mobile?.picture_url
    : toolData?.app?.picture_url;
  const pictureDescription = isMobile
    ? toolData?.app?.mobile?.description
    : toolData?.app?.description;
  const pictureDimensionsClass = isMobile
    ? "w-[480px] h-[360px]"
    : "w-[640px] h-[480px]";
  const watchButtonVisible = Boolean(toolData?.app?.video_url && pictureUrl);
  const topControlButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow transition hover:bg-white dark:bg-black/60 dark:text-white";
  const watchButtonClass =
    "absolute bottom-4 right-4 rounded-full bg-green-600 px-5 py-3 text-white shadow-lg transition hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500/50";
  const themeToggle = () =>
    setOpenAIGlobal("theme", themeMode === "dark" ? "light" : "dark");
  const displayToggle = () =>
    setDisplayMode(displayMode === "fullscreen" ? "inline" : "fullscreen");
  const noContentIcon =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA2NCA2NCcgZmlsbD0nbm9uZSc+CiAgPGNpcmNsZSBjeD0nMjgnIGN5PScyOCcgcj0nMTYnIHN0cm9rZT0nIzRCNTU2Mycgc3Ryb2tlLXdpZHRoPSc0Jy8+CiAgPGxpbmUgeDE9JzM5JyB5MT0nMzknIHgyPSc1NCcgeTI9JzU0JyBzdHJva2U9JyM0QjU1NjMnIHN0cm9rZS13aWR0aD0nNCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJy8+CiAgPHBhdGggZD0nTTIwIDI4aDE2JyBzdHJva2U9JyM0QjU1NjMnIHN0cm9rZS13aWR0aD0nNCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJy8+Cjwvc3ZnPg==";

  // Build React template to display
  return (
    <div
      style={{
        maxHeight: rawMax,
        height: containerHeight,
      }}
      className={
        "relative antialiased w-full overflow-hidden " +
        containerMinHeightClass +
        " " +
        (displayMode === "fullscreen"
          ? "rounded-none border-0"
          : "border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl")
      }
    >
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          type="button"
          onClick={themeToggle}
          className={topControlButtonClass}
          aria-label="Toggle theme"
          title={
            themeMode === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
        >
          {themeMode === "dark" ? "🌙" : "🌞"}
        </button>
        <button
          type="button"
          onClick={displayToggle}
          className={topControlButtonClass}
          aria-label="Toggle display mode"
          title={
            displayMode === "fullscreen"
              ? "Switch to inline mode"
              : "Switch to fullscreen"
          }
        >
          {displayMode === "fullscreen" ? "🗗" : "⛶"}
        </button>
      </div>
      {!toolData ? (
        <div className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-2 text-gray-500">
          <span className="text-lg font-medium">Loading content…</span>
        </div>
      ) : !toolData.app ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-gray-600 dark:text-gray-300">
          <img src={noContentIcon} alt="No content" className="h-20 w-20" />
          <span className="text-lg font-semibold">No content found</span>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-4">
          {pictureUrl ? (
            <img
              src={pictureUrl}
              alt={toolData.app.video_title || "Preview"}
              title={pictureDescription || ""}
              className={`rounded-xl object-cover shadow-md ${pictureDimensionsClass}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-500">
              Image unavailable
            </div>
          )}
          {watchButtonVisible && (
            <button
              type="button"
              onClick={onWatchClick}
              className={watchButtonClass}
              aria-label="Watch"
              title="Watch"
            >
              Watch
            </button>
          )}
        </div>
      )}
    </div>
  );
}