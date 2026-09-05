import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
} from "@react-pdf/renderer"

// Helper: Generates stylesheet based on the active visual template
const getStyles = (template: string) => {
  const isSerif = template === 'classic-serif';
  const isNavy = template === 'executive-navy' || template === 'photo-executive';
  const isCompact = template === 'compact-tech';
  const isMinimal = template === 'modern-minimal' || template === 'photo-minimal';
  const isTwoColumn = template === 'two-column';
  const isCreative = template === 'creative-bold' || template === 'photo-creative';
  const isElegant = template === 'elegant-sidebar';
  const isPhotoSidebar = template === 'photo-modern-sidebar';
  const isPhotoExec = template === 'photo-executive';
  const isPhotoMinimal = template === 'photo-minimal';
  const isPhotoCreative = template === 'photo-creative';
  const isAtsClean = template === 'ats-clean';

  const fontFamily = isSerif ? "Times-Roman" : isAtsClean ? "Courier" : "Helvetica";
  const fontFamilyBold = isSerif ? "Times-Bold" : isAtsClean ? "Courier-Bold" : "Helvetica-Bold";

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
  } else if (isCreative) {
    textColor = "#1e293b";
    nameColor = "#1e1b4b";
    sectionColor = "#1e1b4b";
    borderColor = "#4f46e5";
  } else if (isElegant || isPhotoSidebar) {
    textColor = "#334155";
    nameColor = "#0f172a";
    sectionColor = "#334155";
    borderColor = "#cbd5e1";
  } else if (isAtsClean) {
    textColor = "#111827";
    nameColor = "#000000";
    sectionColor = "#000000";
    borderColor = "transparent";
  }

  // Header Align
  const headerAlign = (isMinimal || isCompact || isCreative || isAtsClean || isTwoColumn || isElegant) ? "flex-start" : "center";
  const contactJustify = (isMinimal || isCompact || isCreative || isAtsClean || isTwoColumn || isElegant) ? "flex-start" : "center";

  // Spacing
  const pagePaddingTop = isCompact ? 18 : 28;
  const pagePaddingBottom = isCompact ? 12 : 20;
  const entryBlockMargin = isCompact ? 4 : (isTwoColumn || isElegant) ? 5 : 8;
  const sectionMargin = isCompact ? 2 : (isTwoColumn || isElegant) ? 4 : 5;

  return StyleSheet.create({
    page: {
      fontFamily,
      fontSize: isCompact ? 9 : 10,
      color: textColor,
      paddingTop: pagePaddingTop,
      paddingBottom: pagePaddingBottom,
      paddingLeft: isAtsClean ? 35 : 36,
      paddingRight: isAtsClean ? 35 : 36,
      lineHeight: isCompact ? 1.35 : 1.4,
      backgroundColor: "#ffffff",
    },
    headerContainer: {
      alignItems: headerAlign,
      paddingBottom: 0,
      marginBottom: isCompact ? 3 : 6,
    },
    name: {
      fontSize: isCompact ? 18 : isCreative ? 24 : 22,
      fontFamily: fontFamilyBold,
      color: nameColor,
      letterSpacing: isCreative ? 0.8 : 0.5,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    headline: {
      fontSize: isCompact ? 10 : 11.5,
      fontFamily: fontFamilyBold,
      color: isCreative ? "#4f46e5" : textColor,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingTop: isCompact ? 4 : 6,
      marginBottom: 0,
    },
    accentBar: {
      width: "100%",
      height: 3,
      backgroundColor: "#4f46e5",
      marginTop: 4,
      marginBottom: 6,
      borderRadius: 1.5,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: contactJustify,
      alignItems: "center",
      marginTop: 6,
    },
    contactText: {
      fontSize: isCompact ? 8 : 9,
      color: isMinimal || isElegant ? "#64748b" : "#475569",
    },
    contactLink: {
      fontSize: isCompact ? 8 : 9,
      color: isMinimal || isElegant ? "#475569" : isNavy ? "#1e3a8a" : isCreative ? "#4f46e5" : "#2563eb",
      textDecoration: "underline",
    },
    projectLink: {
      fontFamily,
      fontSize: isCompact ? 8.5 : 9.5,
      color: isMinimal || isElegant ? "#4b5563" : isNavy ? "#1e3a8a" : isCreative ? "#4f46e5" : "#2563eb",
      textDecoration: "underline",
    },
    contactDot: {
      fontSize: isCompact ? 7.5 : 8.5,
      color: isAtsClean ? "#9ca3af" : borderColor === "transparent" ? "#9ca3af" : borderColor,
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
      borderBottomWidth: isAtsClean ? 0 : isCreative ? 0 : isNavy ? 1.5 : 1,
      borderBottomColor: borderColor,
      borderLeftWidth: isCreative ? 3.5 : 0,
      borderLeftColor: isCreative ? "#4f46e5" : "transparent",
      paddingLeft: isCreative ? 5 : 0,
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
    bulletTextBold: {
      fontSize: isCompact ? 8.5 : 9.5,
      color: textColor,
      fontFamily: fontFamilyBold,
      lineHeight: 1.35,
    },
    entryBlock: {
      marginBottom: entryBlockMargin,
    },
    sidebarPhoto: {
      width: 90,
      height: 90,
      borderRadius: 0,
      alignSelf: "center",
      marginBottom: 10,
      borderWidth: 1.5,
      borderColor: "#4f46e5",
    },
    headerPhoto: {
      width: 80,
      height: 80,
      borderRadius: 0,
      marginRight: 12,
      borderWidth: 1.5,
      borderColor: isNavy ? "#1e3a8a" : "#4f46e5",
    },
    minimalAvatarPhoto: {
      width: 65,
      height: 65,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: "#cbd5e1",
    },
    creativePhoto: {
      width: 80,
      height: 80,
      borderRadius: 0,
      borderWidth: 1.5,
      borderColor: "#4f46e5",
      marginRight: 12,
    },
    headerWithPhotoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isCompact ? 3 : 6,
    },
    headerPhotoMeta: {
      flex: 1,
    },
  });
};

