"use client"

import { useEffect, useState, useCallback } from "react"

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  isSupported: boolean
  error: string | null
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "ko-KR"

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPart + " "
            } else {
              interimTranscript += transcriptPart
            }
          }

          setTranscript(finalTranscript || interimTranscript)
          console.log("[v0] Speech recognized:", finalTranscript || interimTranscript)
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("[v0] Speech recognition error:", event.error)
          setError(event.error)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          console.log("[v0] Speech recognition ended")
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      } else {
        setIsSupported(false)
        setError("음성 인식이 지원되지 않는 브라우저입니다")
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript("")
      setError(null)
      recognition.start()
      setIsListening(true)
      console.log("[v0] Speech recognition started")
    }
  }, [recognition, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
      console.log("[v0] Speech recognition stopped")
    }
  }, [recognition, isListening])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
  }
}
