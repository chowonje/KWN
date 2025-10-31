import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export default async function BlogIndex() {
  const posts = await getAllPosts()

  return (
    <main className="wrapper-fluid" style={{ padding: '3rem 2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 600,
          letterSpacing: '-0.03em',
          margin: 0,
          color: 'var(--fg)'
        }}>
          전체 글
        </h1>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '40px 32px',
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {posts.map((post) => (
            <li 
              key={post.slug} 
              style={{ 
                border: 0,
                borderRadius: 0,
                overflow: 'visible',
                background: 'transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
              className="post-card"
            >
              {/* 대표 이미지 */}
              <Link href={`/category/view/${post.slug}`}>
                <div style={{
                  width: '100%',
                  aspectRatio: '16 / 11',
                  background: post.image 
                    ? `url(${post.image})` 
                    : 'var(--bg-secondary)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '16px'
                }}>
                </div>
              </Link>

              {/* 카드 콘텐츠 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 카테고리 */}
                {post.category && (
                  <div style={{
                    display: 'inline-block',
                    background: 'var(--category-bg)',
                    color: 'white',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    alignSelf: 'flex-start'
                  }}>
                    {post.category}
                  </div>
                )}

                {/* 제목 */}
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  margin: 0,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.35,
                  color: 'var(--fg)'
                }}>
                  <Link 
                    href={`/category/view/${post.slug}`}
                    style={{ color: 'inherit' }}
                  >
                    {post.title}
                  </Link>
                </h2>

                {/* 서브 타이틀 (요약) */}
                {post.summary && (
                  <p style={{ 
                    color: 'var(--fg-secondary)', 
                    fontSize: 15, 
                    margin: 0,
                    lineHeight: 1.6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontWeight: 400
                  } as React.CSSProperties}>
                    {post.summary}
                  </p>
                )}

                {/* 하단: 작성자 & 날짜 */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 'auto',
                  paddingTop: '4px'
                }}>
                  {post.author && (
                    <span style={{ 
                      fontSize: 13,
                      color: 'var(--muted)',
                      fontWeight: 400
                    }}>
                      {post.author}
                    </span>
                  )}
                  {post.date && (
                    <span style={{ 
                      fontSize: 13,
                      color: 'var(--muted)',
                      fontWeight: 400
                    }}>
                      {post.date}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
