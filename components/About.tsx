import ScrollReveal from "@/components/ScrollReveal";

export default function About() {
  return (
    <section
      id="about"
      className="bg-[var(--color-bg-alt-transparent)] py-12 px-6 md:py-[72px] md:px-6 min-h-[60vh] flex items-center justify-center"
    >
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-12">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
          About
        </h2>

        <ScrollReveal>
          <div className="text-lg text-[var(--color-text-secondary)] text-justify space-y-4">
            <p>
              Hi, I&apos;m Vlad Zhuravel — <b>a full-stack engineer</b> building
              AI-powered products in education technology.
            </p>

            <p>
              Over the past 5 years, I&apos;ve been working on platforms that serve
              millions of learners — from national-scale school ecosystems and
              military education systems to corporate learning platforms with global
              reach. My stack is <b>Python, Django, React, and Open edX</b>, but
              what sets me apart is where I take it.
            </p>

            <p>
              Today I build <b>RAG pipelines, MCP servers for Claude, and AI-driven
              content generation</b> — all inside production projects. I also do
              technical discovery and pre-sale architecture, because understanding
              what a client actually needs makes me a better engineer than any
              framework ever could.
            </p>

            <p>
              <b>I believe education is the highest-leverage problem technology can
              solve. I want to be part of the teams that prove it.</b>
            </p>

            <h3 className="text-xl font-bold text-[var(--color-text-primary)] pt-4">
              My Story
            </h3>

            <p>
              My journey into tech started at the hardware level — wiring sensors,
              programming controllers, and building automation systems for heating
              and ventilation at a construction company in Kharkiv, Ukraine. That
              hands-on work with the lowest layers of abstraction — electricity,
              physics, debugging things that could literally catch fire — shaped how
              I think about software today. Every layer up, from circuits to servers
              to AI agents, I carry the same instinct: understand what&apos;s actually
              happening, not just what the framework abstracts away.
            </p>

            <p>
              In late 2021 I joined a software company as an intern. Three months
              later, in March 2022, I closed my probation period. If you remember
              that March in Ukraine — you understand what that means. Russia launched
              a full-scale invasion, and Kharkiv, my home city, became one of the
              most shelled cities in Europe.
            </p>

            <p>
              I kept working. The team kept working. I grew from intern to junior to
              mid-level engineer while the country was at war. In 2024 I relocated to
              Turkey — a difficult year of starting over in a new country with a new
              language and zero stability. But it gave me clarity on what I want to
              build and why.
            </p>

            <p>
              I was born and raised in Kharkiv — a city famous for its universities,
              where the atom was first split in the Soviet Union, where scientists
              like Ilya Mechnikov and Lev Landau once worked. It&apos;s still standing.
              If you&apos;d like to support humanitarian aid for Ukrainians and the
              people of Kharkiv, please reach out — I&apos;ll point you to trusted
              organizations.
            </p>

            <p className="text-sm text-[var(--color-text-muted)] italic pt-4">
              Fun fact: my last name, Zhuravel (Журавель), pronounces as
              &quot;Zhoo-rah-VEL&quot; and means &quot;crane&quot; in Ukrainian — the bird 🦢, not the machine.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
