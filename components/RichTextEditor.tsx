"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect } from 'react'

type RichTextEditorProps = {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || '내용을 입력하세요...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // 이미지 리사이즈 기능
  useEffect(() => {
    let selectedImage: HTMLImageElement | null = null
    let resizeOverlay: HTMLDivElement | null = null

    const createResizeOverlay = (img: HTMLImageElement) => {
      // 기존 오버레이 제거
      removeResizeOverlay()

      const overlay = document.createElement('div')
      overlay.className = 'resize-overlay'
      overlay.style.cssText = `
        position: absolute;
        border: 2px solid var(--accent);
        pointer-events: none;
        z-index: 1000;
      `

      // 4개의 핸들 생성
      const positions = [
        { class: 'nw', cursor: 'nw-resize', top: '-6px', left: '-6px' },
        { class: 'ne', cursor: 'ne-resize', top: '-6px', right: '-6px' },
        { class: 'sw', cursor: 'sw-resize', bottom: '-6px', left: '-6px' },
        { class: 'se', cursor: 'se-resize', bottom: '-6px', right: '-6px' }
      ]

      positions.forEach(pos => {
        const handle = document.createElement('div')
        handle.className = `resize-handle-dot resize-${pos.class}`
        handle.style.cssText = `
          position: absolute;
          width: 12px;
          height: 12px;
          background: var(--accent);
          border: 2px solid white;
          border-radius: 50%;
          cursor: ${pos.cursor};
          pointer-events: all;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ${pos.top ? `top: ${pos.top};` : ''}
          ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
          ${pos.left ? `left: ${pos.left};` : ''}
          ${pos.right ? `right: ${pos.right};` : ''}
        `

        handle.addEventListener('mousedown', (e) => {
          console.log('🎯 핸들 드래그 시작:', pos.class)
          e.preventDefault()
          e.stopPropagation()

          const startX = e.clientX
          const startY = e.clientY
          const startWidth = img.offsetWidth
          const startHeight = img.offsetHeight
          const aspectRatio = startWidth / startHeight

          const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            let newWidth = startWidth
            if (pos.class === 'se' || pos.class === 'ne') {
              newWidth = startWidth + deltaX
            } else {
              newWidth = startWidth - deltaX
            }

            newWidth = Math.max(100, Math.min(newWidth, 1200))
            const newHeight = newWidth / aspectRatio

            img.style.width = `${newWidth}px`
            img.style.height = `${newHeight}px`
            updateOverlayPosition()
          }

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
          }

          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        })

        overlay.appendChild(handle)
      })

      document.body.appendChild(overlay)
      resizeOverlay = overlay
      updateOverlayPosition()
    }

    const updateOverlayPosition = () => {
      if (!resizeOverlay || !selectedImage) return

      const rect = selectedImage.getBoundingClientRect()
      resizeOverlay.style.top = `${rect.top + window.scrollY}px`
      resizeOverlay.style.left = `${rect.left + window.scrollX}px`
      resizeOverlay.style.width = `${rect.width}px`
      resizeOverlay.style.height = `${rect.height}px`
    }

    const removeResizeOverlay = () => {
      if (resizeOverlay) {
        resizeOverlay.remove()
        resizeOverlay = null
      }
      if (selectedImage) {
        selectedImage.style.outline = ''
        selectedImage = null
      }
    }

    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement
      console.log('🖱️ 클릭됨:', target.tagName, target.className)
      
      if (target.classList.contains('resizable-image')) {
        console.log('✅ 이미지 클릭 감지!')
        e.preventDefault()
        const img = target as HTMLImageElement
        selectedImage = img
        img.style.outline = '2px solid var(--accent)'
        createResizeOverlay(img)
        console.log('📐 오버레이 생성 완료')
      } else {
        console.log('❌ 이미지가 아님, 오버레이 제거')
        removeResizeOverlay()
      }
    }

    const handleScroll = () => {
      if (resizeOverlay && selectedImage) {
        updateOverlayPosition()
      }
    }

    // 이벤트 리스너 등록
    document.addEventListener('click', handleImageClick)
    document.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      document.removeEventListener('click', handleImageClick)
      document.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
      removeResizeOverlay()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const addImage = () => {
    // 파일 input 생성
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // 이미지 크기 선택
      const size = window.prompt('이미지 크기를 선택하세요\n\n1: 작게 (300px)\n2: 중간 (500px)\n3: 크게 (800px)\n4: 원본 크기\n\n숫자를 입력하세요:', '2')
      
      let width = '100%'
      if (size === '1') width = '300px'
      else if (size === '2') width = '500px'
      else if (size === '3') width = '800px'
      else if (size === '4') width = '100%'

      // 로딩 표시
      const loadingText = '이미지 업로드 중...'
      editor.chain().focus().insertContent(loadingText).run()

      try {
        const formData = new FormData()
        formData.append('file', file)

        console.log('📤 이미지 업로드 시작:', file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        console.log('📥 응답 상태:', response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ 업로드 실패:', errorData)
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()
        console.log('✅ 업로드 성공:', data)
        
        // 로딩 텍스트 제거하고 이미지 삽입
        const { state } = editor
        const { from } = state.selection
        const textBefore = state.doc.textBetween(Math.max(0, from - loadingText.length), from, '')
        
        // 간단한 이미지로 삽입 (리사이즈 핸들은 클릭 시 동적 생성)
        const imageHtml = `<img src="${data.url}" 
             style="width: ${width}; max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 16px auto; cursor: pointer;" 
             class="resizable-image"
             data-width="${width}"
             alt="업로드된 이미지" />`
        
        if (textBefore === loadingText) {
          editor
            .chain()
            .focus()
            .deleteRange({ from: from - loadingText.length, to: from })
            .insertContent(imageHtml)
            .run()
        } else {
          editor.chain().focus().insertContent(imageHtml).run()
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('이미지 업로드에 실패했습니다.')
        
        // 로딩 텍스트 제거
        const { state } = editor
        const { from } = state.selection
        const textBefore = state.doc.textBetween(Math.max(0, from - loadingText.length), from, '')
        
        if (textBefore === loadingText) {
          editor
            .chain()
            .focus()
            .deleteRange({ from: from - loadingText.length, to: from })
            .run()
        }
      }
    }

    input.click()
  }

  const addVideo = () => {
    // 파일 input 생성
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // 로딩 표시
      const loadingText = '동영상 업로드 중...'
      editor.chain().focus().insertContent(loadingText).run()

      try {
        const formData = new FormData()
        formData.append('file', file)

        console.log('📤 동영상 업로드 시작:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        console.log('📥 응답 상태:', response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ 업로드 실패:', errorData)
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()
        console.log('✅ 업로드 성공:', data)
        
        // 로딩 텍스트 제거하고 비디오 삽입
        const { state } = editor
        const { from } = state.selection
        const textBefore = state.doc.textBetween(Math.max(0, from - loadingText.length), from, '')
        
        const videoHtml = `<video controls style="max-width: 100%; border-radius: 8px; margin: 16px 0;"><source src="${data.url}" type="${file.type}"></video>`
        
        if (textBefore === loadingText) {
          editor
            .chain()
            .focus()
            .deleteRange({ from: from - loadingText.length, to: from })
            .insertContent(videoHtml)
            .run()
        } else {
          editor.chain().focus().insertContent(videoHtml).run()
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('동영상 업로드에 실패했습니다.')
        
        // 로딩 텍스트 제거
        const { state } = editor
        const { from } = state.selection
        const textBefore = state.doc.textBetween(Math.max(0, from - loadingText.length), from, '')
        
        if (textBefore === loadingText) {
          editor
            .chain()
            .focus()
            .deleteRange({ from: from - loadingText.length, to: from })
            .run()
        }
      }
    }

    input.click()
  }

  const addLink = () => {
    const url = window.prompt('링크 URL을 입력하세요')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div style={{ 
      border: 0,
      borderRadius: 0,
      overflow: 'visible',
      background: 'white'
    }}>
      {/* 툴바 */}
      <div style={{ 
        display: 'flex', 
        gap: 4,
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 2,
            border: '1px solid var(--border)',
            background: editor.isActive('bold') ? 'var(--fg)' : 'white',
            color: editor.isActive('bold') ? 'white' : 'var(--fg)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive('italic') ? 'var(--accent)' : 'white',
            color: editor.isActive('italic') ? 'white' : 'inherit',
            fontStyle: 'italic',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive('strike') ? 'var(--accent)' : 'white',
            color: editor.isActive('strike') ? 'white' : 'inherit',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <s>S</s>
        </button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }}></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive('heading', { level: 1 }) ? 'var(--accent)' : 'white',
            color: editor.isActive('heading', { level: 1 }) ? 'white' : 'inherit',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive('heading', { level: 2 }) ? 'var(--accent)' : 'white',
            color: editor.isActive('heading', { level: 2 }) ? 'white' : 'inherit',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive('heading', { level: 3 }) ? 'var(--accent)' : 'white',
            color: editor.isActive('heading', { level: 3 }) ? 'white' : 'inherit',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          H3
        </button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }}></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive({ textAlign: 'left' }) ? 'var(--accent)' : 'white',
            color: editor.isActive({ textAlign: 'left' }) ? 'white' : 'inherit',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ⬅️ 왼쪽
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive({ textAlign: 'center' }) ? 'var(--accent)' : 'white',
            color: editor.isActive({ textAlign: 'center' }) ? 'white' : 'inherit',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ↔️ 가운데
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive({ textAlign: 'right' }) ? 'var(--accent)' : 'white',
            color: editor.isActive({ textAlign: 'right' }) ? 'white' : 'inherit',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ➡️ 오른쪽
        </button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }}></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive('bulletList') ? 'var(--accent)' : 'white',
            color: editor.isActive('bulletList') ? 'white' : 'inherit',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          • 목록
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive('orderedList') ? 'var(--accent)' : 'white',
            color: editor.isActive('orderedList') ? 'white' : 'inherit',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          1. 목록
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: editor.isActive('blockquote') ? 'var(--accent)' : 'white',
            color: editor.isActive('blockquote') ? 'white' : 'inherit',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          " 인용
        </button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }}></div>
        <button
          type="button"
          onClick={addImage}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'white',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🖼️ 이미지
        </button>
        <button
          type="button"
          onClick={addVideo}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'white',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🎬 동영상
        </button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }}></div>
        <span style={{ fontSize: 12, color: '#999', padding: '0 8px' }}>이미지 정렬:</span>
        <button
          type="button"
          onClick={() => {
            const selection = editor.state.selection
            const node = selection.$from.parent
            if (node.type.name === 'paragraph') {
              editor.chain().focus().setTextAlign('left').run()
            }
          }}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'white',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="이미지를 왼쪽 정렬"
        >
          ⬅️
        </button>
        <button
          type="button"
          onClick={() => {
            const selection = editor.state.selection
            const node = selection.$from.parent
            if (node.type.name === 'paragraph') {
              editor.chain().focus().setTextAlign('center').run()
            }
          }}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'white',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="이미지를 가운데 정렬"
        >
          ↔️
        </button>
        <button
          type="button"
          onClick={() => {
            const selection = editor.state.selection
            const node = selection.$from.parent
            if (node.type.name === 'paragraph') {
              editor.chain().focus().setTextAlign('right').run()
            }
          }}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'white',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="이미지를 오른쪽 정렬"
        >
          ➡️
        </button>
        <button
          type="button"
          onClick={addLink}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'white',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔗 링크
        </button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }}></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'white',
            fontSize: 14,
            cursor: editor.can().undo() ? 'pointer' : 'not-allowed',
            opacity: editor.can().undo() ? 1 : 0.5,
            transition: 'all 0.2s'
          }}
        >
          ↶ 실행취소
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'white',
            fontSize: 14,
            cursor: editor.can().redo() ? 'pointer' : 'not-allowed',
            opacity: editor.can().redo() ? 1 : 0.5,
            transition: 'all 0.2s'
          }}
        >
          ↷ 다시실행
        </button>
      </div>

      {/* 에디터 */}
      <div style={{ 
        padding: '32px 24px',
        minHeight: 600
      }}>
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          font-size: 16px;
          line-height: 1.7;
          color: var(--fg);
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted);
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror h1 {
          font-size: 32px;
          font-weight: 600;
          margin: 24px 0 16px;
          letter-spacing: -0.03em;
        }
        
        .ProseMirror h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 20px 0 12px;
          letter-spacing: -0.02em;
        }
        
        .ProseMirror h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 16px 0 10px;
          letter-spacing: -0.02em;
        }
        
        .ProseMirror p {
          margin: 12px 0;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 24px;
          margin: 12px 0;
        }
        
        .ProseMirror blockquote {
          border-left: 3px solid var(--border);
          padding-left: 16px;
          color: var(--muted);
          margin: 16px 0;
        }
        
        /* 리사이즈 가능한 이미지 */
        .resizable-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          display: block;
          margin: 16px auto;
          transition: box-shadow 0.2s, transform 0.2s;
          cursor: pointer;
        }
        
        .resizable-image:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transform: scale(1.01);
        }
        
        /* 리사이즈 오버레이 */
        .resize-overlay {
          pointer-events: none;
        }
        
        .resize-handle-dot:hover {
          transform: scale(1.3);
          background: #0066ff !important;
        }
        
        .editor-link {
          color: var(--accent);
          text-decoration: underline;
        }
        
        /* 이미지 정렬 */
        .ProseMirror p[style*="text-align: center"] img {
          margin-left: auto;
          margin-right: auto;
        }
        .ProseMirror p[style*="text-align: right"] img {
          margin-left: auto;
          margin-right: 0;
        }
        .ProseMirror p[style*="text-align: left"] img {
          margin-left: 0;
          margin-right: auto;
        }
      `}</style>
    </div>
  )
}

