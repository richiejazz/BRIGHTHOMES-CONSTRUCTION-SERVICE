import { router, useLocalSearchParams } from 'expo-router'
import { ArrowRight, MessageSquareText } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import { useProject, useServices } from '../../src/api/content'
import type { Project } from '../../src/api/types'
import { DetailScaffold, DetailSection, IllustrativeNotice } from '../../src/components/content/DetailScaffold'
import { ProjectStatusLabel, projectStatusLabel } from '../../src/components/content/ProjectCard'
import { SaveButton } from '../../src/components/content/SaveButton'
import { Button } from '../../src/components/ui/Button'
import { FactRow } from '../../src/components/ui/Editorial'
import { ExpandableText } from '../../src/components/ui/ExpandableText'
import { Text } from '../../src/components/ui/Text'
import { formatMonthYear, padIndex } from '../../src/lib/format'
import { fonts, makeStyles, space, useTheme } from '../../src/theme'

export default function ProjectDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const query = useProject(slug)
  const enquire = (data: Project) => router.push({ pathname: '/enquire', params: { project: data.slug } })
  return (
    <DetailScaffold
      query={query}
      noun="Project"
      fallback={{ pathname: '/explore', params: { section: 'projects' } }}
      browseLabel="Browse projects"
      seed={(data) => data.id}
      title={(data) => data.title}
      images={(data) => data.images}
      actions={(data) => <SaveButton kind="projects" itemId={data.id} title={data.title} />}
      footer={(data) => (
        <>
          <SaveButton kind="projects" itemId={data.id} title={data.title} variant="button" />
          <Button label="Enquire" accessibilityLabel="Start a conversation about this project" icon={MessageSquareText} onPress={() => enquire(data)} style={styles.grow} />
        </>
      )}
    >
      {(data) => <ProjectCaseStudy project={data} onEnquire={() => enquire(data)} />}
    </DetailScaffold>
  )
}

function ProjectCaseStudy({ project, onEnquire }: { project: Project; onEnquire: () => void }) {
  const themed = useStyles()
  const { colors } = useTheme()
  const services = useServices()
  const delivered = (services.data ?? []).filter((service) => project.services.includes(service.id))
  // Only facts recorded against the project are shown; nothing is filled in or estimated.
  const facts = [
    { label: 'Category', value: project.category.name },
    project.location ? { label: 'Location', value: project.location } : null,
    project.is_demo ? null : { label: 'Status', value: projectStatusLabel(project.status) },
    project.start_date ? { label: 'Started', value: formatMonthYear(project.start_date) } : null,
    project.end_date ? { label: project.status === 'completed' ? 'Completed' : 'Expected completion', value: formatMonthYear(project.end_date) } : null,
    delivered.length ? { label: 'Services', value: `${delivered.length} delivered` } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  return (
    <>
      <View style={themed.meta}>
        <Text variant="caption" color={colors.textSubtle} style={themed.grow} numberOfLines={1}>
          {['Project', project.category.name, project.location || null].filter(Boolean).join(' · ')}
        </Text>
        {project.is_demo ? null : <ProjectStatusLabel project={project} />}
      </View>
      <Text variant="title">{project.title}</Text>
      <Text variant="label">{project.summary}</Text>

      {project.is_demo ? <IllustrativeNotice noun="project" /> : null}

      <DetailSection title="Overview">
        <ExpandableText>{project.description}</ExpandableText>
      </DetailSection>

      <DetailSection title="Project information">
        <View style={themed.facts}>
          {facts.map((fact, index) => (
            <FactRow key={fact.label} label={fact.label} value={fact.value} last={index === facts.length - 1} />
          ))}
        </View>
      </DetailSection>

      {delivered.length ? (
        <DetailSection title="Services delivered">
          <View>
            {delivered.map((service, index) => (
              <Pressable
                key={service.id}
                onPress={() => router.push(`/services/${service.slug}`)}
                accessibilityRole="link"
                accessibilityLabel={`${service.name} service`}
                style={({ pressed }) => [themed.service, index === 0 && themed.serviceFirst, pressed && themed.pressed]}
              >
                <Text style={themed.serviceIndex}>{padIndex(index)}</Text>
                <Text variant="label" style={themed.grow}>
                  {service.name}
                </Text>
                <ArrowRight size={16} color={colors.accent} strokeWidth={1.5} />
              </Pressable>
            ))}
          </View>
        </DetailSection>
      ) : null}


      <View style={themed.cta}>
        <Text variant="heading">Planning a similar project?</Text>
        <Text variant="small">Tell us about your site, brief and timeline, or book time with the team.</Text>
        <Button label="Start a conversation" icon={MessageSquareText} onPress={onEnquire} fullWidth />
        <Button label="Request a consultation" variant="secondary" onPress={() => router.push({ pathname: '/consultation', params: { project: project.slug } })} fullWidth />
      </View>
    </>
  )
}

const styles = StyleSheet.create({ grow: { flex: 1 } })

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    grow: { flex: 1 },
    meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
    facts: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
    service: { flexDirection: 'row', alignItems: 'center', gap: space.lg, minHeight: 56, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    serviceFirst: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
    serviceIndex: { fontFamily: fonts.displayItalic, fontSize: 20, color: c.accentText, width: 28 },
    pressed: { backgroundColor: c.surface },
    cta: { marginTop: space.xxl, gap: space.md, padding: space.lg, backgroundColor: c.surface },
  }),
)
