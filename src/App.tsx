import { useState, useEffect } from 'react'
import ChatWidget from './components/ChatWidget'
import './App.css'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark')
  const [showTop, setShowTop] = useState(false)
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }, [theme])
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const toggle = () => setMenuOpen(o => !o)
  const close = () => setMenuOpen(false)
  // Close mobile menu on scroll (mobile breakpoints only)
  useEffect(() => {
    if (!menuOpen) return;
    const handleScroll = () => {
      if (window.innerWidth <= 980) setMenuOpen(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [menuOpen])
  // Track scroll position to toggle scroll-to-top button
  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 320)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  // Background particle network (mobile aware, adaptive density, preserves layout)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const hero = document.querySelector<HTMLElement>('.hero')
    const canvas = document.querySelector<HTMLCanvasElement>('.bg-particles')
    if (!hero || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const DPR = window.devicePixelRatio || 1
    type P = { x: number; y: number; vx: number; vy: number }
    let parts: P[] = []
    let raf: number
    let width = 0, height = 0
    const desiredCount = () => {
      const w = window.innerWidth
      if (w < 380) return 0 // disable ultra small
      if (w < 520) return 18
      if (w < 768) return 26
      return 40
    }
    const syncCount = (w: number, h: number) => {
      const target = desiredCount()
      // remove extra
      while (parts.length > target) parts.pop()
      // add missing
      while (parts.length < target) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - .5) * 0.28,
          vy: (Math.random() - .5) * 0.28
        })
      }
    }
    const sizeCanvas = () => {
      const rect = hero.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      canvas.width = Math.round(w * DPR)
      canvas.height = Math.round(h * DPR)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(DPR, DPR)
      if (width && height) {
        const sx = w / width
        const sy = h / height
        for (const p of parts) { p.x *= sx; p.y *= sy }
      }
      width = w; height = h
      syncCount(w, h)
      canvas.style.display = desiredCount() === 0 ? 'none' : 'block'
    }
    sizeCanvas()
    let resizeTimer: number | undefined
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(sizeCanvas, 120)
    }
    const render = () => {
      if (!width || !height) { raf = requestAnimationFrame(render); return }
      ctx.clearRect(0, 0, width, height)
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) { p.x = 0; p.vx *= -1 } else if (p.x > width) { p.x = width; p.vx *= -1 }
        if (p.y < 0) { p.y = 0; p.vy *= -1 } else if (p.y > height) { p.y = height; p.vy *= -1 }
      }
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 120) {
            const alpha = 1 - dist / 120
            ctx.strokeStyle = `rgba(0,178,177,${alpha * 0.35})`
            ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }
      ctx.fillStyle = 'rgba(0,178,177,0.8)'
      for (const p of parts) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2); ctx.fill() }
      raf = requestAnimationFrame(render)
    }
    window.addEventListener('resize', onResize, { passive: true })
    render()
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div className={"landing" + (menuOpen ? ' nav-open' : '')}>
      <header className="site-header" role="banner">
        <a
          href="#top"
          className="brand"
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); close(); }}
          aria-label="Go to top of page"
        >
          B2Breeze
        </a>
        <button aria-label="Toggle navigation" aria-expanded={menuOpen} className="nav-toggle" onClick={toggle}>
          <span />
          <span />
          <span />
        </button>
        <nav className="main-nav" aria-label="Primary">
          <a onClick={close} href="#features">Features</a>
          <a onClick={close} href="#use-cases">Use Cases</a>
          <a onClick={close} href="#about">About</a>
          <a onClick={close} href="#contact" className="cta-link">Contact</a>
        </nav>
        <div className="header-tools">
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color mode">
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </div>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title" id="top">
          <div className="bg-anim-layer" aria-hidden="true">
            <div className="bg-gradient-shape g1" />
            <div className="bg-gradient-shape g2" />
            <div className="bg-gradient-shape g3" />
            <canvas className="bg-particles" />
          </div>
          <div className="hero-content">
            <h1 id="hero-title">Business, as smooth as a breeze</h1>
            <p className="tagline">
              B2Breeze connects transport, supply chain, sales, marketing and vendor management professionals in one collaborative hub.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="#contact">Request a Demo</a>
              <a className="btn secondary" href="#features">Explore Features</a>
            </div>
            <p className="social-proof">Trusted by forward‑thinking teams accelerating partnerships and execution.</p>
          </div>
        </section>
        <section id="features" className="features" aria-labelledby="features-title">
          <h2 id="features-title">Platform Pillars</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Unified Collaboration</h3>
              <p>Centralized workspaces streamline cross‑company communication and decision cycles.</p>
            </div>
            <div className="feature-card">
              <h3>Operational Visibility</h3>
              <p>Real‑time status across shipments, campaigns, and vendor deliverables reduces friction.</p>
            </div>
            <div className="feature-card">
              <h3>Workflow Automation</h3>
              <p>Automated routing, reminders, and approvals keep momentum without manual chasing.</p>
            </div>
            <div className="feature-card">
              <h3>Partner Intelligence</h3>
              <p>Performance insights surface risk and opportunity to optimize strategic alignment.</p>
            </div>
          </div>
        </section>
        <section id="use-cases" className="use-cases" aria-labelledby="use-cases-title">
          <h2 id="use-cases-title">High‑Impact Use Cases</h2>
          <div className="usecase-grid">
            <div className="usecase"><h3>Onboarding</h3><p>Accelerate partner activation with guided, trackable workflows.</p></div>
            <div className="usecase"><h3>Joint Planning</h3><p>Co‑author targets, milestones, and campaign calendars.</p></div>
            <div className="usecase"><h3>Incident Response</h3><p>Collaborative resolution rooms shorten disruption windows.</p></div>
            <div className="usecase"><h3>Performance Reviews</h3><p>Consolidated data snapshots drive strategic quarterly reviews.</p></div>
          </div>
        </section>
        <section id="about" className="about" aria-labelledby="about-title">
          <h2 id="about-title">Why B2Breeze</h2>
          <p>B2B organizations operate in increasingly interconnected networks. B2Breeze removes the fragmentation—replacing scattered emails, spreadsheets, and portals with a single, secure relationship operating system.</p>
        </section>
        <section id="contact" className="contact" aria-labelledby="contact-title">
          <h2 id="contact-title">Get in Touch</h2>
          <p>Ready to streamline partner collaboration and execution? Let’s talk.</p>
          <form className="lead-form" onSubmit={(e) => { e.preventDefault(); alert('Demo request submitted'); }}>
            <div className="field-row">
              <input required name="name" placeholder="Name" />
              <input required type="email" name="email" placeholder="Work Email" />
            </div>
            <input name="company" placeholder="Company" />
            <textarea name="message" placeholder="What challenges are you solving?" rows={4} />
            <button type="submit" className="btn primary full">Request Demo</button>
          </form>
        </section>
      </main>
      <footer className="site-footer">© {new Date().getFullYear()} B2Breeze. All rights reserved.</footer>
      {showTop && (
        <button
          type="button"
          className="scroll-top-btn"
          onClick={scrollTop}
          aria-label="Scroll to top"
        >↑</button>
      )}
      <ChatWidget />
    </div>
  )
}
