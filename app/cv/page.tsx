import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV — Vladyslav Zhuravel",
};

export default function CVPage() {
  return (
    <section className="flex flex-col items-center px-4 py-4 md:py-6" style={{ height: "calc(100vh - 140px)" }}>
      <div className="w-full max-w-[900px] flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Curriculum Vitae
          </h1>
          <a
            href="/cv.pdf"
            download
            className="px-5 py-2 rounded-lg text-base font-medium hover:opacity-85"
            style={{
              backgroundColor: "var(--color-dark)",
              color: "var(--color-bg)",
            }}
          >
            Download PDF
          </a>
        </div>

        <iframe
          src="/cv.pdf"
          className="w-full flex-1 rounded-lg border"
          style={{ borderColor: "var(--color-border)" }}
          title="Vladyslav Zhuravel — CV"
        />
      </div>
    </section>
  );
}
