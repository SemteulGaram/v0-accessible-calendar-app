"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { parseSimpleVoiceCommand, VOICE_COMMANDS } from "@/lib/voice-commands"
import { classifyIntent } from "@/lib/api-client"
import { useEffect, useRef, useState } from "react"

interface VoiceCommandPanelProps {
  onCommand?: (command: string, transcript: string) => void
}

export function VoiceCommandPanel({ onCommand }: VoiceCommandPanelProps) {
  const { isListening, transcript, startListening, stopListening, isSupported, error } = useSpeechRecognition()
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("")

  // 디바운싱을 적용한 음성 명령 처리
  useEffect(() => {
    if (transcript && isListening && transcript !== lastProcessedTranscript) {
      // 기존 타이머 취소
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current)
      }

      // 1.5초 대기 후 처리 (사용자가 말을 멈출 때까지 기다림)
      transcriptTimeoutRef.current = setTimeout(async () => {
        if (transcript !== lastProcessedTranscript) {
          // 먼저 패턴 매칭 시도
          let command = parseSimpleVoiceCommand(transcript)

          // 패턴 매칭 실패 시 AI로 의도 분류
          if (!command) {
            console.log('[Voice Command Panel] Pattern matching failed, trying AI classification...')
            const intentResult = await classifyIntent(transcript)
            console.log('[Voice Command Panel] AI Classification:', intentResult)

            // AI가 일정 추가 의도로 분류하고 confidence가 0.5 이상이면
            if (intentResult.intent === 'ADD_EVENT' && intentResult.confidence >= 0.5) {
              command = 'ADD_EVENT'
            } else if (intentResult.intent !== 'UNKNOWN' && intentResult.confidence >= 0.7) {
              // 다른 명령도 높은 확신도면 사용
              command = intentResult.intent
            }
          }

          if (command && onCommand) {
            onCommand(command, transcript)
            setLastProcessedTranscript(transcript)
          } else {
            console.log('[Voice Command Panel] No command recognized for:', transcript)
          }
        }
      }, 1500)
    }

    // 클린업: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current)
      }
    }
  }, [transcript, isListening, lastProcessedTranscript, onCommand])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  if (!isSupported) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-destructive">
          <MicOff className="h-5 w-5" />
          <p className="text-sm">음성 인식이 지원되지 않는 브라우저입니다</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">음성 명령</h3>
          <Button
            variant={isListening ? "default" : "outline"}
            size="sm"
            onClick={toggleListening}
            aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
            aria-pressed={isListening}
          >
            {isListening ? (
              <>
                <Mic className="mr-2 h-4 w-4 animate-pulse" />
                듣는 중...
              </>
            ) : (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                음성 명령 시작
              </>
            )}
          </Button>
        </div>

        {isListening && (
          <div className="rounded-md bg-primary/10 p-3" role="status" aria-live="polite">
            <div className="flex items-start gap-2">
              <Volume2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-sm text-foreground">{transcript || "말씀하세요..."}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">사용 가능한 명령어:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {VOICE_COMMANDS.map((cmd, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-primary">•</span>
                <span>{cmd.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
