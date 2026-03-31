import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV — Vladyslav Zhuravel",
};

export default function CVPage() {
  return (
    <section className="min-h-[calc(100vh-80px)] flex flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full max-w-[900px] flex flex-col items-center gap-6">
        <div className="flex items-center justify-between w-full">
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
          className="w-full rounded-lg border"
          style={{
            height: "calc(100vh - 180px)",
            borderColor: "var(--color-border)",
          }}
          title="Vladyslav Zhuravel — CV"
        />
      </div>
    </section>
  );
}
