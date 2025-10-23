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

  // Prepare data based on device type and other parameters
  const isDarkMode = themeMode === "dark";
  const isFullscreen = displayMode === "fullscreen";
  const isMobile = deviceType === "mobile";

  const baseHeight = isMobile ? 360 : 480;
  const containerHeight =
    displayMode === "fullscreen" ? effectiveMax : baseHeight;
  const containerMinHeightClass = isMobile
    ? "min-h-[360px]"
    : "min-h-[480px]";

  // Prepare data to display
  const videoUrl = isMobile
    ? toolData?.app?.mobile?.video_url
    : toolData?.app?.video_url;
  const pictureUrl = isMobile
    ? toolData?.app?.mobile?.picture_url
    : toolData?.app?.picture_url;
  const pictureDescription = isMobile
    ? toolData?.app?.mobile?.description
    : toolData?.app?.description;
  const pictureDimensionsClass = isMobile
    ? "w-[480px] h-[360px]"
    : "w-[640px] h-[480px]";
  const watchButtonVisible = Boolean(videoUrl && pictureUrl);

  // Classes to display
  const topControlButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow transition hover:bg-white dark:bg-black/60 dark:text-white";
  const watchButtonClass =
    "absolute bottom-4 right-6 px-5 py-3 rounded-full bg-green-600 text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500/50 animate-pulse";
  const noContentIcon =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA2NCA2NCcgZmlsbD0nbm9uZSc+CiAgPGNpcmNsZSBjeD0nMjgnIGN5PScyOCcgcj0nMTYnIHN0cm9rZT0nIzRCNTU2Mycgc3Ryb2tlLXdpZHRoPSc0Jy8+CiAgPGxpbmUgeDE9JzM5JyB5MT0nMzknIHgyPSc1NCcgeTI9JzU0JyBzdHJva2U9JyM0QjU1NjMnIHN0cm9rZS13aWR0aD0nNCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJy8+CiAgPHBhdGggZD0nTTIwIDI4aDE2JyBzdHJva2U9JyM0QjU1NjMnIHN0cm9rZS13aWR0aD0nNCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJy8+Cjwvc3ZnPg==";

  // Toggle light | dark mode
  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    try {
      setOpenAIGlobal("theme", nextTheme);
    } catch (err) {
      console.error("[MCP app] toggleTheme failed:", err);
    }
  };

  // Toggle fullscreen
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
    if (!videoUrl) {
      return;
    }
    try {
      // 1) Open the external YouTube URL
      openExternalURL(videoUrl);

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
      /* Display a picture */
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
      {/* Content is preparing */}
      {!toolData ? (
        <div className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-2 text-gray-500">
          <span className="text-lg font-medium">Loading content…</span>
        </div>
        /* No content found => display just one message */
      ) : (pictureUrl == "") ? (
        <div className="flex h-20 w-full flex-col items-center justify-center gap-4 text-gray-600 dark:text-gray-300">
          <img src={noContentIcon} alt="No content" className="h-20 w-20" />
          <span className="text-lg font-semibold">No content found</span>
        </div>
      ) : (
        /* Display content */
        <div className="flex h-full w-full flex-col items-center justify-center p-4">
          {/* Theme and Fullscreen toggles. Comment if not required */}
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
                {isFullscreen ? "🔳" : "🔲"}
              </button>
            </div>
          </div>
          {/* Display a picture */}
          {pictureUrl ? (
            <img
              src={pictureUrl}
              alt={pictureDescription || "Preview"}
              title={pictureDescription || ""}
              className={`rounded-xl object-cover shadow-md ${pictureDimensionsClass}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-500">
              Image unavailable
            </div>
          )}
          {/* Display call-to-action button */}
          {watchButtonVisible && (
            <button
              type="button"
              onClick={onWatchClick}
              className={watchButtonClass}
              aria-label="Watch on YouTube"
              title="Watch on YouTube"
            >
              Watch 1
            </button>
          )}
        </div>
      )}
    </div>
  );
}