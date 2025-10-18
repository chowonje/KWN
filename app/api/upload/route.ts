import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📨 업로드 요청 받음')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('❌ 파일 없음')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('📄 파일 정보:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`
    })

    // 🔒 보안: 파일 크기 검증 (10MB 제한)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ 파일 크기 초과:', file.size)
      return NextResponse.json({ 
        error: '파일 크기는 10MB를 초과할 수 없습니다.' 
      }, { status: 400 })
    }

    // 🔒 보안: 파일 타입 검증 (화이트리스트)
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
    const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('❌ 지원하지 않는 파일 형식:', file.type)
      return NextResponse.json({ 
        error: '지원하지 않는 파일 형식입니다. (jpg, png, gif, webp, mp4, webm만 가능)' 
      }, { status: 400 })
    }

    // 🔒 보안: 파일 확장자 재검증 (MIME type 위조 방지)
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg']
    
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      console.error('❌ 잘못된 파일 확장자:', fileExt)
      return NextResponse.json({ 
        error: '잘못된 파일 확장자입니다.' 
      }, { status: 400 })
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 고유한 파일명 생성 (보안: 원본 파일명 사용 안 함)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    console.log('📤 Supabase Storage 업로드 시도:', filePath)

    // Supabase Storage에 업로드 (버킷 이름 통일: post-images)
    const { data, error } = await supabase.storage
      .from('post-images') // 🔧 수정: blog-images → post-images (SQL과 일치)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('❌ Storage 업로드 에러:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error 
      }, { status: 500 })
    }

    console.log('✅ Storage 업로드 성공:', data)

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('post-images') // 🔧 수정: blog-images → post-images (SQL과 일치)
      .getPublicUrl(filePath)

    console.log('🔗 공개 URL 생성:', publicUrl)

    return NextResponse.json({ 
      url: publicUrl,
      path: data.path 
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

