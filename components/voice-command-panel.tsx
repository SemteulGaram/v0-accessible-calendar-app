"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { parseVoiceCommand, VOICE_COMMANDS } from "@/lib/voice-commands"
import { useEffect } from "react"

interface VoiceCommandPanelProps {
  onCommand?: (command: string) => void
}

export function VoiceCommandPanel({ onCommand }: VoiceCommandPanelProps) {
  const { isListening, transcript, startListening, stopListening, isSupported, error } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) {
      const command = parseVoiceCommand(transcript)
      if (command && onCommand) {
        onCommand(command)
      }
    }
  }, [transcript, onCommand])

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
