export type ImportedProject = {
  name: string
  description: string
  primaryLanguage: string
  languages: string
  lineCount: number | null
  fileCount: number | null
  folderCount: number | null
  repoChangedOn: string | null
  features: string
}

export type ImportPlan = {
  create: ImportedProject[]
  update: { id: string; project: ImportedProject }[]
}

const months: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  maj: 5,
  jun: 6,
  juni: 6,
  jul: 7,
  juli: 7,
  aug: 8,
  sep: 9,
  okt: 10,
  nov: 11,
  dec: 12,
}

export function parseProjectTable(text: string): ImportedProject[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (lines.length === 0) return []
  const header = lines[0].split('\t').map((cell) => cell.trim().toLowerCase())
  const nameIndex = header.indexOf('namn')
  const descriptionIndex = header.indexOf('beskrivning')
  if (nameIndex < 0 || descriptionIndex < 0) {
    throw new Error('Tabellen behöver en rubrikrad med Namn och Beskrivning.')
  }
  const column = {
    primary: header.indexOf('huvudspråk'),
    languages: header.indexOf('språk'),
    lines: header.indexOf('rader'),
    files: header.indexOf('filer'),
    folders: header.indexOf('mappar'),
    changed: header.indexOf('senast ändrad'),
    features: header.indexOf('funktioner'),
  }
  const parsed = lines.slice(1).flatMap((line) => {
    const cells = line.split('\t')
    const name = cell(cells, nameIndex)
    if (!name) return []
    const description = plainDescription(cell(cells, descriptionIndex))
    const languages = languageList(cell(cells, column.languages))
    const primary = cleanLanguage(cell(cells, column.primary)) || languages.split(', ')[0] || ''
    return [
      {
        name,
        description,
        primaryLanguage: primary,
        languages,
        lineCount: parseCount(cell(cells, column.lines)),
        fileCount: parseCount(cell(cells, column.files)),
        folderCount: parseCount(cell(cells, column.folders)),
        repoChangedOn: parseSwedishDate(cell(cells, column.changed)),
        features: listField(cell(cells, column.features)),
      },
    ]
  })
  return keepRichest(parsed)
}

export function planImport(existing: { id: string; name: string }[], projects: ImportedProject[]): ImportPlan {
  const byName = new Map(existing.map((project) => [normalizeName(project.name), project.id]))
  const plan: ImportPlan = { create: [], update: [] }
  for (const project of projects) {
    const id = byName.get(normalizeName(project.name))
    if (id) plan.update.push({ id, project })
    else plan.create.push(project)
  }
  return plan
}

export function createPayload(project: ImportedProject) {
  return {
    name: project.name,
    description: project.description,
    status: 'idea' as const,
    tech_stack: '',
    github_url: '',
    live_url: '',
    notes: '',
    goal_id: null,
    ...inventoryPayload(project),
  }
}

export function updatePayload(project: ImportedProject) {
  return {
    primary_language: project.primaryLanguage,
    languages: project.languages,
    line_count: project.lineCount,
    file_count: project.fileCount,
    folder_count: project.folderCount,
    repo_changed_on: project.repoChangedOn,
    ...(project.features ? { features: project.features } : {}),
    ...(project.description ? { description: project.description } : {}),
  }
}

export function parseCount(value: string): number | null {
  const trimmed = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!trimmed) return null
  const match = trimmed.match(/^(\d+(?:\.\d+)?)([km])?$/i)
  if (!match) return null
  const amount = Number(match[1])
  const unit = match[2]?.toLowerCase()
  const factor = unit === 'k' ? 1000 : unit === 'm' ? 1_000_000 : 1
  return Math.round(amount * factor)
}

export function formatCount(value: number | null): string {
  if (value === null) return ''
  if (value < 1000) return String(value)
  const scaled = value / 1000
  const rounded = scaled >= 10 ? Math.round(scaled).toString() : (Math.round(scaled * 10) / 10).toString().replace('.', ',')
  return `${rounded}k`
}

export function isoDate(value: string | null): string {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1] ?? ''
}

export function formatRepoDate(value: string | null): string {
  if (!value) return ''
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  const labels = ['jan', 'feb', 'mar', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec']
  return `${Number(match[3])} ${labels[Number(match[2]) - 1]} ${match[1]}`
}

export function languageParts(primary: string, languages: string): { head: string; rest: string[] } {
  const all = listField(languages).split(', ').filter(Boolean)
  const head = cleanLanguage(primary) || all[0] || ''
  return { head, rest: all.filter((language) => language.toLowerCase() !== head.toLowerCase()) }
}

export function featureList(value: string): string[] {
  return listField(value).split(', ').filter(Boolean)
}

export function inventorySummary(project: {
  line_count: number | null
  file_count: number | null
  folder_count: number | null
  repo_changed_on: string | null
}): string {
  const parts = [
    project.line_count !== null ? `${formatCount(project.line_count)} rader` : '',
    project.file_count !== null ? `${formatCount(project.file_count)} filer` : '',
    project.folder_count !== null ? `${formatCount(project.folder_count)} mappar` : '',
    formatRepoDate(project.repo_changed_on),
  ].filter(Boolean)
  return parts.join(' · ')
}

function inventoryPayload(project: ImportedProject) {
  return {
    primary_language: project.primaryLanguage,
    languages: project.languages,
    line_count: project.lineCount,
    file_count: project.fileCount,
    folder_count: project.folderCount,
    repo_changed_on: project.repoChangedOn,
    features: project.features,
  }
}

function keepRichest(projects: ImportedProject[]): ImportedProject[] {
  const chosen = new Map<string, ImportedProject>()
  for (const project of projects) {
    const key = normalizeName(project.name)
    const current = chosen.get(key)
    if (!current || richness(project) >= richness(current)) chosen.set(key, project)
  }
  return [...chosen.values()]
}

function richness(project: ImportedProject): number {
  return (
    (project.description ? 1_000_000 : 0) +
    (project.features ? 10_000 : 0) +
    (project.lineCount ?? 0) +
    (project.primaryLanguage ? 100 : 0)
  )
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('sv')
}

function cell(cells: string[], index: number): string {
  if (index < 0) return ''
  return cells[index]?.trim() ?? ''
}

function plainDescription(value: string): string {
  const plain = value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  const lower = plain.toLowerCase()
  if (lower.includes('create-next-app') || lower.includes('get react working in vite')) return ''
  return plain
}

function cleanLanguage(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || /^unknown$/i.test(trimmed)) return ''
  return trimmed
}

function languageList(value: string): string {
  return value
    .split(',')
    .map(cleanLanguage)
    .filter(Boolean)
    .join(', ')
}

export function listField(value: string): string {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(', ')
}

function parseSwedishDate(value: string): string | null {
  const match = value.trim().toLowerCase().match(/^(\d{1,2})\s+([a-zåäö]+)\.?\s+(\d{4})$/)
  if (!match) return null
  const month = months[match[2]]
  const year = Number(match[3])
  const day = Number(match[1])
  if (!month || year <= 1970 || day < 1 || day > 31) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
