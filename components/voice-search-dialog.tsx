"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, Mic, MicOff } from "lucide-react"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

interface VoiceSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch: (query: string) => void
  initialQuery?: string
}

export function VoiceSearchDialog({
  open,
  onOpenChange,
  onSearch,
  initialQuery,
}: VoiceSearchDialogProps) {
  const [conversationLog, setConversationLog] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("")
  const initialProcessedRef = useRef<boolean>(false)
  const conversationLogRef = useRef<HTMLDivElement>(null)

  const { speak, isSpeaking } = useTextToSpeech()
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition()

  // 대화 시작
  useEffect(() => {
    if (open) {
      setConversationLog([])
      setLastProcessedTranscript("")
      initialProcessedRef.current = false

      // 명령어 키워드 필터링 (검색어가 아닌 명령어 자체인지 확인)
      const isCommandKeywordOnly = (query: string): boolean => {
        const trimmedQuery = query.trim().toLowerCase()
        const commandKeywords = [
          '일정 검색', '일정검색', '검색', '찾기', '찾아줘', '찾아 줘',
          'search', 'find'
        ]
        return commandKeywords.includes(trimmedQuery)
      }

      // 초기 쿼리가 있고 명령어가 아닌 실제 검색어인 경우에만 바로 검색
      if (initialQuery && initialQuery.trim() && !isCommandKeywordOnly(initialQuery) && !initialProcessedRef.current) {
        initialProcessedRef.current = true
        setConversationLog([{ role: 'user', text: initialQuery }])

        // 즉시 검색 실행
        setTimeout(() => {
          onSearch(initialQuery)
          onOpenChange(false)
        }, 100)
      } else {
        // 초기 쿼리가 없거나 명령어만 있으면 안내 메시지
        const initialMessage = "무엇을 검색하시겠습니까?"
        setConversationLog([{ role: 'assistant', text: initialMessage }])
        speak(initialMessage)

        // 자동으로 음성 인식 시작
        setTimeout(() => {
          startListening()
        }, 3000)
      }
    } else {
      // 대화 종료 시 정리
      stopListening()
      setLastProcessedTranscript("")
      initialProcessedRef.current = false
    }
  }, [open, initialQuery])

  // 대화 로그가 업데이트되면 자동 스크롤
  useEffect(() => {
    if (conversationLogRef.current) {
      conversationLogRef.current.scrollTop = conversationLogRef.current.scrollHeight
    }
  }, [conversationLog])

  // TTS가 끝나면 자동으로 음성 인식 시작
  useEffect(() => {
    if (open && !isSpeaking && !isListening && conversationLog.length > 0) {
      // 마지막 메시지가 assistant 메시지인 경우에만 자동 시작
      const lastMessage = conversationLog[conversationLog.length - 1]
      if (lastMessage.role === 'assistant') {
        setTimeout(() => {
          if (!isListening) {
            startListening()
          }
        }, 1000) // TTS 종료 후 1초 대기
      }
    }
  }, [isSpeaking, open, conversationLog, isListening])

  // 음성 인식 종료 시점에 명령 처리 (모바일 대응)
  useEffect(() => {
    if (transcript && !isListening && transcript !== lastProcessedTranscript) {
      console.log('[Voice Search Dialog] Processing transcript after recognition ended:', transcript)

      // 음성 인식이 종료되었을 때 즉시 처리
      handleUserInput(transcript)
      setLastProcessedTranscript(transcript)
    }
  }, [transcript, isListening, lastProcessedTranscript])

  const handleUserInput = (userInput: string) => {
    if (!userInput.trim()) return

    stopListening()

    // 사용자 입력 로그에 추가
    setConversationLog(prev => [...prev, { role: 'user', text: userInput }])

    // 검색 실행
    onSearch(userInput)
    onOpenChange(false)
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
            <Search className="h-5 w-5" />
            음성으로 일정 검색
          </DialogTitle>
          <DialogDescription>
            검색하고 싶은 일정을 말씀해 주세요.
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
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {isListening && (
                <span className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  듣는 중...
                </span>
              )}
              {!isListening && <span>마이크를 클릭하여 말씀하세요</span>}
            </div>

            <div className="flex gap-2">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="lg"
                onClick={toggleListening}
                disabled={isSpeaking}
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
