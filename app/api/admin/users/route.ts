import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 서버용 Supabase 클라이언트
function getSupabaseClient(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
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

// 관리자 권한 체크
async function checkAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: '로그인이 필요합니다', status: 401 }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: '관리자 권한이 필요합니다', status: 403 }
  }

  if ((profile as { role: string }).role !== 'admin') {
    return { error: '관리자 권한이 필요합니다', status: 403 }
  }

  return { user, profile }
}

// GET: 모든 사용자 조회 (관리자만)
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient(req)
    
    // 관리자 체크
    const authCheck = await checkAdmin(supabase)
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    // 쿼리 파라미터
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // pending, approved, rejected

    let query = supabase
      .from('profiles')
      .select('*')
      .order('approval_requested_at', { ascending: false })

    if (status) {
      query = query.eq('approval_status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: 사용자 승인/거부 (관리자만)
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient(req)
    
    // 관리자 체크
    const authCheck = await checkAdmin(supabase)
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { userId, action } = await req.json() // action: 'approve' | 'reject'
    
    if (!userId || !action) {
      return NextResponse.json({ error: 'userId와 action이 필요합니다' }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action은 approve 또는 reject여야 합니다' }, { status: 400 })
    }

    const approval_status = action === 'approve' ? 'approved' : 'rejected'

    const { data, error } = await supabase
      .from('profiles')
      .update({
        approval_status,
        approval_processed_at: new Date().toISOString(),
        approval_processed_by: authCheck.user!.id
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: action === 'approve' ? '사용자가 승인되었습니다' : '사용자가 거부되었습니다',
      data 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH: 사용자 역할 변경 (관리자만)
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseClient(req)
    
    // 관리자 체크
    const authCheck = await checkAdmin(supabase)
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { userId, role } = await req.json() // role: 'user' | 'admin'
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId와 role이 필요합니다' }, { status: 400 })
    }

    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json({ error: 'role은 user 또는 admin이어야 합니다' }, { status: 400 })
    }

    // 자기 자신의 역할은 변경할 수 없음 (안전장치)
    if (userId === authCheck.user!.id) {
      return NextResponse.json({ 
        error: '본인의 관리자 권한은 변경할 수 없습니다' 
      }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: role === 'admin' ? '관리자로 승격되었습니다' : '일반 사용자로 변경되었습니다',
      data 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

