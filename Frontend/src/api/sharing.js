import { request, requestBlob } from './client'

// POST /buckets/{bucket_id}/share  (requires the bucket owner's JWT)
export function createShareLink(bucketId) {
  return request(`/buckets/${bucketId}/share`, { method: 'POST' })
}

// GET /share/{token}  (public — no auth required)
export function getSharedBucket(token) {
  return request(`/share/${token}`)
}

// GET /share/{token}/files/{file_id}  (public — no auth required)
export function downloadSharedFile(token, fileId) {
  return requestBlob(`/share/${token}/files/${fileId}`)
}
