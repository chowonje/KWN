'use client'

export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'monospace',
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: 30 }}>🔍 환경 변수 테스트</h1>
      
      <div style={{ 
        padding: 20, 
        background: supabaseUrl ? '#d1fae5' : '#fee2e2',
        border: `2px solid ${supabaseUrl ? '#10b981' : '#ef4444'}`,
        borderRadius: 10,
        marginBottom: 20
      }}>
        <h2 style={{ margin: '0 0 15px 0' }}>
          {supabaseUrl ? '✅ Supabase URL 로드됨' : '❌ Supabase URL 없음'}
        </h2>
        <p style={{ margin: 0 }}>
          <strong>URL:</strong> {supabaseUrl || '(없음)'}
        </p>
      </div>

      <div style={{ 
        padding: 20, 
        background: hasAnonKey ? '#d1fae5' : '#fee2e2',
        border: `2px solid ${hasAnonKey ? '#10b981' : '#ef4444'}`,
        borderRadius: 10,
        marginBottom: 20
      }}>
        <h2 style={{ margin: '0 0 15px 0' }}>
          {hasAnonKey ? '✅ Anon Key 로드됨' : '❌ Anon Key 없음'}
        </h2>
        <p style={{ margin: 0 }}>
          <strong>Key:</strong> {hasAnonKey ? '(존재함 - 보안상 표시 안 함)' : '(없음)'}
        </p>
      </div>

      {!supabaseUrl || !hasAnonKey ? (
        <div style={{
          padding: 20,
          background: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: 10
        }}>
          <h3 style={{ marginTop: 0 }}>⚠️ 문제 해결 방법:</h3>
          <ol style={{ marginBottom: 0, lineHeight: 1.8 }}>
            <li>프로젝트 루트에 <code>.env.local</code> 파일이 있는지 확인</li>
            <li>파일 내용에 <code>NEXT_PUBLIC_</code> 접두사가 있는지 확인</li>
            <li>개발 서버를 <strong>완전히 종료</strong>하고 재시작 (Ctrl+C)</li>
            <li>브라우저 캐시 클리어 (Cmd+Shift+R)</li>
          </ol>
        </div>
      ) : (
        <div style={{
          padding: 20,
          background: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: 10
        }}>
          <h3 style={{ marginTop: 0 }}>🎉 환경 변수가 제대로 로드되었습니다!</h3>
          <p style={{ marginBottom: 0 }}>
            이제 로그인/회원가입 기능을 사용할 수 있습니다.
          </p>
        </div>
      )}

      <div style={{ marginTop: 30, padding: 20, background: '#f3f4f6', borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>📋 체크리스트:</h3>
        <pre style={{ 
          background: '#1f2937', 
          color: '#f3f4f6', 
          padding: 15, 
          borderRadius: 8,
          overflow: 'auto'
        }}>
{`# 터미널에서 확인
cd /Users/won/Desktop/projects/KWN
cat .env.local

# 예상 출력:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
        </pre>
      </div>
    </div>
  )
}




