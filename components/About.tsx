import ScrollReveal from "@/components/ScrollReveal";

const aboutHtml = `Hi! My name is Vladyslav Zhuravel. Welcome to my site, glad you visited it.<br>Fun fact: my last name, Zhuravel (Журавель), pronounces as "Zhoo-rah-VEL" and means "crane" in Ukrainian — the bird 🦢, not the machine.<br><br>I was born and raised in the greatest city in Ukraine — Kharkiv. The city is renowned for its universities and research institutions. It was here that the atom was first split in the USSR, and where distinguished scientists such as Ilya Mechnikov, Lev Landau, and many others once worked. Unfortunately, I had to leave my home due to Russian aggression. If you'd like to donate to humanitarian aid for Ukrainians and the people of Kharkiv, please reach out to me by email or any available channel.<br><br>I currently live in Turkey, where I've been building software for over four years — with a brief pause for emigration before returning to the industry. I'm driven by automation and edtech, the field I work in today. I believe technology can make education more accessible, and I want to be part of that change.`;

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
          <p
            className="text-lg text-[var(--color-text-secondary)] text-justify"
            dangerouslySetInnerHTML={{ __html: aboutHtml }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
