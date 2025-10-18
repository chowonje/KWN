import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export default async function BlogIndex() {
  const posts = await getAllPosts()

  return (
    <main className="wrapper-fluid" style={{ padding: '4rem 1.25rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '2.5rem',
        flexWrap: 'wrap'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          전체 글
        </h1>
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

      {posts.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          color: 'var(--muted)'
        }}>
          <p style={{ margin: 0, fontSize: '15px' }}>아직 게시된 글이 없습니다. 첫 글을 작성해 보세요.</p>
        </div>
      ) : (
        <ul style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem',
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {posts.map((post) => (
            <li 
              key={post.slug} 
              style={{ 
                border: '1px solid var(--border)', 
                borderRadius: 16, 
                overflow: 'hidden',
                background: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer'
              }}
              className="post-card"
            >
              {/* 대표 이미지 */}
              <Link href={`/category/${post.category}/${post.slug}`}>
                <div style={{
                  width: '100%',
                  height: 200,
                  background: post.image 
                    ? `url(${post.image})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {/* 라벨 배지 */}
                  {(post.label || post.featured) && (
                    <div style={{ 
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      display: 'flex',
                      gap: 6
                    }}>
                      {post.label && (
                        <span style={{ 
                          fontSize: 11, 
                          color: 'white',
                          background: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(10px)',
                          fontWeight: 600, 
                          textTransform: 'uppercase',
                          padding: '5px 10px',
                          borderRadius: '6px'
                        }}>
                          {post.label}
                        </span>
                      )}
                      {post.featured && (
                        <span style={{ 
                          fontSize: 11, 
                          color: 'white',
                          background: '#ef4444',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontWeight: 600
                        }}>
                          ⭐ Pick
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* 카테고리 태그 */}
                  {post.category && (
                    <div style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12
                    }}>
                      <span style={{ 
                        fontSize: 12, 
                        color: 'white',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        {post.category}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* 카드 콘텐츠 */}
              <div style={{ padding: '1.5rem' }}>
                {/* 제목 */}
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  marginBottom: 10,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                  color: 'var(--fg)'
                }}>
                  <Link 
                    href={`/category/${post.category}/${post.slug}`}
                    style={{ color: 'inherit' }}
                  >
                    {post.title}
                  </Link>
                </h2>

                {/* 서브 타이틀 (요약) */}
                {post.summary && (
                  <p style={{ 
                    color: 'var(--muted)', 
                    fontSize: 14, 
                    marginBottom: 16,
                    lineHeight: 1.6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  } as React.CSSProperties}>
                    {post.summary}
                  </p>
                )}

                {/* 하단: 작성자 & 날짜 */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)',
                  marginTop: 16
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--muted)',
                    fontSize: 13,
                    fontWeight: 500
                  }}>
                    {post.author && (
                      <span style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <span style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700
                        }}>
                          {post.author.charAt(0).toUpperCase()}
                        </span>
                        <span>{post.author}</span>
                      </span>
                    )}
                    {post.author && post.date && (
                      <span style={{ color: 'var(--border)' }}>·</span>
                    )}
                    {post.date && (
                      <span>{post.date}</span>
                    )}
                  </div>

                  {/* 수정 링크 */}
                  <Link 
                    href={`/category/${post.category}/edit/${post.slug}`}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      transition: 'color 0.2s',
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'var(--bg-secondary)'
                    }}
                  >
                    수정
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
