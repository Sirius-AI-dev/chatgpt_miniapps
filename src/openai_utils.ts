import { useSyncExternalStore } from "react";
import { useCallback, useEffect, useState, type SetStateAction } from "react";

// Import OpenAI types
import {
  SET_GLOBALS_EVENT_TYPE,
  SetGlobalsEvent,
  type OpenAiGlobals,
  type DisplayMode,
  type UnknownObject,
} from "./openai_types";


// Subscribe to OpenAI events
export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
  key: K
): OpenAiGlobals[K] | null {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) {
          return;
        }

        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai?.[key] ?? null,
    () => window.openai?.[key] ?? null
  );
}


// Update a key in window.openai
export function setOpenAIGlobal<K extends keyof OpenAiGlobals>(
    key: K,
    value: OpenAiGlobals[K] | null
) {
    if (window.openai !== null && window.openai !== undefined) {

        window.openai[key] = value as any

        const event = new SetGlobalsEvent(SET_GLOBALS_EVENT_TYPE, {
            detail: {
                globals: {
                    [key]: value
                }
            }
        })

        window.dispatchEvent(event)
    }
}


// Update a props in the OpenAI Widget
export function useWidgetState<T extends UnknownObject>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void];
export function useWidgetState<T extends UnknownObject>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void];
export function useWidgetState<T extends UnknownObject>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void] {
  const widgetStateFromWindow = useOpenAiGlobal("widgetState") as T;

  const [widgetState, _setWidgetState] = useState<T | null>(() => {
    if (widgetStateFromWindow != null) {
      return widgetStateFromWindow;
    }

    return typeof defaultState === "function"
      ? defaultState()
      : defaultState ?? null;
  });

  useEffect(() => {
    _setWidgetState(widgetStateFromWindow);
  }, [widgetStateFromWindow]);

  const setWidgetState = useCallback(
    (state: SetStateAction<T | null>) => {
      _setWidgetState((prevState) => {
        const newState = typeof state === "function" ? state(prevState) : state;

        if (newState != null) {
          window.openai.setWidgetState(newState);
        }

        return newState;
      });
    },
    [window.openai.setWidgetState]
  );

  return [widgetState, setWidgetState] as const;
}


// Call an MCP tool
export async function callTool(tool_name: string, params: any) {

  const response = await window.openai.callTool(tool_name, params);

  if ("structuredContent" in response) {
      setOpenAIGlobal("toolOutput", (response.structuredContent ?? null) as UnknownObject | null);
  } else {
      const jsonResult = JSON.parse(response.result)
      setOpenAIGlobal("toolOutput", jsonResult)
  } 
}


// Send a message to ChatGPT chat
export async function sendMessage(message: string) {
  await window.openai?.sendFollowUpMessage({
    prompt: message,
  });
}


// Send a message to ChatGPT chat
export async function setDisplayMode(request_mode: DisplayMode) {
  await window.openai?.requestDisplayMode({
    mode: request_mode,
  });
}


// Open external URL
export async function openExternalURL(url: string) {
  await window.openai?.openExternal(
    { href: url}
  );
}