interface ResumeData {
  name: string
  role?: string
  photoUrl?: string
  contact: {
    email: string
    phone: string
    linkedin: string
    github: string
    portfolio?: string
    location?: string
    photoUrl?: string
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
    fieldOfStudy?: string
    dates: string
    grade?: string
  }[]
}

interface Props {
  data: ResumeData
  template?: string
}

function parseBold(text: string, styles: any) {
  if (!text) return null
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <Text key={i} style={{ fontFamily: styles.bulletTextBold?.fontFamily || 'Helvetica-Bold' }}>{p.slice(2, -2)}</Text>
      : p
  )
}

// Helper: render a bullet list with bold parsing
const BulletList = ({ items, styles }: { items: string[]; styles: any }) => (
  <View>
    {items.map((item, i) => (
      <View key={i} style={styles.bulletRow}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bulletText}>
          {parseBold(item, styles)}
        </Text>
      </View>
    ))}
  </View>
)

const SummarySection = ({ data, styles }: { data: ResumeData; styles: any }) => {
  if (!data.summary) return null
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.bodyText}>{data.summary}</Text>
    </View>
  )
}

const SkillsSection = ({ data, styles }: { data: ResumeData; styles: any }) => {
  if (!data.skills || data.skills.length === 0) return null
  return (
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
  )
}

const EducationSection = ({ data, styles }: { data: ResumeData; styles: any }) => {
  if (!data.education || data.education.length === 0) return null
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      {data.education.map((edu, i) => (
        <View key={i} style={styles.entryBlock}>
          <View style={styles.entryRow}>
            <Text style={styles.entryTitle}>
              {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} — {edu.institution}
            </Text>
            <Text style={styles.entryDate}>{edu.dates}</Text>
          </View>
          {edu.grade && (
            <Text style={styles.entrySubtitle}>Grade / GPA: {edu.grade}</Text>
          )}
        </View>
      ))}
    </View>
  )
}

