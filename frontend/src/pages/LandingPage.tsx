import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomCursor from '../components/CustomCursor';

/* ─── Scroll-reveal hook ───────────────────────────────────────────────────── */
function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return ref;
}

/* ─── Stats count-up hook ──────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1500) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const startTime = performance.now();
                const tick = (now: number) => {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.round(eased * target));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);
    return { ref, count };
}

/* ─── Feature Card ─────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: string }) => {
    const ref = useReveal();
    return (
        <div
            ref={ref}
            className="reveal feature-card"
            style={{ transitionDelay: delay }}
        >
            <div className="feature-icon">{icon}</div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-desc">{desc}</p>
        </div>
    );
};

/* ─── Step ─────────────────────────────────────────────────────────────────── */
const Step = ({ num, title, desc, delay }: { num: number; title: string; desc: string; delay: string }) => {
    const ref = useReveal();
    return (
        <div ref={ref} className="reveal step-card" style={{ transitionDelay: delay }}>
            <div className="step-badge">{num}</div>
            <h3 className="step-title">{title}</h3>
            <p className="step-desc">{desc}</p>
        </div>
    );
};

/* ─── Stat ─────────────────────────────────────────────────────────────────── */
const Stat = ({ target, suffix, label, icon }: { target: number; suffix: string; label: string; icon: string }) => {
    const { ref, count } = useCountUp(target);
    return (
        <div ref={ref} className="stat-item">
            <span className="stat-icon">{icon}</span>
            <div className="stat-number">{count}{suffix}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
};

/* ─── Landing Page ─────────────────────────────────────────────────────────── */
const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const featuresRef = useReveal();
    const howRef = useReveal();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="landing-root">
            <CustomCursor />

            {/* ── NAVBAR ── */}
            <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
                <div className="nav-brand">
                    <span className="nav-brand-star">✦</span>
                    <span>Intervue Poll</span>
                </div>
                <div className="nav-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how" className="nav-link">How it works</a>
                    <button onClick={() => navigate('/select')} className="nav-cta">
                        Get Started →
                    </button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero-section">
                {/* Animated blobs */}
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />

                <div className="hero-content">
                    <div className="hero-pill">
                        <span>✦</span> Live · Real-time · Beautiful
                    </div>
                    <h1 className="hero-headline">
                        Real-time Polls,<br />
                        <span className="hero-gradient-text">Instant Insights</span>
                    </h1>
                    <p className="hero-sub">
                        The fastest way to engage your classroom. Ask questions,
                        collect live responses, and see results the moment they come in.
                    </p>
                    <div className="hero-ctas">
                        <button onClick={() => navigate('/select')} className="cta-primary">
                            Start Polling Free
                        </button>
                        <a href="#features" className="cta-ghost">
                            See how it works ↓
                        </a>
                    </div>

                    {/* Mock poll preview card */}
                    <div className="hero-card">
                        <div className="hero-card-header">
                            <span className="hero-card-dot" />
                            <span className="hero-card-dot orange" />
                            <span className="hero-card-dot green" />
                            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#c4b5fd' }}>🔴 Live</span>
                        </div>
                        <div className="hero-card-question">
                            What is the capital of France?
                        </div>
                        <div className="hero-card-option">
                            <div className="hero-card-num">1</div>
                            <span>Paris</span>
                            <div className="hero-card-bar">
                                <div className="hero-card-fill" style={{ width: '72%' }} />
                            </div>
                            <span className="hero-card-pct">72%</span>
                        </div>
                        <div className="hero-card-option">
                            <div className="hero-card-num">2</div>
                            <span>London</span>
                            <div className="hero-card-bar">
                                <div className="hero-card-fill" style={{ width: '28%' }} />
                            </div>
                            <span className="hero-card-pct">28%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="section features-section">
                <div ref={featuresRef} className="reveal section-header">
                    <div className="section-pill">Why Intervue?</div>
                    <h2 className="section-title">Everything you need,<br />nothing you don't</h2>
                    <p className="section-sub">Built for classrooms that move fast.</p>
                </div>
                <div className="features-grid">
                    <FeatureCard
                        icon="⚡"
                        title="Live Results"
                        desc="See votes pour in the moment students submit. Beautiful animated bars update in real-time."
                        delay="0ms"
                    />
                    <FeatureCard
                        icon="💬"
                        title="Built-in Chat"
                        desc="Students can ask questions without disrupting the class. All in the same window."
                        delay="80ms"
                    />
                    <FeatureCard
                        icon="📊"
                        title="Poll History"
                        desc="Every question is saved automatically. Review results any time after the session ends."
                        delay="160ms"
                    />
                    <FeatureCard
                        icon="🎯"
                        title="Correct Answers"
                        desc="Mark the right answer before you ask — students get instant feedback after the poll closes."
                        delay="240ms"
                    />
                    <FeatureCard
                        icon="⏱"
                        title="Smart Timer"
                        desc="Set a countdown from 30 to 120 seconds. The poll closes automatically when time is up."
                        delay="320ms"
                    />
                    <FeatureCard
                        icon="🔒"
                        title="Zero Setup"
                        desc="No accounts, no installs. Students join with a name. You're live in under 30 seconds."
                        delay="400ms"
                    />
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how" className="section how-section">
                <div ref={howRef} className="reveal section-header">
                    <div className="section-pill">How it works</div>
                    <h2 className="section-title">Three steps to<br />your first live poll</h2>
                </div>
                <div className="steps-row">
                    <Step num={1} title="Choose your role" desc="Open the app, pick Teacher or Student. That's literally it — no sign-up needed." delay="0ms" />
                    <div className="step-connector" />
                    <Step num={2} title="Ask or answer" desc="Teachers type a question and set a timer. Students pick their answer the moment it appears." delay="120ms" />
                    <div className="step-connector" />
                    <Step num={3} title="See results live" desc="The bar chart updates in real-time. Discuss, move on, ask another — seamlessly." delay="240ms" />
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="stats-section">
                <Stat target={100} suffix="%" label="Real-time updates" icon="⚡" />
                <Stat target={30} suffix="s" label="Time to first poll" icon="⏱" />
                <Stat target={500} suffix="+" label="Polls conducted" icon="📊" />
                <Stat target={99} suffix="%" label="Uptime reliability" icon="🔒" />
            </section>

            {/* ── FOOTER ── */}
            <footer className="landing-footer">
                {/* Glow blobs */}
                <div className="footer-glow footer-glow-1" />
                <div className="footer-glow footer-glow-2" />

                {/* CTA Band */}
                <div className="footer-cta-band">
                    <div className="footer-cta-eyebrow">✦ Ready to go live?</div>
                    <h2 className="footer-cta-headline">
                        Start your first poll in<br /><span>under 30 seconds</span>
                    </h2>
                    <p className="footer-cta-sub">
                        No accounts, no setup, no downloads. Just open the app, pick a role, and you're live.
                    </p>
                    <button onClick={() => navigate('/select')} className="cta-primary">
                        Get Started Free →
                    </button>
                </div>

                {/* Main columns */}
                <div className="footer-main">
                    {/* Brand col */}
                    <div>
                        <div className="footer-brand">
                            <div className="footer-brand-star">✦</div>
                            Intervue Poll
                        </div>
                        <p className="footer-desc">
                            The fastest way to engage your classroom with live polls, instant results, and zero friction.
                        </p>
                        <div className="footer-badges">
                            <span className="footer-badge">⚡ Real-time</span>
                            <span className="footer-badge">🔒 No login</span>
                            <span className="footer-badge">📱 All devices</span>
                        </div>
                    </div>

                    {/* Product links */}
                    <div>
                        <div className="footer-col-title">Product</div>
                        <ul className="footer-col-links">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how">How it works</a></li>
                            <li><a href="#">Changelog</a></li>
                            <li><a href="#">Roadmap</a></li>
                        </ul>
                    </div>

                    {/* Use cases */}
                    <div>
                        <div className="footer-col-title">Use cases</div>
                        <ul className="footer-col-links">
                            <li><a href="#">Classrooms</a></li>
                            <li><a href="#">Workshops</a></li>
                            <li><a href="#">Interviews</a></li>
                            <li><a href="#">Webinars</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <div className="footer-col-title">Company</div>
                        <ul className="footer-col-links">
                            <li><a href="#">About</a></li>
                            <li><a href="#">Privacy</a></li>
                            <li><a href="#">Terms</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="footer-bottom">
                    <p className="footer-copy">© 2025 Intervue. Made with ❤️ for classrooms everywhere.</p>
                    <div className="footer-socials">
                        <a href="#" className="footer-social-btn" title="GitHub">🐱</a>
                        <a href="#" className="footer-social-btn" title="Twitter">🐦</a>
                        <a href="#" className="footer-social-btn" title="LinkedIn">🔗</a>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;
