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
        <div className="main-intro" style={{ padding: '32px 0 48px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: 16,
            flexWrap: 'wrap'
          }}>
            <div>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 800, 
                margin: '0 0 8px',
                letterSpacing: '-0.02em'
              }}>
                복지 뉴스
              </h2>
              <p style={{ 
                margin: 0, 
                color: 'var(--muted)',
                fontSize: '15px'
              }}>
                최신 복지 관련 소식을 확인하세요
              </p>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 10,
              alignItems: 'center'
            }}>
              <Link 
                className="action-button" 
                href="/category"
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  background: 'white'
                }}
              >
                전체 보기
              </Link>
              <Link 
                className="action-button-primary" 
                href="/category/write"
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
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
                <Link href={`/blog/${post.slug}`} className="card-media">
                  {post.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image} alt={post.title || ''} />
                  ) : (
                    <div className="img-placeholder" />
                  )}
                  
                  {/* Featured 배지 */}
                  {post.featured && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(255, 215, 0, 0.95)',
                      color: '#000',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                      ⭐ 추천
                    </div>
                  )}
                  
                  {/* 카테고리 배지 */}
                  {categoryLabel && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'rgba(59, 130, 246, 0.95)',
                      color: 'white',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }}>
                      {categoryLabel}
                    </div>
                  )}
                </Link>

                <div className="card-body">
                  {/* 제목 */}
                  <h3 className="card-title">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
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

                  {/* 태그 */}
                  {post.tags && post.tags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginBottom: 12
                    }}>
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '12px',
                            color: 'var(--accent)',
                            background: 'rgba(59, 130, 246, 0.08)',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            border: '1px solid rgba(59, 130, 246, 0.15)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 하단 메타 정보 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    paddingTop: 8,
                    borderTop: '1px solid var(--border)',
                    marginTop: 'auto'
                  }}>
                    {/* 작성자 */}
                    {post.author && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '13px',
                        color: 'var(--muted)',
                        fontWeight: 600
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        {post.author}
                      </div>
                    )}
                    
                    {/* 날짜 */}
                    {post.date && (
                      <div className="card-date" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {post.date}
                      </div>
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
