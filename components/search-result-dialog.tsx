"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, Calendar, Clock } from "lucide-react"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { useEffect } from "react"
import type { SearchEventsResult, SummarizeEventsResult } from "@/lib/api-client"

interface SearchResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'search' | 'summary'
  searchResult?: SearchEventsResult | null
  summaryResult?: SummarizeEventsResult | null
  isLoading?: boolean
}

export function SearchResultDialog({
  open,
  onOpenChange,
  type,
  searchResult,
  summaryResult,
  isLoading,
}: SearchResultDialogProps) {
  const { speak } = useTextToSpeech()

  // 검색 결과가 나오면 음성으로 읽어주기
  useEffect(() => {
    if (!open || isLoading) return

    if (type === 'search' && searchResult) {
      // 검색 결과 음성 출력
      if (searchResult.results.length === 0) {
        speak("일정을 찾을 수 없습니다.")
      } else {
        const resultCount = searchResult.results.length
        const firstResult = searchResult.results[0]
        const startDate = new Date(firstResult.startDate)
        const dateStr = `${startDate.getMonth() + 1}월 ${startDate.getDate()}일`
        const timeStr = startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

        let message = `${resultCount}개의 일정을 찾았습니다. `
        if (resultCount === 1) {
          message += `${firstResult.title} 일정이 ${dateStr} ${timeStr}에 있습니다.`
        } else {
          message += `첫 번째는 ${firstResult.title} 일정으로 ${dateStr} ${timeStr}에 있습니다.`
        }
        speak(message)
      }
    } else if (type === 'summary' && summaryResult) {
      // 요약 결과 음성 출력
      speak(summaryResult.summary)
    }
  }, [open, type, searchResult, summaryResult, isLoading, speak])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'search' ? (
              <>
                <Search className="h-5 w-5" />
                일정 검색 결과
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                일정 요약
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {type === 'search'
              ? 'AI가 찾은 관련 일정입니다.'
              : 'AI가 요약한 일정 정보입니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* 검색 결과 */}
          {!isLoading && type === 'search' && searchResult && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{searchResult.message}</p>

              {searchResult.results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  일정을 찾을 수 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResult.results.map((result) => {
                    const startDate = new Date(result.startDate)
                    const dateStr = `${startDate.getMonth() + 1}월 ${startDate.getDate()}일`
                    const timeStr = startDate.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })

                    return (
                      <div
                        key={result.id}
                        className="rounded-lg border bg-card p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg">{result.title}</h3>
                          <span className="text-xs text-muted-foreground">
                            관련도: {Math.round(result.relevanceScore * 100)}%
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {dateStr}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {timeStr}
                          </div>
                        </div>

                        {result.description && (
                          <p className="text-sm text-muted-foreground">{result.description}</p>
                        )}

                        <p className="text-xs text-primary italic">{result.reason}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* 요약 결과 */}
          {!isLoading && type === 'summary' && summaryResult && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {summaryResult.timeRange}
                </p>
                <p className="text-base leading-relaxed">{summaryResult.summary}</p>
              </div>

              {summaryResult.highlights.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">주요 일정</h3>
                  <ul className="space-y-2">
                    {summaryResult.highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-sm text-muted-foreground text-center">
                총 {summaryResult.eventCount}개의 일정
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
