import { projects } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

const itemCls =
  "stagger-item project-item flex justify-between items-center py-4 px-1 border-b border-[var(--color-border)] transition-all duration-800 max-md:flex-col max-md:items-start";

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
          <div className="border-t border-[var(--color-border)]">
            {projects.map((project, i) => {
              const content = (
                <div className="project-info">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] inline">
                    {project.name}
                  </h3>
                  <p className="text-base text-[var(--color-text-secondary)] text-justify">
                    {project.description}
                  </p>
                </div>
              );

              return project.url ? (
                <a
                  key={project.name}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={itemCls}
                >
                  {content}
                </a>
              ) : (
                <div key={project.name} className={`${itemCls} project-item--no-link`}>
                  {content}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
