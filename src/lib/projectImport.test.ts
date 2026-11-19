import { describe, expect, it } from 'vitest'
import { createPayload, isoDate, parseProjectTable, planImport, updatePayload } from './projectImport'

const table = [
  'Namn\tBeskrivning\tHuvudspråk\tSpråk\tRader\tFiler\tMappar\tSenast ändrad\tFunktioner',
  'bitcoin-homepage\tA modern site with **real-time** prices.\tTypeScript\tTypeScript, Markdown, JSON, SQL, PowerShell, JavaScript, CSS\t80.5K\t550\t194\t24 sep. 2026\tDark mode, Real-time price',
  'family-community\tA modern web application.\tTypeScript\tTypeScript, JSON\t20.6K\t114\t57\t27 jan. 2026\tUser authentication, Community feed',
  'family-community\t\tJSON\tJSON, TypeScript\t8.6K\t30\t14\t25 nov. 2025\t',
  'gigsnap\tThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs).\tJSON\tJSON, TypeScript\t7.1K\t22\t4\t14 apr. 2026\t',
  'pl-ai-portal\tThis template provides a minimal setup to get React working in Vite with HMR.\tTypeScript\tTypeScript, JSON\t26.0K\t128\t28\t21 apr. 2026\t',
  'vadblirdet\t\tUnknown\t\t0\t0\t0\t1 jan. 1970\t',
  'pulsetrack\tByggd med **Expo** och **React Native**.\tJSON\tJSON, TypeScript\t94.9K\t281\t53\t19 nov. 2026\tDashboard, Övningsbibliotek',
].join('\n')

describe('parseProjectTable', () => {
  const projects = parseProjectTable(table)

  it('keeps the richer duplicate and clears template descriptions', () => {
    expect(projects.map((project) => project.name)).toEqual([
      'bitcoin-homepage',
      'family-community',
      'gigsnap',
      'pl-ai-portal',
      'vadblirdet',
      'pulsetrack',
    ])
    const family = projects.find((project) => project.name === 'family-community')
    expect(family?.primaryLanguage).toBe('TypeScript')
    expect(family?.lineCount).toBe(20600)
    expect(family?.description).toBe('A modern web application.')
    expect(projects.find((project) => project.name === 'gigsnap')?.description).toBe('')
    expect(projects.find((project) => project.name === 'pl-ai-portal')?.description).toBe('')
  })

  it('parses counts, dates, markdown and an unknown empty repo', () => {
    const bitcoin = projects.find((project) => project.name === 'bitcoin-homepage')
    expect(bitcoin?.lineCount).toBe(80500)
    expect(bitcoin?.repoChangedOn).toBe('2026-09-24')
    expect(bitcoin?.description).toBe('A modern site with real-time prices.')
    expect(bitcoin?.languages).toContain('PowerShell')
    const empty = projects.find((project) => project.name === 'vadblirdet')
    expect(empty?.primaryLanguage).toBe('')
    expect(empty?.repoChangedOn).toBeNull()
    expect(empty?.lineCount).toBe(0)
    expect(projects.find((project) => project.name === 'pulsetrack')?.description).toBe('Byggd med Expo och React Native.')
  })

  it('rejects a table without the name columns', () => {
    expect(() => parseProjectTable('A\tB\n1\t2')).toThrow(/Namn och Beskrivning/)
  })
})

describe('isoDate', () => {
  it('keeps a calendar date as YYYY-MM-DD', () => {
    expect(isoDate('2026-09-24')).toBe('2026-09-24')
    expect(isoDate('2026-09-24T10:00:00Z')).toBe('2026-09-24')
    expect(isoDate(null)).toBe('')
  })
})

describe('planImport', () => {
  const projects = parseProjectTable(table)

  it('creates new names and updates an existing name without touching its status', () => {
    const plan = planImport([{ id: 'abc', name: 'Family-Community' }], projects)
    expect(plan.update.map((item) => item.id)).toEqual(['abc'])
    expect(plan.create.map((project) => project.name)).not.toContain('family-community')
    const created = createPayload(plan.create[0])
    expect(created.status).toBe('idea')
    expect(updatePayload(plan.update[0].project)).not.toHaveProperty('status')
    expect(updatePayload(plan.update[0].project)).not.toHaveProperty('notes')
    expect(updatePayload(plan.update[0].project)).not.toHaveProperty('github_url')
    expect(updatePayload(plan.update[0].project)).toMatchObject({ description: 'A modern web application.' })
  })

  it('does not blank a description when the imported text is empty', () => {
    const gigsnap = projects.find((project) => project.name === 'gigsnap')
    expect(gigsnap).toBeDefined()
    expect(updatePayload(gigsnap!)).not.toHaveProperty('description')
    expect(updatePayload(gigsnap!)).not.toHaveProperty('features')
  })
})
