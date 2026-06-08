"use client"

import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer"

// Helper: Generates stylesheet based on the active visual template
const getStyles = (template: string) => {
  const isSerif = template === 'classic-serif';
  const isNavy = template === 'executive-navy';
  const isCompact = template === 'compact-tech';
  const isMinimal = template === 'modern-minimal';

  const fontFamily = isSerif ? "Times-Roman" : "Helvetica";
  const fontFamilyBold = isSerif ? "Times-Bold" : "Helvetica-Bold";

  // Base colors
  let textColor = "#000000";
  let nameColor = "#000000";
  let sectionColor = "#000000";
  let borderColor = "#0f172a";

  if (isNavy) {
    nameColor = "#1e3a8a";
    sectionColor = "#1e3a8a";
    borderColor = "#1e3a8a";
  } else if (isMinimal) {
    textColor = "#334155";
    nameColor = "#1f2937";
    sectionColor = "#4b5563";
    borderColor = "#d1d5db";
  }

  // Header Align
  const headerAlign = (isMinimal || isCompact) ? "flex-start" : "center";
  const contactJustify = (isMinimal || isCompact) ? "flex-start" : "center";

  // Spacing
  const pagePaddingTop = isCompact ? 18 : 30;
  const pagePaddingBottom = isCompact ? 12 : 20;
  const entryBlockMargin = isCompact ? 4 : 8;
  const sectionMargin = isCompact ? 2 : 4;

  return StyleSheet.create({
    page: {
      fontFamily,
      fontSize: isCompact ? 9 : 10,
      color: textColor,
      paddingTop: pagePaddingTop,
      paddingBottom: pagePaddingBottom,
      paddingLeft: 40,
      paddingRight: 40,
      lineHeight: isCompact ? 1.35 : 1.4,
      backgroundColor: "#ffffff",
    },
    headerContainer: {
      alignItems: headerAlign,
      paddingBottom: 0,
      marginBottom: isCompact ? 3 : 6,
    },
    name: {
      fontSize: isCompact ? 18 : 22,
      fontFamily: fontFamilyBold,
      color: nameColor,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    headline: {
      fontSize: isCompact ? 10 : 12,
      fontFamily: fontFamilyBold,
      color: textColor,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingTop:12,
      marginBottom: 0,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: contactJustify,
      alignItems: "center",
      marginTop: 8,
    },
    contactText: {
      fontSize: isCompact ? 8 : 9,
      color: isMinimal ? "#64748b" : "#475569",
    },
    contactLink: {
      fontSize: isCompact ? 8 : 9,
      color: isMinimal ? "#475569" : isNavy ? "#1e3a8a" : "#2563eb",
      textDecoration: "underline",
    },
    projectLink: {
      fontFamily,
      fontSize: isCompact ? 8.5 : 9.5,
      color: isMinimal ? "#4b5563" : isNavy ? "#1e3a8a" : "#2563eb",
      textDecoration: "underline",
    },
    contactDot: {
      fontSize: isCompact ? 7.5 : 8.5,
      color: borderColor,
      marginHorizontal: 6,
    },
    section: {
      marginBottom: sectionMargin,
    },
    sectionTitle: {
      fontSize: isCompact ? 9 : 10,
      fontFamily: fontFamilyBold,
      textTransform: "uppercase",
      color: sectionColor,
      borderBottomWidth: isNavy ? 1.5 : 1,
      borderBottomColor: borderColor,
      marginBottom: 3,
      paddingBottom: 1,
    },
    bodyText: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: textColor,
      lineHeight: 1.45,
      marginBottom: 3,
    },
    skillsText: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: textColor,
      lineHeight: 1.45,
    },
    skillsTextBold: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: textColor,
      fontFamily: fontFamilyBold,
    },
    entryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: "100%",
    },
    entryTitle: {
      fontSize: isCompact ? 8.5 : 9.5,
      fontFamily: fontFamilyBold,
      color: nameColor,
      flex: 1,
      flexWrap: "wrap",
    },
    entryDate: {
      fontSize: isCompact ? 8.5 : 9.5,
      fontFamily: fontFamilyBold,
      color: textColor,
      textAlign: "right",
    },
    entrySubtitle: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: textColor,
      marginBottom: 2,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 1.5,
      paddingLeft: 6,
    },
    bulletDot: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: textColor,
      marginRight: 4,
      lineHeight: 1.35,
    },
    bulletText: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: textColor,
      flex: 1,
      lineHeight: 1.35,
    },
    entryBlock: {
      marginBottom: entryBlockMargin,
    },
  });
};

