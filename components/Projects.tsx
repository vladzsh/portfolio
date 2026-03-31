import { projects } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

export default function Projects() {
  return (
    <section
      id="projects"
      className="bg-[var(--color-bg-alt-transparent)] py-12 px-6 md:py-[72px] md:px-6 min-h-[60vh] flex items-center justify-center"
    >
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-12">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
          Projects
        </h2>

        <ScrollReveal stagger>
          <div className="border-t border-[#5e6063]">
            {projects.map((project, i) => {
              const inner = (
                <>
                  <div className="project-info">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] inline">
                      {project.name}
                    </h3>
                    <p className="text-base text-[var(--color-text-secondary)] text-justify">
                      {project.description}
                    </p>
                  </div>
                </>
              );

              if (project.url) {
                return (
                  <a
                    key={i}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stagger-item project-item flex justify-between items-center py-4 px-1 border-b border-[#5e6063] transition-all duration-800 max-md:flex-col max-md:items-start"
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <div
                  key={i}
                  className="stagger-item project-item project-item--no-link flex justify-between items-center py-4 px-1 border-b border-[#5e6063] transition-all duration-800 max-md:flex-col max-md:items-start"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
