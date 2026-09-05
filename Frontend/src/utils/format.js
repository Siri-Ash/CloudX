export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return '\u2014'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatDate(isoString) {
  if (!isoString) return '\u2014'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '\u2014'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(isoString) {
  if (!isoString) return '\u2014'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '\u2014'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function fileExtension(filename = '') {
  const parts = filename.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toUpperCase()
}

export function initials(name = '') {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
}
