import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  Font,
  renderToBuffer,
  StyleSheet,
} from "@react-pdf/renderer";
import { writeFileSync } from "fs";
import { join } from "path";
import { experience, projects, skills } from "../lib/data";

// --- Fonts ---
Font.register({
  family: "Quantico",
  fonts: [
    { src: join(process.cwd(), "public/fonts/Quantico-Regular.ttf"), fontWeight: 400 },
    { src: join(process.cwd(), "public/fonts/Quantico-Bold.ttf"), fontWeight: 700 },
  ],
});

// --- Colors ---
const C = {
  black: "#111827",
  gray: "#374151",
  muted: "#6B7280",
  border: "#D1D5DB",
  accent: "#16a34a",
  white: "#ffffff",
};

// --- Styles ---
const s = StyleSheet.create({
  page: {
    fontFamily: "Quantico",
    fontSize: 9,
    color: C.black,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    lineHeight: 1.5,
  },
  name: { fontSize: 22, fontWeight: 700, letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 11, color: C.accent, letterSpacing: 1, marginBottom: 10 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  contactLink: { fontSize: 8, color: C.gray, textDecoration: "none" },
  separator: { fontSize: 8, color: C.border, marginHorizontal: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: C.black,
    borderBottomWidth: 1.5,
    borderBottomColor: C.border,
    paddingBottom: 4,
    marginBottom: 12,
    marginTop: 8,
  },
  expRow: { marginBottom: 14 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  expRole: { fontSize: 11, fontWeight: 700 },
  expDate: { fontSize: 9, color: C.muted },
  expCompany: { fontSize: 10, color: C.gray, marginBottom: 3 },
  expDesc: { fontSize: 9, color: C.gray, textAlign: "justify", lineHeight: 1.6 },
  projRow: { marginBottom: 10 },
  projName: { fontSize: 10, fontWeight: 700 },
  projDesc: { fontSize: 9, color: C.gray, lineHeight: 1.6 },
  projLink: { fontSize: 8, color: C.muted, textDecoration: "none" },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap" },
  skillCol: { width: "50%", marginBottom: 12, paddingRight: 16 },
  skillTitle: { fontSize: 10, fontWeight: 700, marginBottom: 3 },
  skillTags: { fontSize: 8.5, color: C.gray, lineHeight: 1.7 },
  summary: { fontSize: 9.5, color: C.gray, textAlign: "justify", lineHeight: 1.6 },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: C.muted,
  },
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function Sep() {
  return <Text style={s.separator}>|</Text>;
}

function Header() {
  return (
    <View>
      <Text style={s.name}>Vladyslav Zhuravel</Text>
      <Text style={s.title}>Full Stack Web Developer</Text>
      <View style={s.contactRow}>
        <Link src="mailto:vladyslavcrane@gmail.com" style={s.contactLink}>
          vladyslavcrane@gmail.com
        </Link>
        <Sep />
        <Link src="https://github.com/vladzsh" style={s.contactLink}>
          github.com/vladzsh
        </Link>
        <Sep />
        <Link src="https://linkedin.com/in/vladzsh" style={s.contactLink}>
          linkedin.com/in/vladzsh
        </Link>
        <Sep />
        <Link src="https://t.me/vladyslavcrane" style={s.contactLink}>
          t.me/vladyslavcrane
        </Link>
        <Sep />
        <Link src="https://vladzsh.org" style={s.contactLink}>
          vladzsh.org
        </Link>
      </View>
    </View>
  );
}

function PageNum() {
  return (
    <Text
      style={s.pageNumber}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      fixed
    />
  );
}

function CV() {
  return (
    <Document
      title="Vladyslav Zhuravel — CV"
      author="Vladyslav Zhuravel"
      subject="Full Stack Web Developer Resume"
    >
      {/* Page 1: Summary + Experience */}
      <Page size="A4" style={s.page}>
        <Header />
        <View style={{ marginTop: 8 }}>
          <Text style={s.summary}>
            Full-stack developer with 4+ years of experience building web applications
            in the education and e-commerce sectors. Specializing in Python, Django, React,
            Open edX, and cloud infrastructure (Kubernetes, AWS, CI/CD). Passionate about
            automation, edtech, and AI-powered tooling. Currently based in Turkey.
          </Text>
        </View>

        <Text style={s.sectionTitle}>EXPERIENCE</Text>
        {experience.map((e, i) => (
          <View key={i} style={s.expRow}>
            <View style={s.expHeader}>
              <Text style={s.expRole}>{e.role}</Text>
              <Text style={s.expDate}>{e.date}</Text>
            </View>
            <Text style={s.expCompany}>{e.company}</Text>
            <Text style={s.expDesc}>{stripHtml(e.description)}</Text>
          </View>
        ))}
        <PageNum />
      </Page>

      {/* Page 2: Projects */}
      <Page size="A4" style={s.page}>
        <Header />
        <Text style={s.sectionTitle}>PROJECTS</Text>
        {projects
          .filter((p) => p.name !== "Other Projects")
          .map((p, i) => (
            <View key={i} style={s.projRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={s.projName}>{p.name}</Text>
                {p.url ? (
                  <Link src={p.url} style={s.projLink}>
                    {p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </Link>
                ) : null}
              </View>
              <Text style={s.projDesc}>{p.description}</Text>
            </View>
          ))}
        <PageNum />
      </Page>

      {/* Page 3: Skills */}
      <Page size="A4" style={s.page}>
        <Header />
        <Text style={s.sectionTitle}>SKILLS</Text>
        <View style={s.skillsGrid}>
          {skills.map((sk, i) => (
            <View key={i} style={s.skillCol}>
              <Text style={s.skillTitle}>{sk.title}</Text>
              <Text style={s.skillTags}>{sk.tags}</Text>
            </View>
          ))}
        </View>
        <PageNum />
      </Page>
    </Document>
  );
}

async function main() {
  const buffer = await renderToBuffer(<CV />);
  const outPath = join(process.cwd(), "public/cv.pdf");
  writeFileSync(outPath, buffer);
  console.log(`CV generated: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error("Failed to generate CV:", err);
  process.exit(1);
});