const formatPdfMonthYear = (dateStr?: string) => {
  if (!dateStr) return ""
  const trimmed = dateStr.trim()
  if (!trimmed) return ""
  if (trimmed.toLowerCase() === 'present') return 'Present'
  if (/^[A-Za-z]+\s+\d{4}$/.test(trimmed)) return trimmed
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/)
  if (isoMatch) {
    const year = isoMatch[1]
    const monthIndex = parseInt(isoMatch[2], 10) - 1
    if (monthIndex >= 0 && monthIndex <= 11) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${monthNames[monthIndex]} ${year}`
    }
  }
  const slashMatch = trimmed.match(/^(\d{1,2})[-/](\d{4})$/)
  if (slashMatch) {
    const monthIndex = parseInt(slashMatch[1], 10) - 1
    const year = slashMatch[2]
    if (monthIndex >= 0 && monthIndex <= 11) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${monthNames[monthIndex]} ${year}`
    }
  }
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }
  return trimmed
}

const formatPdfDates = (datesStr?: string) => {
  if (!datesStr) return ""
  if (datesStr.includes(" - ")) {
    const parts = datesStr.split(" - ")
    return `${formatPdfMonthYear(parts[0])} - ${formatPdfMonthYear(parts[1])}`
  }
  return formatPdfMonthYear(datesStr)
}

const ExperienceSection = ({ data, styles }: { data: ResumeData; styles: any }) => {
  if (!data.experience || data.experience.length === 0) return null
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {data.experience.map((exp, i) => (
        <View key={i} style={styles.entryBlock}>
          <View style={styles.entryRow}>
            <Text style={styles.entryTitle}>
              {exp.role} — {exp.company}{exp.location ? ` (${exp.location})` : ""}
            </Text>
            <Text style={styles.entryDate}>{formatPdfDates(exp.dates)}</Text>
          </View>
          <BulletList items={exp.bullets} styles={styles} />
        </View>
      ))}
    </View>
  )
}

const ProjectsSection = ({ data, styles, formatUrl }: { data: ResumeData; styles: any; formatUrl: (url?: string) => string }) => {
  if (!data.projects || data.projects.length === 0) return null
  return (
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
            </Text>
          </View>
          {proj.techStack && proj.techStack.trim() ? (
            <Text style={styles.entrySubtitle}>Tech: {proj.techStack}</Text>
          ) : null}
          <BulletList items={proj.bullets} styles={styles} />
        </View>
      ))}
    </View>
  )
}

const AchievementsSection = ({ data, styles }: { data: ResumeData; styles: any }) => {
  if (!data.achievements || data.achievements.length === 0) return null
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Achievements & Certifications</Text>
      <BulletList items={data.achievements} styles={styles} />
    </View>
  )
}

