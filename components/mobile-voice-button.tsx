"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { parseSimpleVoiceCommand } from "@/lib/voice-commands"
import { classifyIntent } from "@/lib/api-client"
import { useEffect, useState } from "react"

interface MobileVoiceButtonProps {
  onCommand?: (command: string, transcript: string) => void
}

export function MobileVoiceButton({ onCommand }: MobileVoiceButtonProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition()
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("")

  // 음성 인식 종료 시점에 명령 처리 (모바일 대응)
  useEffect(() => {
    if (transcript && !isListening && transcript !== lastProcessedTranscript) {
      console.log('[Mobile Voice Button] Processing transcript after recognition ended:', transcript)

      // 음성 인식이 종료되었을 때 즉시 처리
      const processCommand = async () => {
        // 먼저 패턴 매칭 시도
        let command = parseSimpleVoiceCommand(transcript)

        // 패턴 매칭 실패 시 AI로 의도 분류
        if (!command) {
          console.log('[Mobile Voice Button] Pattern matching failed, trying AI classification...')
          const intentResult = await classifyIntent(transcript)
          console.log('[Mobile Voice Button] AI Classification:', intentResult)

          // AI가 일정 추가 의도로 분류하고 confidence가 0.5 이상이면
          if (intentResult.intent === 'ADD_EVENT' && intentResult.confidence >= 0.5) {
            command = 'ADD_EVENT'
          } else if (intentResult.intent !== 'UNKNOWN' && intentResult.confidence >= 0.7) {
            // 다른 명령도 높은 확신도면 사용
            command = intentResult.intent
          }
        }

        if (command && onCommand) {
          console.log('[Mobile Voice Button] Command recognized:', command)
          onCommand(command, transcript)
          setLastProcessedTranscript(transcript)
        } else {
          console.log('[Mobile Voice Button] No command recognized for:', transcript)
        }
      }

      processCommand()
    }
  }, [transcript, isListening, lastProcessedTranscript, onCommand])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // 음성 인식이 지원되지 않으면 렌더링하지 않음
  if (!isSupported) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <Button
        variant={isListening ? "default" : "outline"}
        size="lg"
        onClick={toggleListening}
        className={`h-16 w-16 rounded-full shadow-lg transition-all ${
          isListening ? "animate-pulse bg-primary" : ""
        }`}
        aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
        aria-pressed={isListening}
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>

      {/* 현재 음성 인식 중인 텍스트 표시 (옵션) */}
      {isListening && transcript && (
        <div className="absolute bottom-20 right-0 max-w-[200px] rounded-lg border-2 border-primary bg-background p-3 shadow-lg">
          <p className="text-xs text-foreground">{transcript}</p>
        </div>
      )}
    </div>
  )
}
