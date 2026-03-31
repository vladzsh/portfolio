import { skills } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

export default function Skills() {
  return (
    <section
      id="skills"
      className="py-12 px-6 md:py-[72px] md:px-6 min-h-[60vh] flex items-center justify-center"
    >
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-12">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
          Skills
        </h2>

        <ScrollReveal stagger>
          <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
            {skills.map((skill, i) => (
              <div key={i} className="stagger-item">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  {skill.title}
                </h3>
                <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
                  {skill.tags}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
