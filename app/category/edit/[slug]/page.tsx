"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Frontmatter = {
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
  tags?: string
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [frontmatter, setFrontmatter] = useState<Frontmatter>({ title: '' })
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/post?slug=${encodeURIComponent(slug)}`)
        if (!res.ok) throw new Error('failed to load')
        const data = await res.json()
        setFrontmatter({
          title: data.frontmatter?.title ?? '',
          date: data.frontmatter?.date ?? '',
          summary: data.frontmatter?.summary ?? '',
          image: data.frontmatter?.image ?? '',
          label: data.frontmatter?.label ?? '',
          author: data.frontmatter?.author ?? '',
          category: data.frontmatter?.category ?? '',
          subCategory: data.frontmatter?.subCategory ?? '',
          status: data.frontmatter?.status ?? 'published',
          featured: !!data.frontmatter?.featured,
          tags: Array.isArray(data.frontmatter?.tags) ? data.frontmatter.tags.join(', ') : (data.frontmatter?.tags ?? '')
        })
        setContent(data.content ?? '')
      } catch (e: any) {
        setError(e?.message ?? '불러오기 실패')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, frontmatter, content })
      })
      if (!res.ok) throw new Error('failed to save')
      router.push(`/blog/${slug}`)
    } catch (err: any) {
      setError(err.message ?? '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/posts?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('failed to delete')
      router.push('/category')
    } catch (e: any) {
      setError(e?.message ?? '삭제 실패')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="wrapper-fluid" style={{ padding: '2rem 1rem' }}>불러오는 중…</main>

  return (
    <main className="wrapper-fluid" style={{ padding: '2rem 1rem', maxWidth: 960 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>글 수정</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>슬러그</span>
          <code>{slug}</code>
        </div>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>제목</span>
          <input
            className="form-control"
            value={frontmatter.title}
            onChange={(e) => setFrontmatter({ ...frontmatter, title: e.target.value })}
            placeholder="제목을 입력하세요"
            required
          />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>라벨</span>
            <input
              className="form-control"
              value={frontmatter.label ?? ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, label: e.target.value })}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>카테고리</span>
            <input
              className="form-control"
              value={frontmatter.category ?? ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, category: e.target.value })}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>서브카테고리</span>
            <input
              className="form-control"
              value={frontmatter.subCategory ?? ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, subCategory: e.target.value })}
            />
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>저자</span>
            <input
              className="form-control"
              value={frontmatter.author ?? ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, author: e.target.value })}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>상태</span>
            <select
              className="form-control"
              value={frontmatter.status ?? 'published'}
              onChange={(e) => setFrontmatter({ ...frontmatter, status: e.target.value as any })}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={!!frontmatter.featured}
              onChange={(e) => setFrontmatter({ ...frontmatter, featured: e.target.checked })}
            />
            <span>Editor's Pick</span>
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>날짜 (YYYY-MM-DD)</span>
            <input
              className="form-control"
              value={frontmatter.date ?? ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, date: e.target.value })}
              placeholder="2025-10-14"
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>요약</span>
            <input
              className="form-control"
              value={frontmatter.summary ?? ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, summary: e.target.value })}
              placeholder="간단한 요약"
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>이미지 URL</span>
            <input
              className="form-control"
              value={frontmatter.image ?? ''}
              onChange={(e) => setFrontmatter({ ...frontmatter, image: e.target.value })}
              placeholder="https://..."
            />
          </label>
        </div>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>태그 (쉼표로 구분)</span>
          <input
            className="form-control"
            value={frontmatter.tags ?? ''}
            onChange={(e) => setFrontmatter({ ...frontmatter, tags: e.target.value })}
            placeholder="복지, 청년, 일자리"
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>본문 (MDX)</span>
          <textarea
            className="form-control"
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="primary-menu-link" type="submit" disabled={saving}>
            {saving ? '저장 중…' : '저장'}
          </button>
          <button className="primary-menu-link" type="button" onClick={remove} disabled={saving}>
            삭제
          </button>
        </div>
      </form>
    </main>
  )
}
