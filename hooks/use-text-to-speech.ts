"use client"

import { useEffect, useState, useCallback } from "react"

interface UseTextToSpeechReturn {
  speak: (text: string, options?: SpeechSynthesisUtterance) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  setVoice: (voice: SpeechSynthesisVoice) => void
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)

        // 한국어 음성 우선 선택
        const koreanVoice = availableVoices.find((voice) => voice.lang.startsWith("ko"))
        if (koreanVoice) {
          setSelectedVoice(koreanVoice)
        }
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const speak = useCallback(
    (text: string, options?: Partial<SpeechSynthesisUtterance>) => {
      if (!isSupported) {
        console.warn("[v0] Text-to-speech is not supported")
        return
      }

      // 이전 음성 중지
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ko-KR"
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      // 옵션 적용
      if (options) {
        Object.assign(utterance, options)
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        console.log("[v0] Speech started:", text)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        console.log("[v0] Speech ended")
      }

      utterance.onerror = (event) => {
        setIsSpeaking(false)
        console.error("[v0] Speech error:", event.error)
      }

      window.speechSynthesis.speak(utterance)
    },
    [isSupported, selectedVoice],
  )

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      console.log("[v0] Speech stopped")
    }
  }, [isSupported])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    setVoice: setSelectedVoice,
  }
}
