"use client"

import { useCallback } from "react"

type SoundType = "success" | "error" | "click" | "notification" | "focus"

interface UseAudioFeedbackReturn {
  playSound: (type: SoundType) => void
  playCustomSound: (frequency: number, duration: number) => void
}

export function useAudioFeedback(): UseAudioFeedbackReturn {
  const playSound = useCallback((type: SoundType) => {
    if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
      console.warn("[v0] Web Audio API is not supported")
      return
    }

    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // 사운드 타입별 설정
    switch (type) {
      case "success":
        oscillator.frequency.value = 800
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break

      case "error":
        oscillator.frequency.value = 200
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.4)
        break

      case "click":
        oscillator.frequency.value = 600
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
        break

      case "notification":
        oscillator.frequency.value = 1000
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        break

      case "focus":
        oscillator.frequency.value = 400
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.15)
        break
    }

    console.log("[v0] Audio feedback played:", type)
  }, [])

  const playCustomSound = useCallback((frequency: number, duration: number) => {
    if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
      return
    }

    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)

    console.log("[v0] Custom audio feedback played:", frequency, duration)
  }, [])

  return {
    playSound,
    playCustomSound,
  }
}
