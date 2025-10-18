"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

type User = {
  id: string
  email: string
  name: string
  role: string
  approval_status: 'pending' | 'approved' | 'rejected'
  approval_requested_at: string
  approval_processed_at?: string
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [isAdmin, setIsAdmin] = useState(false)

  // 관리자 권한 체크
  useEffect(() => {
    async function checkAdminRole() {
      if (!user) return

      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (data?.role === 'admin') {
          setIsAdmin(true)
        } else {
          alert('관리자 권한이 필요합니다')
          router.push('/')
        }
      } catch (error) {
        router.push('/')
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
      } else {
        checkAdminRole()
      }
    }
  }, [user, authLoading, router])

  // 사용자 목록 불러오기
  useEffect(() => {
    async function fetchUsers() {
      if (!isAdmin) return

      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { session } } = await supabase.auth.getSession()

        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        })

        if (!response.ok) throw new Error('Failed to fetch users')

        const data = await response.json()
        setUsers(data)
        setFilteredUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
        alert('사용자 목록을 불러오지 못했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [isAdmin])

  // 필터링
  useEffect(() => {
    if (filter === 'all') {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(users.filter(u => u.approval_status === filter))
    }
  }, [filter, users])

  // 승인/거부 처리
  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    const confirmMessage = action === 'approve' 
      ? '이 사용자를 승인하시겠습니까?' 
      : '이 사용자를 거부하시겠습니까?'
    
    if (!confirm(confirmMessage)) return

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId, action })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process action')
      }

      alert(result.message)
      
      // 사용자 목록 업데이트
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, approval_status: action === 'approve' ? 'approved' : 'rejected', approval_processed_at: new Date().toISOString() }
          : u
      ))
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    }
  }

  if (authLoading || loading || !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--muted)' }}>로딩 중...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const stats = {
    total: users.length,
    pending: users.filter(u => u.approval_status === 'pending').length,
    approved: users.filter(u => u.approval_status === 'approved').length,
    rejected: users.filter(u => u.approval_status === 'rejected').length
  }

  return (
    <main className="wrapper" style={{ padding: '4rem 1.25rem', maxWidth: 1200 }}>
      {/* 헤더 */}
      <div style={{
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: '1px solid var(--border)'
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          marginBottom: 8
        }}>
          🔐 사용자 관리
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>
          회원가입 승인 요청을 관리합니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>전체</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #fbbf24',
          boxShadow: '0 1px 3px rgba(251,191,36,0.2)'
        }}>
          <div style={{ fontSize: 13, color: '#f59e0b', marginBottom: 8 }}>대기 중</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
        </div>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #10b981',
          boxShadow: '0 1px 3px rgba(16,185,129,0.2)'
        }}>
          <div style={{ fontSize: 13, color: '#059669', marginBottom: 8 }}>승인됨</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#059669' }}>{stats.approved}</div>
        </div>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #ef4444',
          boxShadow: '0 1px 3px rgba(239,68,68,0.2)'
        }}>
          <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 8 }}>거부됨</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>{stats.rejected}</div>
        </div>
      </div>

      {/* 필터 */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24
      }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: filter === f ? 'var(--accent)' : 'white',
              color: filter === f ? 'white' : 'var(--fg)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {f === 'all' && '전체'}
            {f === 'pending' && '대기 중'}
            {f === 'approved' && '승인됨'}
            {f === 'rejected' && '거부됨'}
          </button>
        ))}
      </div>

      {/* 사용자 목록 */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        {filteredUsers.length === 0 ? (
          <div style={{
            padding: 60,
            textAlign: 'center',
            color: 'var(--muted)'
          }}>
            사용자가 없습니다
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>이메일</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>이름</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>역할</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>상태</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>요청일</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} style={{ 
                    borderBottom: idx !== filteredUsers.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{user.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{user.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <span style={{
                        padding: '4px 8px',
                        background: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                        color: user.role === 'admin' ? '#1e40af' : '#374151',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <span style={{
                        padding: '4px 8px',
                        background: 
                          user.approval_status === 'pending' ? '#fef3c7' :
                          user.approval_status === 'approved' ? '#d1fae5' : '#fee2e2',
                        color:
                          user.approval_status === 'pending' ? '#92400e' :
                          user.approval_status === 'approved' ? '#065f46' : '#991b1b',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {user.approval_status === 'pending' && '⏳ 대기'}
                        {user.approval_status === 'approved' && '✅ 승인'}
                        {user.approval_status === 'rejected' && '❌ 거부'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>
                      {new Date(user.approval_requested_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {user.approval_status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleAction(user.id, 'approve')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: 'none',
                              background: '#10b981',
                              color: 'white',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            ✓ 승인
                          </button>
                          <button
                            onClick={() => handleAction(user.id, 'reject')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: 'none',
                              background: '#ef4444',
                              color: 'white',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            × 거부
                          </button>
                        </div>
                      )}
                      {user.approval_status === 'approved' && (
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>처리 완료</span>
                      )}
                      {user.approval_status === 'rejected' && (
                        <button
                          onClick={() => handleAction(user.id, 'approve')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                            background: 'white',
                            color: 'var(--fg)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          승인으로 변경
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

