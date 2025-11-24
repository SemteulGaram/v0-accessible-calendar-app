"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mic, MicOff, AlertCircle } from "lucide-react"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { VoiceConversationManager } from "@/lib/voice-conversation"
import type { CalendarEvent } from "@/types/calendar"

interface VoiceConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventComplete: (event: Omit<CalendarEvent, "id">) => void
  initialTranscript?: string
}

export function VoiceConversationDialog({
  open,
  onOpenChange,
  onEventComplete,
  initialTranscript,
}: VoiceConversationDialogProps) {
  const [conversationManager] = useState(() => new VoiceConversationManager())
  const [conversationLog, setConversationLog] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("")
  const initialProcessedRef = useRef<boolean>(false)
  const conversationLogRef = useRef<HTMLDivElement>(null)

  const { speak, isSpeaking } = useTextToSpeech()
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition()

  // 대화 시작
  useEffect(() => {
    if (open) {
      conversationManager.start()
      setConversationLog([])
      setError(null)
      setLastProcessedTranscript("")
      initialProcessedRef.current = false

      // 초기 transcript가 있으면 바로 처리
      if (initialTranscript && initialTranscript.trim() && !initialProcessedRef.current) {
        initialProcessedRef.current = true

        // 사용자가 이미 말한 내용을 로그에 추가
        setConversationLog([{ role: 'user', text: initialTranscript }])

        // 즉시 AI 처리 시작
        setTimeout(() => {
          handleUserInput(initialTranscript)
        }, 100)
      } else if (!initialTranscript || !initialTranscript.trim()) {
        // 초기 transcript가 없으면 기존 방식대로 진행
        const initialMessage = "일정 추가를 시작합니다. 언제 일정을 추가하시겠습니까?"
        setConversationLog([{ role: 'assistant', text: initialMessage }])
        speak(initialMessage)

        // 자동으로 음성 인식 시작
        setTimeout(() => {
          startListening()
        }, 4000)
      }
    } else {
      // 대화 종료 시 정리
      conversationManager.reset()
      stopListening()
      setLastProcessedTranscript("")
      initialProcessedRef.current = false
    }
  }, [open, initialTranscript])

  // 대화 로그가 업데이트되면 자동 스크롤
  useEffect(() => {
    if (conversationLogRef.current) {
      conversationLogRef.current.scrollTop = conversationLogRef.current.scrollHeight
    }
  }, [conversationLog])

  // TTS가 끝나면 자동으로 음성 인식 시작
  useEffect(() => {
    if (open && !isSpeaking && !isListening && !isProcessing && conversationLog.length > 0) {
      // 마지막 메시지가 assistant 메시지인 경우에만 자동 시작
      const lastMessage = conversationLog[conversationLog.length - 1]
      if (lastMessage.role === 'assistant') {
        setTimeout(() => {
          if (!isListening && !isProcessing) {
            startListening()
          }
        }, 1000) // TTS 종료 후 1초 대기
      }
    }
  }, [isSpeaking, open, conversationLog, isListening, isProcessing])

  // 음성 인식 종료 시점에 명령 처리 (모바일 대응)
  useEffect(() => {
    if (transcript && !isProcessing && !isListening && transcript !== lastProcessedTranscript) {
      console.log('[Voice Conversation Dialog] Processing transcript after recognition ended:', transcript)

      // 음성 인식이 종료되었을 때 즉시 처리
      handleUserInput(transcript)
      setLastProcessedTranscript(transcript)
    }
  }, [transcript, isListening, isProcessing, lastProcessedTranscript])

  // 날짜를 "11월 15일" 형식으로 변환
  const formatDateKorean = (date: Date): string => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}월 ${day}일`
  }

  const handleUserInput = async (userInput: string) => {
    if (!userInput.trim() || isProcessing) return

    setIsProcessing(true)
    stopListening()

    // 사용자 입력 로그에 추가
    setConversationLog(prev => [...prev, { role: 'user', text: userInput }])

    try {
      // AI로 입력 처리
      const result = await conversationManager.processVoiceInput(userInput)

      if (result.error) {
        setError(result.error)
        const errorMessage = `오류가 발생했습니다: ${result.error}`
        setConversationLog(prev => [...prev, { role: 'assistant', text: errorMessage }])
        speak(errorMessage)
        setIsProcessing(false)
        return
      }

      if (result.complete && result.event) {
        // 일정 정보 수집 완료
        const dateStr = formatDateKorean(result.event.startDate)
        const timeStr = result.event.startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        const completeMessage = `${result.event.title} 일정을 ${dateStr} ${timeStr}에 추가했습니다.`
        setConversationLog(prev => [...prev, { role: 'assistant', text: completeMessage }])
        speak(completeMessage)

        // 일정 추가
        setTimeout(() => {
          onEventComplete(result.event!)
          onOpenChange(false)
        }, 3000)
      } else if (result.question) {
        // 다음 질문
        setConversationLog(prev => [...prev, { role: 'assistant', text: result.question! }])
        speak(result.question)
        setIsProcessing(false)
        // TTS 종료 후 자동으로 음성 인식이 시작됨 (useEffect 참조)
      }
    } catch (err) {
      const errorMessage = `처리 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
      setError(errorMessage)
      setConversationLog(prev => [...prev, { role: 'assistant', text: errorMessage }])
      speak(errorMessage)
      setIsProcessing(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            음성으로 일정 추가
          </DialogTitle>
          <DialogDescription>
            음성으로 일정 날짜, 시간, 내용을 말씀해 주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 대화 로그 */}
          <div
            ref={conversationLogRef}
            className="max-h-[300px] min-h-[200px] overflow-y-auto rounded-lg border bg-muted/50 p-4 space-y-3"
          >
            {conversationLog.map((log, index) => (
              <div
                key={index}
                className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    log.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{log.text}</p>
                </div>
              </div>
            ))}

            {/* 현재 음성 인식 중인 텍스트 */}
            {isListening && transcript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg border-2 border-primary bg-primary/10 px-4 py-2">
                  <p className="text-sm opacity-70">{transcript}</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-secondary px-4 py-2">
                  <p className="text-sm text-secondary-foreground opacity-70">처리 중...</p>
                </div>
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* 컨트롤 버튼 */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {isListening && !isProcessing && (
                <span className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  듣는 중...
                </span>
              )}
              {!isListening && !isProcessing && <span>마이크를 클릭하여 말씀하세요</span>}
              {isProcessing && <span>AI가 처리 중입니다...</span>}
            </div>

            <div className="flex gap-2">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="lg"
                onClick={toggleListening}
                disabled={isProcessing || isSpeaking}
                aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
              >
                {isListening ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    중지
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    말하기
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
