import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { postMatchesCategory, getCategoryBySlug } from '@/lib/categories'

type Props = { categorySlug?: string }

export default async function HomeList({ categorySlug }: Props) {
  const all = await getAllPosts()
  const posts = categorySlug ? all.filter((p) => postMatchesCategory(p, categorySlug)) : all

  return (
    <section className="home-list" id="home-list">
      <div className="wrapper-fluid">
        <div className="main-intro" style={{ padding: '40px 0 56px', borderBottom: '1px solid var(--border)', marginBottom: '48px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: 16,
            flexWrap: 'wrap'
          }}>
            <div>
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: 600, 
                margin: '0 0 6px',
                letterSpacing: '-0.03em',
                color: 'var(--fg)'
              }}>
                복지 뉴스
              </h2>
              <p style={{ 
                margin: 0, 
                color: 'var(--muted)',
                fontSize: '14px',
                fontWeight: 400
              }}>
                최신 복지 관련 소식을 확인하세요
              </p>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 12,
              alignItems: 'center'
            }}>
              <Link 
                className="action-button" 
                href="/category"
                style={{
                  padding: '8px 18px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontWeight: 500,
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                  background: 'white',
                  color: 'var(--fg)'
                }}
              >
                전체 보기
              </Link>
              <Link 
                className="action-button-primary" 
                href="/category/write"
                style={{
                  padding: '8px 18px',
                  borderRadius: '4px',
                  fontWeight: 500,
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                  background: 'var(--accent)',
                  color: 'white'
                }}
              >
                글쓰기
              </Link>
            </div>
          </div>
        </div>

        <div className="grid">
          {posts.map((post) => {
            // 카테고리 정보 가져오기
            const categoryInfo = post.category ? getCategoryBySlug(post.category) : null
            const categoryLabel = categoryInfo?.label || post.category

            return (
              <article className="card" key={post.slug}>
                <Link href={`/category/view/${post.slug}`} className="card-media">
                  {post.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image} alt={post.title || ''} />
                  ) : (
                    <div className="img-placeholder" />
                  )}
                </Link>

                <div className="card-body">
                  {/* 카테고리 */}
                  {categoryLabel && (
                    <div style={{
                      display: 'inline-block',
                      background: 'var(--category-bg)',
                      color: 'white',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      marginBottom: '12px'
                    }}>
                      {categoryLabel}
                    </div>
                  )}

                  {/* 제목 */}
                  <h3 className="card-title">
                    <Link href={`/category/view/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {/* 요약 */}
                  {post.summary && (
                    <p className="card-excerpt" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {post.summary}
                    </p>
                  )}

                  {/* 메타 정보 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 'auto',
                    paddingTop: '4px'
                  }}>
                    {/* 작성자 */}
                    {post.author && (
                      <span style={{
                        fontSize: '13px',
                        color: 'var(--muted)',
                        fontWeight: 400
                      }}>
                        {post.author}
                      </span>
                    )}
                    
                    {/* 날짜 */}
                    {post.date && (
                      <span className="card-date">
                        {post.date}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
