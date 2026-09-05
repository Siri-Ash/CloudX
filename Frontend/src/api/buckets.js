import { request } from './client'

// POST /buckets
export function createBucket({ bucketName, password, visibility }) {
  return request('/buckets', {
    method: 'POST',
    body: {
      bucket_name: bucketName,
      password,
      visibility,
    },
  })
}

// GET /buckets
export function getBuckets() {
  return request('/buckets')
}

// POST /buckets/{bucket_id}/open
export function openBucket(bucketId, password) {
  return request(`/buckets/${bucketId}/open`, {
    method: 'POST',
    body: { password },
  })
}

// DELETE /buckets/{bucket_id}
export function deleteBucket(bucketId) {
  return request(`/buckets/${bucketId}`, { method: 'DELETE' })
}

export function updateBucketVisibility(bucketId, visibility) {
  return request(`/buckets/${bucketId}/visibility`, {
    method: 'PATCH',
    body: { visibility }
  })
}