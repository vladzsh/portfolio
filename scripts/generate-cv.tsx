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
  // Header
  name: { fontSize: 22, fontWeight: 700, letterSpacing: 2, marginBottom: 2 },
  title: { fontSize: 11, color: C.accent, letterSpacing: 1, marginBottom: 8 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  contactItem: { fontSize: 8, color: C.muted },
  contactLink: { fontSize: 8, color: C.gray, textDecoration: "none" },
  separator: { fontSize: 8, color: C.border, marginHorizontal: 4 },
  // Section
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    color: C.black,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 14,
  },
  // Experience
  expRow: { marginBottom: 10 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
  expRole: { fontSize: 10, fontWeight: 700 },
  expDate: { fontSize: 8, color: C.muted },
  expCompany: { fontSize: 9, color: C.gray, marginBottom: 2 },
  expDesc: { fontSize: 8.5, color: C.gray, textAlign: "justify" },
  // Projects
  projRow: { marginBottom: 5 },
  projName: { fontSize: 9.5, fontWeight: 700 },
  projDesc: { fontSize: 8.5, color: C.gray },
  projLink: { fontSize: 8, color: C.muted, textDecoration: "none" },
  // Skills
  skillsGrid: { flexDirection: "row", flexWrap: "wrap" },
  skillCol: { width: "50%", marginBottom: 8, paddingRight: 12 },
  skillTitle: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  skillTags: { fontSize: 8, color: C.gray, lineHeight: 1.6 },
  // Summary
  summary: { fontSize: 9, color: C.gray, textAlign: "justify", marginBottom: 2 },
});

// --- Helpers ---
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function Sep() {
  return <Text style={s.separator}>|</Text>;
}

// --- Document ---
function CV() {
  return (
    <Document
      title="Vladyslav Zhuravel — CV"
      author="Vladyslav Zhuravel"
      subject="Full Stack Web Developer Resume"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
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
          <Link src="https://t.me/vladzsh" style={s.contactLink}>
            t.me/vladzsh
          </Link>
          <Sep />
          <Link src="https://vladzsh.org" style={s.contactLink}>
            vladzsh.org
          </Link>
        </View>

        {/* Summary */}
        <View style={{ marginTop: 6 }}>
          <Text style={s.summary}>
            Full-stack developer with 4+ years of experience building web applications
            in the education and e-commerce sectors. Specializing in Python, Django, React,
            Open edX, and cloud infrastructure (Kubernetes, AWS, CI/CD). Passionate about
            automation, edtech, and AI-powered tooling. Currently based in Turkey.
          </Text>
        </View>

        {/* Experience */}
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

        {/* Projects */}
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

        {/* Skills */}
        <Text style={s.sectionTitle}>SKILLS</Text>
        <View style={s.skillsGrid}>
          {skills.map((sk, i) => (
            <View key={i} style={s.skillCol}>
              <Text style={s.skillTitle}>{sk.title}</Text>
              <Text style={s.skillTags}>{sk.tags}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

// --- Generate ---
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
