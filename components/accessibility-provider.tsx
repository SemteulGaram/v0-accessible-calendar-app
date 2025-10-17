"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useAudioFeedback } from "@/hooks/use-audio-feedback"

interface AccessibilityContextType {
  speak: (text: string) => void
  stopSpeaking: () => void
  isSpeaking: boolean
  playSound: (type: "success" | "error" | "click" | "notification" | "focus") => void
  announceAction: (action: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { speak, stop, isSpeaking } = useTextToSpeech()
  const { playSound } = useAudioFeedback()

  const announceAction = (action: string) => {
    speak(action)
    playSound("notification")
  }

  return (
    <AccessibilityContext.Provider
      value={{
        speak,
        stopSpeaking: stop,
        isSpeaking,
        playSound,
        announceAction,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider")
  }
  return context
}
