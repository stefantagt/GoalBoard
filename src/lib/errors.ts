export type ApiError = {
  message?: string
  code?: string
}

export function toUserMessage(error: ApiError | null | undefined): string {
  const message = error?.message?.trim() || 'Okänt fel från databasen.'
  const code = error?.code ?? ''
  if (code === 'PGRST204' || /could not find the '.+' column/i.test(message)) {
    return 'Data API har inte läst in de nya kolumnerna ännu. Öppna Data API i Neon och välj Refresh schema cache.'
  }
  if (
    code === 'PGRST205' ||
    code === 'PGRST202' ||
    /does not exist/i.test(message) ||
    /could not find the function/i.test(message) ||
    /schema cache/i.test(message)
  ) {
    return 'Databasen saknar GoalBoards tabeller eller funktioner. Kör migreringarna och uppdatera schemacachen i Neon.'
  }
  if (code === '42501' || /permission denied/i.test(message) || /row-level security/i.test(message)) {
    return 'Åtkomst nekades. Kontrollera att ditt användar-ID finns i allowed_users.'
  }
  if (code === 'PGRST301' || /jwt/i.test(message)) {
    return 'Sessionen är inte längre giltig. Logga in igen.'
  }
  if (/target_date/i.test(message) || /goals_check/i.test(message)) {
    return 'Måldatum kan inte ligga före startdatum.'
  }
  return message
}

export function authErrorMessage(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('origin')) {
    return 'Den här adressen är inte betrodd av Neon Auth. Lägg till ursprunget under Auth → Domains.'
  }
  if (lower.includes('invalid') || lower.includes('password') || lower.includes('credential') || lower.includes('user not found')) {
    return 'Fel e-postadress eller lösenord.'
  }
  if (lower.includes('too many') || lower.includes('rate')) {
    return 'För många försök. Vänta en stund och prova igen.'
  }
  return 'Inloggningen misslyckades. Kontrollera uppgifterna och försök igen.'
}
