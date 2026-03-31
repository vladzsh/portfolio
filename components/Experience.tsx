import { experience } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

export default function Experience() {
  return (
    <section
      id="experience"
      className="py-12 px-6 md:py-[72px] md:px-6 min-h-[60vh] flex items-center justify-center"
    >
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-12">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
          Experience
        </h2>

        <ScrollReveal stagger>
          <div className="border-l-2 border-[var(--color-border)] ml-2 pl-7">
            {experience.map((item, i) => (
              <div
                key={i}
                className={`stagger-item relative ${
                  i === experience.length - 1 ? "pb-0" : "pb-7"
                }`}
              >
                <div
                  className={`absolute -left-[35px] top-1 w-3 h-3 rounded-full shadow-[0_0_0_4px_var(--color-bg)] ${
                    i === 0
                      ? "bg-[var(--color-dark)]"
                      : "bg-[var(--color-border)]"
                  }`}
                />
                <p className="text-sm text-[var(--color-text-muted)] mb-0.5">
                  {item.date}
                </p>
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {item.role}
                </p>
                <p className="text-xl text-[var(--color-text-secondary)] mb-1">
                  {item.company}
                </p>
                <p
                  className="text-xl text-[var(--color-text-muted)] text-justify"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
