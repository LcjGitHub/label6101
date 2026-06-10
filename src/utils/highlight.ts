export function highlightText(text: string, query: string): (string | { match: string })[] {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return [text]
  }

  const lowerQuery = trimmedQuery.toLowerCase()
  const lowerText = text.toLowerCase()
  const result: (string | { match: string })[] = []
  let lastIndex = 0
  let index = lowerText.indexOf(lowerQuery)

  while (index !== -1) {
    if (index > lastIndex) {
      result.push(text.slice(lastIndex, index))
    }
    const matchedText = text.slice(index, index + trimmedQuery.length)
    result.push({ match: matchedText })
    lastIndex = index + trimmedQuery.length
    index = lowerText.indexOf(lowerQuery, lastIndex)
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result.length > 0 ? result : [text]
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
