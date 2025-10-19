import { NextRequest } from 'next/server'
import { mockNotifications } from './libs/data'

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams
  const type = params.get('type')
  const page = params.get('page') || '1'
  const per_page = params.get('per_page') || '20'

  let data = mockNotifications
  if (type) {
    data = data.filter((n) => n.type === type)
  }
  const pageNum = parseInt(page, 10)
  const perPageNum = parseInt(per_page, 10)
  const start = (pageNum - 1) * perPageNum
  const end = start + perPageNum
  const filteredData = data.slice(start, end)

  return new Response(
    JSON.stringify({
      status: 'success',
      data: filteredData,
      pagination: {
        page: parseInt(page, 10),
        per_page: parseInt(per_page, 10),
        total: data.length,
        totalPages: Math.ceil(data.length / parseInt(per_page, 10)),
      },
      message: 'Notifications fetched successfully',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
