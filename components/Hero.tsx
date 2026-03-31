import TypedText from "@/components/TypedText";
import ScrollReveal from "@/components/ScrollReveal";

export default function Hero() {
  return (
    <section className="min-h-[92vh] py-20 px-6 md:px-6 flex items-center justify-center">
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-12">
        <ScrollReveal>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-[5px] text-[var(--color-text-primary)] mb-2">
            Vladyslav Zhuravel
          </h1>

          <TypedText text="Full Stack Web Developer" />

          <div className="hero-facts text-lg text-[var(--color-text-muted)] leading-loose mb-7">
            4+ years building web applications
            <br />
            Python, Odoo, React, k8s, CI/CD &amp; DevOps, AI Agents
          </div>

          <div className="flex flex-wrap gap-3 max-md:flex-col max-md:items-start max-md:gap-2">
            <a
              href="#contact"
              className="px-6 py-2.5 rounded-lg text-lg font-medium hover:opacity-85 max-md:px-4 max-md:text-base"
              style={{ backgroundColor: 'var(--color-dark)', color: 'var(--color-bg)' }}
            >
              Contact Me
            </a>
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--color-border)] text-[var(--color-text-primary)] px-6 py-2.5 rounded-lg text-lg hover:border-[var(--color-text-secondary)] max-md:px-4 max-md:text-base"
            >
              Download CV
            </a>
            <a
              href="https://linkedin.com/in/vladzsh"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--color-border)] text-[var(--color-text-primary)] px-6 py-2.5 rounded-lg text-lg hover:border-[var(--color-text-secondary)] max-md:px-4 max-md:text-base"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/vladzsh"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[var(--color-border)] text-[var(--color-text-primary)] px-6 py-2.5 rounded-lg text-lg hover:border-[var(--color-text-secondary)] max-md:px-4 max-md:text-base"
            >
              GitHub
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
