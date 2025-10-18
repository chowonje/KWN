import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { getSupabasePosts } from './supabase-posts'

export type BlogPost = {
  slug: string
  title: string
  date?: string
  summary?: string
  image?: string
  label?: string
  author?: string
  category?: string
  subCategory?: string
  status?: 'draft' | 'published'
  featured?: boolean
  tags?: string[]
}

const blogDir = path.join(process.cwd(), 'content', 'blog')

// Supabase 환경변수가 있는지 확인
const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function getAllPosts(): Promise<BlogPost[]> {
  // 1. Supabase 우선 (환경변수가 있으면)
  if (hasSupabase) {
    try {
      const supabasePosts = await getSupabasePosts()
      if (supabasePosts && supabasePosts.length > 0) {
        console.log(`✅ Supabase에서 ${supabasePosts.length}개 포스트 로드`)
        return supabasePosts
      }
    } catch (err) {
      console.error('❌ Supabase 조회 실패, MDX fallback:', err)
    }
  }

  // 2. MDX 파일 fallback
  if (!fs.existsSync(blogDir)) return []
  const files = fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.mdx?$/.test(e.name))

  const posts: BlogPost[] = []

  for (const file of files) {
    const slug = file.name.replace(/\.mdx?$/, '')
    const mdxPath = path.join(blogDir, file.name)

    const raw = fs.readFileSync(mdxPath, 'utf8')
    const { data } = matter(raw)

    const dateStr = data?.date
      ? new Date(data.date).toISOString().slice(0, 10)
      : undefined

    const tags = Array.isArray(data?.tags)
      ? (data.tags as any[]).map((t) => String(t).trim()).filter(Boolean)
      : typeof data?.tags === 'string'
        ? String(data.tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined

    posts.push({
      slug,
      title: data?.title ?? slug,
      date: dateStr,
      summary: typeof data?.summary === 'string' ? data.summary : undefined,
      image: typeof data?.image === 'string' ? data.image : undefined,
      label: typeof data?.label === 'string' ? data.label : undefined,
      author: typeof data?.author === 'string' ? data.author : undefined,
      category: typeof data?.category === 'string' ? data.category : undefined,
      subCategory: typeof data?.subCategory === 'string' ? data.subCategory : undefined,
      status: data?.status === 'draft' || data?.status === 'published' ? data.status : undefined,
      featured: typeof data?.featured === 'boolean' ? data.featured : undefined,
      tags,
    })
  }

  console.log(`📄 MDX에서 ${posts.length}개 포스트 로드`)
  return posts.sort((a, b) => (a.date && b.date ? (a.date < b.date ? 1 : -1) : 0))
}

export function getPost(slug: string): { frontmatter: any; content: string } | null {
  const mdxPath = path.join(blogDir, `${slug}.mdx`)
  if (!fs.existsSync(mdxPath)) return null

  const raw = fs.readFileSync(mdxPath, 'utf8')
  const { data, content } = matter(raw)
  return { frontmatter: data, content }
}

export function upsertPost(slug: string, frontmatter: Record<string, any>, content: string) {
  const safeSlug = slug.trim()
  if (!safeSlug) throw new Error('slug is required')

  const mdxPath = path.join(blogDir, `${safeSlug}.mdx`)
  if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true })

  const fm = { ...frontmatter }
  if (fm.date) fm.date = new Date(fm.date).toISOString().slice(0, 10)

  const body = matter.stringify(content, fm)
  fs.writeFileSync(mdxPath, body, 'utf8')

  return { slug: safeSlug }
}

export function deletePost(slug: string) {
  const mdxPath = path.join(blogDir, `${slug}.mdx`)
  if (fs.existsSync(mdxPath)) fs.rmSync(mdxPath)
  return { ok: true }
}
