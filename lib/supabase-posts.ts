import 'server-only'
import { supabase } from './supabase'
import { BlogPost } from './posts'

// Supabase에서 포스트 가져오기
export async function getSupabasePosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Supabase 포스트 조회 오류:', error)
      return []
    }

    if (!data) return []

    // Supabase 데이터를 BlogPost 형식으로 변환
    return data.map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.published_at ? new Date(post.published_at).toISOString().slice(0, 10) : undefined,
      summary: post.summary || undefined,
      image: post.image || undefined,
      label: undefined, // 필요시 추가
      author: post.author_name || post.author || undefined,
      category: post.category || undefined,
      subCategory: post.sub_category || undefined,
      status: post.status as 'draft' | 'published' | undefined,
      featured: post.featured || undefined,
      tags: post.tags || undefined,
    }))
  } catch (err) {
    console.error('Supabase 연결 오류:', err)
    return []
  }
}

// Supabase에 포스트 저장하기
export async function createSupabasePost(post: {
  slug: string
  title: string
  content: string
  summary?: string
  image?: string
  authorId: string
  authorName: string
  category?: string
  subCategory?: string
  status?: 'draft' | 'published'
  featured?: boolean
  tags?: string[]
}) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        slug: post.slug,
        title: post.title,
        content: post.content,
        summary: post.summary,
        image: post.image,
        author_id: post.authorId,
        author_name: post.authorName,
        category: post.category,
        sub_category: post.subCategory,
        status: post.status || 'published',
        featured: post.featured || false,
        tags: post.tags,
        published_at: post.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase 포스트 생성 오류:', error)
      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error('포스트 생성 중 오류:', err)
    throw err
  }
}

// Supabase에서 포스트 업데이트하기
export async function updateSupabasePost(
  slug: string,
  updates: {
    title?: string
    content?: string
    summary?: string
    image?: string
    authorId?: string
    authorName?: string
    category?: string
    subCategory?: string
    status?: 'draft' | 'published'
    featured?: boolean
    tags?: string[]
  }
) {
  try {
    const updateData: any = {}
    
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.summary !== undefined) updateData.summary = updates.summary
    if (updates.image !== undefined) updateData.image = updates.image
    if (updates.authorId !== undefined) updateData.author_id = updates.authorId
    if (updates.authorName !== undefined) updateData.author_name = updates.authorName
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.subCategory !== undefined) updateData.sub_category = updates.subCategory
    if (updates.status !== undefined) {
      updateData.status = updates.status
      // published 상태로 변경될 때 published_at 설정
      if (updates.status === 'published') {
        updateData.published_at = new Date().toISOString()
      }
    }
    if (updates.featured !== undefined) updateData.featured = updates.featured
    if (updates.tags !== undefined) updateData.tags = updates.tags

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Supabase 포스트 업데이트 오류:', error)
      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error('포스트 업데이트 중 오류:', err)
    throw err
  }
}

// Supabase에서 포스트 삭제하기
export async function deleteSupabasePost(slug: string) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Supabase 포스트 삭제 오류:', error)
      throw new Error(error.message)
    }

    return { ok: true }
  } catch (err) {
    console.error('포스트 삭제 중 오류:', err)
    throw err
  }
}

// Supabase에서 단일 포스트 가져오기
export async function getSupabasePost(slug: string) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Supabase 포스트 조회 오류:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('포스트 조회 중 오류:', err)
    return null
  }
}


