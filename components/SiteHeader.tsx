"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('open')
    } else {
      document.body.classList.remove('open')
      setSubmenuOpen(false)
    }
    return () => document.body.classList.remove('open')
  }, [isOpen])

  // 사용자 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const focusSearch = () => {
    setIsOpen(true)
    setTimeout(() => {
      const el = document.getElementById('nav-search') as HTMLInputElement | null
      el?.focus()
    }, 0)
  }

  const scrollToHomeList = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('home-list')?.scrollIntoView({ behavior: 'smooth' })
    setIsOpen(false)
  }

  return (
    <>
      <header className="nav-down">
        <div className="wrapper-fluid">
          <div className="header-wrapper">
            <Link className="header-logo" href="/" aria-label="kwn home">
              KWN
            </Link>
            <div className="header-button-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* 로그인/회원가입 아이콘 */}
              {user ? (
                <div className="user-menu-container" style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: '2px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    aria-label="user menu"
                  >
                    {user.email?.[0].toUpperCase() || 'U'}
                  </button>
                  {showUserMenu && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'white',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: 180,
                      zIndex: 100,
                      overflow: 'hidden'
                    }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>로그인됨</div>
                        <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await signOut()
                          setShowUserMenu(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#dc2626',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link 
                    href="/auth/login"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      fontSize: 14,
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                      e.currentTarget.style.borderColor = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'var(--border)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    로그인
                  </Link>
                  <Link 
                    href="/auth/signup"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'var(--accent)',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent-hover)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    회원가입
                  </Link>
                </>
              )}
              
              <div className={`burger${isOpen ? ' open' : ''}`}>
                <button onClick={() => setIsOpen(true)} aria-label="open menu">
                  <span />
                  <span />
                  <span />
                  <span />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`panel${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
        <div className="wrapper-fluid">
          <div className="panel-header">
            <Link className="panel-logo" href="/" aria-label="kwn home" onClick={() => setIsOpen(false)}>
              KWN
            </Link>
            <div className="panel-close">
              <button onClick={() => setIsOpen(false)} aria-label="close menu">
                ✕
              </button>
            </div>
          </div>

          <div className="panel-content">
            <div className="panel-search">
              <form role="search" className="search" action="/">
                <input
                  className="form-control form-control-lg "
                  type="text"
                  name="s"
                  id="nav-search"
                  placeholder="검색어 입력"
                  data-rocket-lazy-bg-5d549efb-91e4-4527-8ebf-f76b2cbd832e="loaded"
                />
              </form>
            </div>

            <div className="panel-navigation">
              <ul id="menu-main-menu" className="menu">
                <li className='menu-item'><Link className="primary-menu-link" href="/category" onClick={() => setIsOpen(false)}>전체</Link></li>
                <li className="menu-item has-submenu">
                  <span 
                    className="primary-menu-link" 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setSubmenuOpen(!submenuOpen)}
                  >
                    복지
                    <span style={{ 
                      fontSize: 12, 
                      transition: 'transform 0.2s',
                      transform: submenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-block'
                    }}>
                      ▼
                    </span>
                  </span>
                  <ul className={`menu submenu ${submenuOpen ? 'open' : ''}`}>
                    <li className="menu-item">
                      <Link className="submenu-link" href="/category/children-teen" onClick={() => setIsOpen(false)}>아동/청소년</Link>
                    </li>
                    <li className="menu-item">
                      <Link className="submenu-link" href="/category/youth" onClick={() => setIsOpen(false)}>청년</Link>
                    </li>
                    <li className="menu-item">
                      <Link className="submenu-link" href="/category/middle-elderly" onClick={() => setIsOpen(false)}>중장년/노인</Link>
                    </li>
                    <li className="menu-item">
                      <Link className="submenu-link" href="/category/women" onClick={() => setIsOpen(false)}>여성</Link>
                    </li>
                    <li className="menu-item">
                      <Link className="submenu-link" href="/category/disabled" onClick={() => setIsOpen(false)}>장애인</Link>
                    </li>
                  </ul>
                </li>
                <li className="menu-item"><Link className="primary-menu-link" href="/category/write" onClick={() => setIsOpen(false)}>글쓰기</Link></li>
              </ul>
              <style jsx>{`
                .has-submenu {
                  position: relative;
                }
                .has-submenu .submenu {
                  display: none;
                  padding-left: 16px;
                  margin-top: 8px;
                  overflow: hidden;
                  max-height: 0;
                  transition: max-height 0.3s ease, opacity 0.3s ease;
                  opacity: 0;
                }
                .has-submenu .submenu.open {
                  display: block;
                  max-height: 300px;
                  opacity: 1;
                }
                .submenu .menu-item {
                  margin: 4px 0;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
