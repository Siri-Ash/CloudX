import { request, requestMultipart, requestBlob } from './client'

// POST /buckets/{bucket_id}/files  (multipart/form-data)
export function uploadFile(bucketId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return requestMultipart(`/buckets/${bucketId}/files`, formData)
}

// GET /buckets/{bucket_id}/files
export function getFiles(bucketId) {
  return request(`/buckets/${bucketId}/files`)
}

// GET /buckets/{bucket_id}/files/{file_id}  -> triggers a real browser download
export async function downloadFile(bucketId, fileId, fallbackName) {
  const res = await requestBlob(`/buckets/${bucketId}/files/${fileId}`)
  const blob = await res.blob()

  let filename = fallbackName || 'download'
  const disposition = res.headers.get('content-disposition')
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/)
    if (match?.[1]) filename = match[1]
  }

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// DELETE /buckets/{bucket_id}/files/{file_id}
export function deleteFile(bucketId, fileId) {
  return request(`/buckets/${bucketId}/files/${fileId}`, { method: 'DELETE' })
}

// PATCH /buckets/{bucket_id}/files/{file_id}
export function renameFile(bucketId, fileId, fileName) {
  return request(`/buckets/${bucketId}/files/${fileId}`, {
    method: 'PATCH',
    body: { file_name: fileName },
  })
}
