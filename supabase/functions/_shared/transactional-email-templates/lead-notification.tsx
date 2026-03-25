import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Samurai SEO"

interface LeadNotificationProps {
  type?: string
  name?: string
  email?: string
  phone?: string
  company?: string
  productCount?: number
  expectedVolume?: number
  timePerItem?: number
  revenueRange?: string
  savedHours?: number
  websiteUrl?: string
}

const LeadNotificationEmail = (props: LeadNotificationProps) => {
  const isQuiz = props.type === 'quiz_submission'
  const previewText = isQuiz
    ? `Nyt quiz-lead: ${props.name || 'Ukendt'} (${props.company || ''})`
    : `Ny SEO-tekst anmodning: ${props.websiteUrl || ''}`

  return (
    <Html lang="da" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isQuiz ? 'Nyt Quiz Lead' : 'Ny SEO Tekst Anmodning'}
          </Heading>

          {isQuiz ? (
            <Section>
              <Row label="Navn" value={props.name} />
              <Row label="Email" value={props.email} />
              <Row label="Telefon" value={props.phone} />
              <Row label="Virksomhed" value={props.company} />
              <Hr style={hr} />
              <Row label="Produkter" value={props.productCount?.toString()} />
              <Row label="Volume/md" value={props.expectedVolume?.toString()} />
              <Row label="Min/produkt" value={props.timePerItem?.toString()} />
              <Row label="Omsætning" value={props.revenueRange} />
              <Row label="Timer sparet" value={props.savedHours ? `${props.savedHours}t` : undefined} />
            </Section>
          ) : (
            <Section>
              <Row label="Website URL" value={props.websiteUrl} />
              <Row label="Email" value={props.email} />
            </Section>
          )}

          <Text style={footer}>— {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const Row = ({ label, value }: { label: string; value?: string }) => (
  <Text style={row}>
    <span style={rowLabel}>{label}:</span> {value || '—'}
  </Text>
)

export const template = {
  component: LeadNotificationEmail,
  subject: (data: Record<string, any>) =>
    data.type === 'quiz_submission'
      ? `Nyt Quiz Lead: ${data.name || 'Ukendt'} (${data.company || ''})`
      : `Ny SEO Tekst Anmodning: ${data.websiteUrl || ''}`,
  displayName: 'Lead notification',
  previewData: {
    type: 'quiz_submission',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+45 12345678',
    company: 'Acme ApS',
    productCount: 500,
    expectedVolume: 200,
    timePerItem: 15,
    revenueRange: '1-5 mio DKK',
    savedHours: 50,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '520px' }
const h1 = { fontSize: '20px', fontWeight: 'bold' as const, color: '#093128', margin: '0 0 20px' }
const row = { fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '2px 0' }
const rowLabel = { fontWeight: 'bold' as const, color: '#093128' }
const hr = { borderColor: '#e5e5e5', margin: '12px 0' }
const footer = { fontSize: '12px', color: '#999', marginTop: '24px' }
