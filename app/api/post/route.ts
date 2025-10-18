import { NextRequest, NextResponse } from 'next/server'
import { getPost } from '@/lib/posts'
import { getSupabasePost } from '@/lib/supabase-posts'

const USE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    if (USE_SUPABASE) {
      // Supabase에서 포스트 가져오기
      const data = await getSupabasePost(slug)
      if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
      return NextResponse.json({
        frontmatter: {
          title: data.title,
          date: data.date,
          summary: data.summary,
          image: data.image,
          author: data.author,
          category: data.category,
          subCategory: data.sub_category,
          status: data.status,
          featured: data.featured,
          tags: data.tags,
        },
        content: data.content,
      })
    } else {
      // 기존 MDX 파일에서 포스트 가져오기
      const data = getPost(slug)
      if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
      return NextResponse.json(data)
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 })
  }
}