interface ResumeData {
  name: string
  role?: string
  contact: {
    email: string
    phone: string
    linkedin: string
    github: string
    portfolio?: string
    location?: string
  }
  summary: string
  skills: (string | { category: string; skills: string[] })[]
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
    projectLink?: string
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
  template?: string
}

// Helper: render a bullet list
const BulletList = ({ items, styles }: { items: string[]; styles: any }) => (
  <>
    {items.map((item, i) => (
      <View key={i} style={styles.bulletRow}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </>
)

export function ResumePdfDocument({ data, template = 'classic-serif' }: Props) {
  const styles = getStyles(template);

  const formatUrl = (url?: string) => {
    if (!url) return ""
    const trimmed = url.trim()
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed
    }
    return `https://${trimmed}`
  }

  interface ContactItem {
    type: "text" | "link"
    label: string
    url?: string
  }

  const contactItems: ContactItem[] = [
    data.contact.email ? { type: "text", label: data.contact.email, url: `mailto:${data.contact.email.trim()}` } : null,
    data.contact.phone ? { type: "text", label: data.contact.phone } : null,
    data.contact.location ? { type: "text", label: data.contact.location } : null,
    data.contact.linkedin ? { type: "link", label: "LinkedIn", url: formatUrl(data.contact.linkedin) } : null,
    data.contact.github ? { type: "link", label: "GitHub", url: formatUrl(data.contact.github) } : null,
    data.contact.portfolio ? { type: "link", label: "Portfolio", url: formatUrl(data.contact.portfolio) } : null,
  ].filter((item): item is ContactItem => item !== null)

  return (
    <Document title={`${data.name} — Resume`} author={data.name}>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{data.name}</Text>
          {data.role && <Text style={styles.headline}>{data.role}</Text>}
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={styles.contactDot}>•</Text>}
                {item.type === "link" ? (
                  <Link src={item.url} style={styles.contactLink}>
                    {item.label}
                  </Link>
                ) : (
                  <Text style={styles.contactText}>{item.label}</Text>
                )}
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
            {typeof data.skills[0] === 'string' ? (
              <Text style={styles.skillsText}>{(data.skills as any).join(",  ")}</Text>
            ) : (
              (data.skills as any).map((cat: any, idx: number) => {
                const skillsList = Array.isArray(cat.skills) ? cat.skills.filter(Boolean) : [];
                if (skillsList.length === 0) return null;
                return (
                  <Text key={idx} style={styles.skillsText}>
                    <Text style={styles.skillsTextBold}>{cat.category}: </Text>
                    {skillsList.join(",  ")}
                  </Text>
                );
              })
            )}
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
                <BulletList items={exp.bullets} styles={styles} />
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
                  <Text style={styles.entryTitle}>
                    {proj.name}
                    {proj.projectLink ? "  " : ""}
                    {proj.projectLink && (
                      <Link src={formatUrl(proj.projectLink)} style={styles.projectLink}>
                        LINK
                      </Link>
                    )}
                    {/* {proj.projectLink ? ")" : ""} */}
                  </Text>
                  <Text style={styles.entryDate}>Tech: {proj.techStack}</Text>
                </View>
                <BulletList items={proj.bullets} styles={styles} />
              </View>
            ))}
          </View>
        )}

        {/* ── Achievements ── */}
        {data.achievements && data.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements & Certifications</Text>
            <BulletList items={data.achievements} styles={styles} />
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
