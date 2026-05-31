"use client"

import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: "#1e293b",
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 48,
    paddingRight: 48,
    lineHeight: 1.4,
    backgroundColor: "#ffffff",
  },

  // ── Header ──────────────────────────────────────────────
  headerContainer: {
    alignItems: "center",
    // borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: 14,
    // marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontFamily: "Times-Bold",
    color: "#000000",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
    paddingBottom:10
  },
  headline: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  contactText: {
    fontSize: 8.5,
    color: "#475569",
  },
  contactDot: {
    fontSize: 8.5,
    color: "#94a3b8",
    marginHorizontal: 6,
  },

  // ── Section ──────────────────────────────────────────────
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    // letterSpacing: 1.4,
    color: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
    paddingBottom: 2,
    marginBottom: 2,
  },

  // ── Body text ────────────────────────────────────────────
  bodyText: {
    fontSize: 9.5,
    color: "#000000",
    lineHeight: 1.5,
  },

  // ── Skills ───────────────────────────────────────────────
  skillsText: {
    fontSize: 9.5,
    color: "#000000",
    lineHeight: 1.5,
  },

  // ── Education / Experience / Projects Entry ──────────────
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 9.5,
    fontFamily: "Times-Bold",
    color: "#000000",
    flex: 1,
    flexWrap: "wrap",
  },
  entryDate: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: "#000000",
    textAlign: "right",
  },
  entrySubtitle: {
    fontSize: 9,
    color: "#000000",
    marginBottom: 4,
  },

  // ── Bullets ──────────────────────────────────────────────
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    fontSize: 9.5,
    color: "#000000",
    marginRight: 6,
    lineHeight: 1.4,
  },
  bulletText: {
    fontSize: 9.5,
    color: "#000000",
    flex: 1,
    lineHeight: 1.4,
  },

  // ── Entry block spacing ──────────────────────────────────
  entryBlock: {
    marginBottom: 8,
  },
})

interface ResumeData {
  name: string
  role?: string
  contact: {
    email: string
    phone: string
    linkedin: string
    github: string
  }
  summary: string
  skills: string[]
  languages?: string[]
  achievements?: string[]
  experience: {
    company: string
    role: string
    dates: string
    location?: string
    bullets: string[]
  }[]
  projects: {
    name: string
    techStack: string
    bullets: string[]
  }[]
  education: {
    institution: string
    degree: string
    dates: string
    grade?: string
  }[]
}

interface Props {
  data: ResumeData
}

// Helper: render a bullet list
const BulletList = ({ items }: { items: string[] }) => (
  <>
    {items.map((item, i) => (
      <View key={i} style={styles.bulletRow}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </>
)

export function ResumePdfDocument({ data }: Props) {
  const contactParts: string[] = [
    data.contact.email,
    data.contact.phone,
    data.contact.linkedin ? `${data.contact.linkedin}` : "",
    data.contact.github ? `${data.contact.github}` : "",
  ].filter(Boolean)

  return (
    <Document title={`${data.name} — Resume`} author={data.name}>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{data.name}</Text>
          {data.role && <Text style={styles.headline}>{data.role}</Text>}
          <View style={styles.contactRow}>
            {contactParts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={styles.contactDot}>•</Text>}
                <Text style={styles.contactText}>{part}</Text>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Professional Summary ── */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.bodyText}>{data.summary}</Text>
          </View>
        )}

        {/* ── Skills ── */}
        {data.skills && data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>{data.skills.join(", ")}</Text>
          </View>
        )}

        {/* ── Education ── */}
        {data.education && data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>
                    {edu.degree} — {edu.institution}
                  </Text>
                  <Text style={styles.entryDate}>{edu.dates}</Text>
                </View>
                {edu.grade && (
                  <Text style={styles.entrySubtitle}>Grade / GPA: {edu.grade}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Experience ── */}
        {data.experience && data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>
                    {exp.role} — {exp.company}{exp.location ? ` (${exp.location})` : ""}
                  </Text>
                  <Text style={styles.entryDate}>{exp.dates}</Text>
                </View>
                <BulletList items={exp.bullets} />
              </View>
            ))}
          </View>
        )}

        {/* ── Projects ── */}
        {data.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{proj.name}</Text>
                  <Text style={styles.entryDate}>Tech: {proj.techStack}</Text>
                </View>
                <BulletList items={proj.bullets} />
              </View>
            ))}
          </View>
        )}

        {/* ── Achievements ── */}
        {data.achievements && data.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <BulletList items={data.achievements} />
          </View>
        )}

        {/* ── Languages ── */}
        {data.languages && data.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.skillsText}>{data.languages.join(", ")}</Text>
          </View>
        )}

      </Page>
    </Document>
  )
}