const LanguagesSection = ({ data, styles }: { data: ResumeData; styles: any }) => {
  if (!data.languages || data.languages.length === 0) return null
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Languages</Text>
      <Text style={styles.skillsText}>{data.languages.join(", ")}</Text>
    </View>
  )
}

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

  const isTwoColumn = template === 'two-column';
  const isElegant = template === 'elegant-sidebar';
  const isCreative = template === 'creative-bold';
  const isPhotoSidebar = template === 'photo-modern-sidebar';
  const isPhotoExec = template === 'photo-executive';
  const isPhotoCreative = template === 'photo-creative';
  const isPhotoMinimal = template === 'photo-minimal';

  const photoSrc = data.photoUrl || data.contact?.photoUrl;

  return (
    <Document title={`${data.name} — Resume`} author={data.name}>
      <Page size="A4" style={styles.page}>

        {/* ── Photo Modern Sidebar Layout ── */}
        {isPhotoSidebar && (
          <View style={{ flexDirection: "row", gap: 14 }}>
            {/* Left Sidebar (25%) */}
            <View style={{ width: "25%", borderRightWidth: 1, borderRightColor: "#e2e8f0", paddingRight: 8 }}>
              {photoSrc ? (
                <Image src={photoSrc} style={styles.sidebarPhoto} />
              ) : null}
              <View style={{ marginBottom: 8, marginTop: 2 }}>
                <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: "#0f172a", textTransform: "uppercase" }}>Contact</Text>
                <View style={{ marginTop: 4 }}>
                  {contactItems.map((item, i) => (
                    <View key={i} style={{ marginBottom: 2.5 }}>
                      {item.type === "link" ? (
                        <Link src={item.url} style={styles.contactLink}>{item.label}</Link>
                      ) : (
                        <Text style={styles.contactText}>{item.label}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
              <SkillsSection data={data} styles={styles} />
              <EducationSection data={data} styles={styles} />
              <LanguagesSection data={data} styles={styles} />
              <AchievementsSection data={data} styles={styles} />
            </View>
            {/* Right Column (75%) */}
            <View style={{ width: "75%", paddingLeft: 6 }}>
              <View style={{ marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1.5, borderBottomColor: "#4f46e5" }}>
                <Text style={styles.name}>{data.name}</Text>
                {data.role && <Text style={{ ...styles.headline, color: "#4f46e5" }}>{data.role}</Text>}
              </View>
              <SummarySection data={data} styles={styles} />
              <ExperienceSection data={data} styles={styles} />
              <ProjectsSection data={data} styles={styles} formatUrl={formatUrl} />
            </View>
          </View>
        )}

        {/* ── Photo Executive Layout ── */}
        {isPhotoExec && (
          <View>
            {/* Executive Header with Photo */}
            <View style={styles.headerWithPhotoRow}>
              {photoSrc ? (
                <Image src={photoSrc} style={styles.headerPhoto} />
              ) : null}
              <View style={styles.headerPhotoMeta}>
                <Text style={styles.name}>{data.name}</Text>
                {data.role && <Text style={styles.headline}>{data.role}</Text>}
                <View style={styles.contactRow}>
                  {contactItems.map((item, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <Text style={styles.contactDot}>•</Text>}
                      {item.type === "link" ? (
                        <Link src={item.url} style={styles.contactLink}>{item.label}</Link>
                      ) : (
                        <Text style={styles.contactText}>{item.label}</Text>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            </View>

            <SummarySection data={data} styles={styles} />
            <SkillsSection data={data} styles={styles} />
            <EducationSection data={data} styles={styles} />
            <ExperienceSection data={data} styles={styles} />
            <ProjectsSection data={data} styles={styles} formatUrl={formatUrl} />
            <AchievementsSection data={data} styles={styles} />
            <LanguagesSection data={data} styles={styles} />
          </View>
        )}

        {/* ── Photo Creative Layout ── */}
        {isPhotoCreative && (
          <View>
            <View style={styles.headerWithPhotoRow}>
              {photoSrc ? (
                <Image src={photoSrc} style={styles.creativePhoto} />
              ) : null}
              <View style={styles.headerPhotoMeta}>
                <Text style={styles.name}>{data.name}</Text>
                {data.role && <Text style={{ ...styles.headline, color: "#4f46e5" }}>{data.role}</Text>}
                <View style={styles.contactRow}>
                  {contactItems.map((item, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <Text style={styles.contactDot}>•</Text>}
                      {item.type === "link" ? (
                        <Link src={item.url} style={styles.contactLink}>{item.label}</Link>
                      ) : (
                        <Text style={styles.contactText}>{item.label}</Text>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.accentBar} />

            <SummarySection data={data} styles={styles} />
            <SkillsSection data={data} styles={styles} />
            <ExperienceSection data={data} styles={styles} />
            <ProjectsSection data={data} styles={styles} formatUrl={formatUrl} />
            <EducationSection data={data} styles={styles} />
            <AchievementsSection data={data} styles={styles} />
            <LanguagesSection data={data} styles={styles} />
          </View>
        )}

        {/* ── Photo Minimal Layout ── */}
        {isPhotoMinimal && (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.name}>{data.name}</Text>
                {data.role && <Text style={styles.headline}>{data.role}</Text>}
                <View style={styles.contactRow}>
                  {contactItems.map((item, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <Text style={styles.contactDot}>•</Text>}
                      {item.type === "link" ? (
                        <Link src={item.url} style={styles.contactLink}>{item.label}</Link>
                      ) : (
                        <Text style={styles.contactText}>{item.label}</Text>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
              {photoSrc ? (
                <Image src={photoSrc} style={styles.minimalAvatarPhoto} />
              ) : null}
            </View>

            <SummarySection data={data} styles={styles} />
            <SkillsSection data={data} styles={styles} />
            <EducationSection data={data} styles={styles} />
            <ExperienceSection data={data} styles={styles} />
            <ProjectsSection data={data} styles={styles} formatUrl={formatUrl} />
            <AchievementsSection data={data} styles={styles} />
            <LanguagesSection data={data} styles={styles} />
          </View>
        )}

        {/* ── Two Column Layout ── */}
        {isTwoColumn && (
          <View>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.name}>{data.name}</Text>
              {data.role && <Text style={styles.headline}>{data.role}</Text>}
              <View style={styles.contactRow}>
                {contactItems.map((item, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <Text style={styles.contactDot}>•</Text>}
                    {item.type === "link" ? (
                      <Link src={item.url} style={styles.contactLink}>{item.label}</Link>
                    ) : (
                      <Text style={styles.contactText}>{item.label}</Text>
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* 2 Column Body */}
            <View style={{ flexDirection: "row", gap: 14, marginTop: 4 }}>
              {/* Left Column (30%) */}
              <View style={{ width: "30%" }}>
                <SkillsSection data={data} styles={styles} />
                <EducationSection data={data} styles={styles} />
                <LanguagesSection data={data} styles={styles} />
                <AchievementsSection data={data} styles={styles} />
              </View>
              {/* Right Column (70%) */}
              <View style={{ width: "70%" }}>
                <SummarySection data={data} styles={styles} />
                <ExperienceSection data={data} styles={styles} />
                <ProjectsSection data={data} styles={styles} formatUrl={formatUrl} />
              </View>
            </View>
          </View>
        )}

        {/* ── Elegant Sidebar Layout ── */}
        {isElegant && (
          <View style={{ flexDirection: "row", gap: 14 }}>
            {/* Left Sidebar (30%) */}
            <View style={{ width: "30%", borderRightWidth: 1, borderRightColor: "#e2e8f0", paddingRight: 10 }}>
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.name}>{data.name}</Text>
                {data.role && <Text style={styles.headline}>{data.role}</Text>}
                <View style={{ marginTop: 6 }}>
                  {contactItems.map((item, i) => (
                    <View key={i} style={{ marginBottom: 2.5 }}>
                      {item.type === "link" ? (
                        <Link src={item.url} style={styles.contactLink}>{item.label}</Link>
                      ) : (
                        <Text style={styles.contactText}>{item.label}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
              <SkillsSection data={data} styles={styles} />
              <EducationSection data={data} styles={styles} />
              <LanguagesSection data={data} styles={styles} />
              <AchievementsSection data={data} styles={styles} />
            </View>
            {/* Right Column (70%) */}
            <View style={{ width: "70%", paddingLeft: 4 }}>
              <SummarySection data={data} styles={styles} />
              <ExperienceSection data={data} styles={styles} />
              <ProjectsSection data={data} styles={styles} formatUrl={formatUrl} />
            </View>
          </View>
        )}

        {/* ── Standard Single Column Layouts ── */}
        {!isTwoColumn && !isElegant && !isPhotoSidebar && !isPhotoExec && !isPhotoCreative && !isPhotoMinimal && (
          <View>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.name}>{data.name}</Text>
              {data.role && <Text style={styles.headline}>{data.role}</Text>}
              {isCreative && <View style={styles.accentBar} />}
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

            <SummarySection data={data} styles={styles} />
            <SkillsSection data={data} styles={styles} />
            <EducationSection data={data} styles={styles} />
            <ExperienceSection data={data} styles={styles} />
            <ProjectsSection data={data} styles={styles} formatUrl={formatUrl} />
            <AchievementsSection data={data} styles={styles} />
            <LanguagesSection data={data} styles={styles} />
          </View>
        )}

      </Page>
    </Document>
  )
}
