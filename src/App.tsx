import { useState, useEffect } from 'react'
import ChatWidget from './components/ChatWidget'
import './App.css'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark')
  const [showTop, setShowTop] = useState(false)
  const [featureModal, setFeatureModal] = useState<null | 'card-scanner' | 'card-wallet' | 'customer-directory' | 'task-planner'>(null)
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
            <div
              className="feature-card interactive"
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label="Open Business Card Scanner details"
              onClick={() => setFeatureModal('card-scanner')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeatureModal('card-scanner') } }}
            >
              <h3>Business Card Scanner</h3>
              <p>Capture physical cards instantly, auto‑extract contact data, and build a living relationship graph.</p>
            </div>
            <div
              className="feature-card interactive"
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label="Open Business Card Wallet details"
              onClick={() => setFeatureModal('card-wallet')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeatureModal('card-wallet') } }}
            >
              <h3>Business Card Wallet</h3>
              <p>Your centralized, searchable vault for every scanned contact with powerful organization tools.</p>
            </div>
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
            <div
              className="feature-card interactive"
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label="Open Customer Directory details"
              onClick={() => setFeatureModal('customer-directory')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeatureModal('customer-directory') } }}
            >
              <h3>Customer Directory</h3>
              <p>Maintain rich customer profiles with history, preferences, and engagement signals in one place.</p>
            </div>
            <div
              className="feature-card interactive"
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label="Open Task Planner details"
              onClick={() => setFeatureModal('task-planner')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeatureModal('task-planner') } }}
            >
              <h3>Task Planner</h3>
              <p>Organize activities with smart priorities, deadlines, automation, and progress visibility.</p>
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
      {featureModal === 'card-scanner' && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-card-scanner-title">
          <div className="modal-window">
            <header className="modal-header">
              <h2 id="modal-card-scanner-title">Business Card Scanner</h2>
              <button className="modal-close" aria-label="Close" onClick={() => setFeatureModal(null)}>×</button>
            </header>
            <div className="modal-body">
              <p className="lead">Turn every in‑person interaction into structured, actionable intelligence. Photograph a business card and receive clean, enriched contact data in seconds—securely attached to your user account.</p>
              <div className="video-embed" aria-label="Business Card Scanner demo video">
                <iframe
                  src="https://www.youtube.com/embed/C3veKbMd1ug?rel=0&modestbranding=1"
                  title="Business Card Scanner Demo"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="modal-columns">
                <div>
                  <h3>How It Works</h3>
                  <ul className="bullet-list">
                    <li><strong>Capture:</strong> Snap via mobile camera or upload an image.</li>
                    <li><strong>OCR &amp; Parse:</strong> Extracts names, roles, company, phones, emails, addresses, socials.</li>
                    <li><strong>Normalization:</strong> Standardizes formats (phones, casing, domains).</li>
                    <li><strong>Enrichment:</strong> (Optional) Adds firmographics for richer context.</li>
                    <li><strong>De‑duplication:</strong> Similar contact detection + merge suggestions.</li>
                    <li><strong>Tagging:</strong> Event, region, tier labels for segmentation.</li>
                  </ul>
                </div>
                <div>
                  <h3>Value &amp; Outcomes</h3>
                  <ul className="bullet-list">
                    <li><strong>Zero loss:</strong> No drawer backlog—everything becomes searchable.</li>
                    <li><strong>Clean data:</strong> Reduced manual typing &amp; mistakes.</li>
                    <li><strong>Faster follow‑up:</strong> Immediate availability fuels timely outreach.</li>
                    <li><strong>Team clarity:</strong> Structured profile boosts collaboration context.</li>
                    <li><strong>Compliance:</strong> Consent + opt‑out metadata preserved.</li>
                    <li><strong>Insight graph:</strong> Aggregated contacts reveal relationship patterns.</li>
                  </ul>
                </div>
              </div>
              <div className="modal-extra">
                <h3>Privacy &amp; Security</h3>
                <p>Secure processing pipeline; extracted fields scoped per user access. Optional redaction policies (e.g., personal numbers) and retention windows configurable. Nothing shared externally unless you explicitly export or sync.</p>
                <p className="footnote">Roadmap: multi‑language OCR, handwriting assistance, CRM auto‑sync, meeting auto‑association.</p>
              </div>
              <div className="modal-actions">
                <a
                  href="https://b2breeze.vercel.app/"
                  className="btn primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the B2Breeze web application in a new tab"
                >Launch App</a>
                <button className="btn secondary" onClick={() => setFeatureModal(null)}>Close</button>
              </div>
            </div>
          </div>
          <button className="modal-backdrop" aria-label="Close overlay" onClick={() => setFeatureModal(null)} />
        </div>
      )}
      {featureModal === 'card-wallet' && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-card-wallet-title">
          <div className="modal-window">
            <header className="modal-header">
              <h2 id="modal-card-wallet-title">Business Card Wallet</h2>
              <button className="modal-close" aria-label="Close" onClick={() => setFeatureModal(null)}>×</button>
            </header>
            <div className="modal-body">
              <p className="lead">Your dynamic, searchable repository for every relationship you’ve captured. The Wallet transforms raw card scans into a living directory that accelerates outreach, collaboration, and strategic follow‑up.</p>
              <div className="video-embed" aria-label="Business Card Wallet demo video">
                <iframe
                  src="https://www.youtube.com/embed/C3veKbMd1ug?rel=0&modestbranding=1"
                  title="Business Card Wallet Demo"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="modal-columns">
                <div>
                  <h3>Core Capabilities</h3>
                  <ul className="bullet-list">
                    <li><strong>Unified Index:</strong> All scanned contacts consolidated with instant global search.</li>
                    <li><strong>Smart Sorting:</strong> Sort by name, company, title, recency, creation source.</li>
                    <li><strong>Advanced Filters:</strong> Segment by tags (event, region), industry, role seniority, enrichment signals.</li>
                    <li><strong>Quick Actions:</strong> One‑click call, email, or copy details (desktop & mobile optimized).</li>
                    <li><strong>Bulk Operations:</strong> Tag, export, or initiate sequences for selected contacts.</li>
                    <li><strong>Merge & Clean:</strong> Duplicate detection + guided merge flow keeps data pristine.</li>
                  </ul>
                </div>
                <div>
                  <h3>Productivity & Insight</h3>
                  <ul className="bullet-list">
                    <li><strong>Activity Timeline:</strong> View follow‑ups, meetings, and notes per contact.</li>
                    <li><strong>Auto Enrichment:</strong> Company profile & role context (where enabled).</li>
                    <li><strong>Relationship Signals:</strong> Tag hot, nurture, dormant based on interaction velocity.</li>
                    <li><strong>Saved Views:</strong> Persist personal or shared filtered boards.</li>
                    <li><strong>Export & Sync:</strong> Push to CRM, download CSV/VCF, or webhook integration.</li>
                    <li><strong>Mobile Friendly:</strong> Optimized layout for in‑event usage.</li>
                  </ul>
                </div>
              </div>
              <div className="modal-extra">
                <h3>Security & Governance</h3>
                <p>Role‑based access, audit history, and restricted fields ensure sensitive contact data is handled responsibly. Optional retention and redaction policies align with compliance requirements.</p>
                <p className="footnote">Roadmap: AI role inference, intent scoring, multi‑org sharing controls, contact health scoring, and workflow triggers.</p>
              </div>
              <div className="modal-actions">
                <a
                  href="https://b2breeze.vercel.app/"
                  className="btn primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the B2Breeze web application in a new tab"
                >Launch App</a>
                <button className="btn secondary" onClick={() => setFeatureModal(null)}>Close</button>
              </div>
            </div>
          </div>
          <button className="modal-backdrop" aria-label="Close overlay" onClick={() => setFeatureModal(null)} />
        </div>
      )}
      {featureModal === 'customer-directory' && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-customer-directory-title">
          <div className="modal-window">
            <header className="modal-header">
              <h2 id="modal-customer-directory-title">Customer Directory</h2>
              <button className="modal-close" aria-label="Close" onClick={() => setFeatureModal(null)}>×</button>
            </header>
            <div className="modal-body">
              <p className="lead">A centralized, intelligent profile hub for every customer—unifying attributes, interaction timelines, preferences, and strategic context to power proactive engagement.</p>
              <div className="video-embed" aria-label="Customer Directory demo video">
                <iframe
                  src="https://www.youtube.com/embed/C3veKbMd1ug?rel=0&modestbranding=1"
                  title="Customer Directory Demo"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="modal-columns">
                <div>
                  <h3>Core Profile Data</h3>
                  <ul className="bullet-list">
                    <li><strong>Unified Profile:</strong> Company + contact roll‑up with key metadata.</li>
                    <li><strong>Interaction History:</strong> Meetings, emails, calls, notes, touchpoints.</li>
                    <li><strong>Engagement Signals:</strong> Recent activity, responsiveness, lifecycle stage.</li>
                    <li><strong>Preferences:</strong> Channels, cadence, content & region specifics.</li>
                    <li><strong>Ownership & Roles:</strong> Assigned reps, success managers, stakeholders.</li>
                    <li><strong>Attachments:</strong> Contracts, proposals, supporting documents.</li>
                  </ul>
                </div>
                <div>
                  <h3>Productivity & Intelligence</h3>
                  <ul className="bullet-list">
                    <li><strong>Advanced Filtering:</strong> Segment by industry, ARR band, tier, status.</li>
                    <li><strong>Smart Search:</strong> Fuzzy + field‑specific query (name, domain, tag).</li>
                    <li><strong>Quick Actions:</strong> Launch call, compose email, schedule follow‑up.</li>
                    <li><strong>Custom Fields:</strong> Extend schema without engineering ticket.</li>
                    <li><strong>Aggregate Metrics:</strong> Health, velocity, engagement score snapshots.</li>
                    <li><strong>Saved Views:</strong> Personal & shared workspace boards.</li>
                  </ul>
                </div>
              </div>
              <div className="modal-extra">
                <h3>Security & Governance</h3>
                <p>Fine‑grained permission layers restrict sensitive commercial data while enabling cross‑functional visibility. Audit trails, change logs, and retention policies reinforce compliance.</p>
                <p className="footnote">Roadmap: predictive churn flags, AI summary panels, intent enrichment, timeline anomaly alerts, and auto lifecycle stage recalibration.</p>
              </div>
              <div className="modal-actions">
                <a
                  href="https://b2breeze.vercel.app/"
                  className="btn primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the B2Breeze web application in a new tab"
                >Launch App</a>
                <button className="btn secondary" onClick={() => setFeatureModal(null)}>Close</button>
              </div>
            </div>
          </div>
          <button className="modal-backdrop" aria-label="Close overlay" onClick={() => setFeatureModal(null)} />
        </div>
      )}
      {featureModal === 'task-planner' && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-task-planner-title">
          <div className="modal-window">
            <header className="modal-header">
              <h2 id="modal-task-planner-title">Task Planner</h2>
              <button className="modal-close" aria-label="Close" onClick={() => setFeatureModal(null)}>×</button>
            </header>
            <div className="modal-body">
              <p className="lead">Plan, prioritize, and execute work with clarity. The Task Planner turns scattered to‑dos into structured, trackable workflows aligned to outcomes.</p>
              <div className="video-embed" aria-label="Task Planner demo video">
                <iframe
                  src="https://www.youtube.com/embed/C3veKbMd1ug?rel=0&modestbranding=1"
                  title="Task Planner Demo"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="modal-columns">
                <div>
                  <h3>Core Capabilities</h3>
                  <ul className="bullet-list">
                    <li><strong>Flexible Views:</strong> Kanban, List, Calendar, Timeline.</li>
                    <li><strong>Smart Priorities:</strong> Inline SLA + urgency indicators.</li>
                    <li><strong>Deadlines & Reminders:</strong> Auto follow‑up nudges before risk.</li>
                    <li><strong>Dependencies:</strong> Blocked/blocks relationships with visual cues.</li>
                    <li><strong>Recurring Tasks:</strong> Rules for daily/weekly/monthly cycles.</li>
                    <li><strong>Subtasks & Checklists:</strong> Break work into actionable units.</li>
                  </ul>
                </div>
                <div>
                  <h3>Automation & Insight</h3>
                  <ul className="bullet-list">
                    <li><strong>Auto Assignment:</strong> Route based on role, load, or tags.</li>
                    <li><strong>Progress Analytics:</strong> Throughput, cycle time, completion rate.</li>
                    <li><strong>Bulk Actions:</strong> Multi‑edit, reassign, tag, status shift.</li>
                    <li><strong>Smart Suggestions:</strong> Surface stale or at‑risk tasks.</li>
                    <li><strong>Cross‑Linking:</strong> Connect tasks to contacts, deals, or events.</li>
                    <li><strong>Shortcut Commands:</strong> Quick create with natural text parsing.</li>
                  </ul>
                </div>
              </div>
              <div className="modal-extra">
                <h3>Security & Governance</h3>
                <p>Role‑aware visibility, immutable audit logs, and field‑level restrictions protect sensitive workflows. Configurable retention & export safeguards regulatory alignment.</p>
                <p className="footnote">Roadmap: AI workload balancing, predictive delay alerts, time estimation, auto prioritization, and focused daily briefing digest.</p>
              </div>
              <div className="modal-actions">
                <a
                  href="https://b2breeze.vercel.app/"
                  className="btn primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the B2Breeze web application in a new tab"
                >Launch App</a>
                <button className="btn secondary" onClick={() => setFeatureModal(null)}>Close</button>
              </div>
            </div>
          </div>
          <button className="modal-backdrop" aria-label="Close overlay" onClick={() => setFeatureModal(null)} />
        </div>
      )}
      <ChatWidget />
    </div>
  )
}
