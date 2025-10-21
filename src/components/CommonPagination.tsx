'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { usePageTransition } from '@/hooks/usePageTransition'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface CommonPaginationProps {
  total: number
  page: number
  limit: number
}

export default function CommonPagination({ total, page, limit }: CommonPaginationProps) {
  const searchParams = useSearchParams()
  const { pushTransition } = usePageTransition()

  const totalPages = Math.ceil(total / limit)

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', newPage.toString())
      pushTransition(`?${params.toString()}`)
    },
    [pushTransition, searchParams]
  )

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <Pagination>
        <PaginationContent>
          <PaginationItem className="cursor-pointer">
            <PaginationPrevious
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i} className="cursor-pointer">
              <PaginationLink isActive={page === i + 1} onClick={() => handlePageChange(i + 1)}>
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem className="cursor-pointer">
            <PaginationNext
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
