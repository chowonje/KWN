import { NextRequest, NextResponse } from 'next/server'
import { deletePost, getAllPosts, upsertPost } from '@/lib/posts'
import { 
  getSupabasePosts, 
  createSupabasePost, 
  updateSupabasePost, 
  deleteSupabasePost 
} from '@/lib/supabase-posts'
import { createClient } from '@supabase/supabase-js'

// 환경 변수로 Supabase 사용 여부 결정
const USE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 서버용 Supabase 클라이언트 (쿠키에서 인증 토큰 읽기)
function getSupabaseClient(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Authorization 헤더에서 토큰 가져오기
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  
  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function GET() {
  try {
    if (USE_SUPABASE) {
      // Supabase에서 포스트 가져오기
      const posts = await getSupabasePosts()
      return NextResponse.json(posts)
    } else {
      // 기존 MDX 파일에서 포스트 가져오기
      const posts = await getAllPosts()
      return NextResponse.json(posts)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, frontmatter, content } = await req.json()
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })
    
    // normalize tags: allow comma-separated string from forms
    const fm = { ...frontmatter }
    if (typeof fm.tags === 'string') {
      fm.tags = fm.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0)
    }

    if (USE_SUPABASE) {
      // Supabase 클라이언트 생성 (사용자 인증 포함)
      const supabase = getSupabaseClient(req)
      
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
      }

      // author_id와 author_name 자동 설정
      const authorId = user.id
      const authorName = user.user_metadata?.name || user.email || '익명'

      // Supabase에 저장
      // 기존 포스트가 있는지 확인 후 업데이트 또는 생성
      try {
        const result = await updateSupabasePost(slug, {
          title: fm.title,
          content: content ?? '',
          summary: fm.summary,
          image: fm.image,
          category: fm.category,
          subCategory: fm.subCategory,
          status: fm.status,
          featured: fm.featured,
          tags: fm.tags,
          authorId,
          authorName,
        })
        return NextResponse.json({ slug: result.slug })
      } catch (updateError) {
        // 업데이트 실패 시 새로 생성
        const result = await createSupabasePost({
          slug,
          title: fm.title || slug,
          content: content ?? '',
          summary: fm.summary,
          image: fm.image,
          category: fm.category,
          subCategory: fm.subCategory,
          status: fm.status,
          featured: fm.featured,
          tags: fm.tags,
          authorId,
          authorName,
        })
        return NextResponse.json({ slug: result.slug })
      }
    } else {
      // 기존 MDX 파일로 저장
      const res = upsertPost(slug, fm, content ?? '')
      return NextResponse.json(res)
    }
  } catch (e: any) {
    console.error('포스트 저장 오류:', e)
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    if (USE_SUPABASE) {
      // Supabase에서 삭제
      const res = await deleteSupabasePost(slug)
      return NextResponse.json(res)
    } else {
      // 기존 MDX 파일 삭제
      const res = deletePost(slug)
      return NextResponse.json(res)
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 })
  }
}


