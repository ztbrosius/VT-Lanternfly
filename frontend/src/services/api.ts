export type SightingMetadata = {
  photo_id: string
  file_name: string | null
  timestamp: string | null
  latitude: number | null
  longitude: number | null
  location_source: string | null
  camera_make: string | null
  camera_model: string | null
  image_format: string | null
  width: number | null
  height: number | null
}
export type LanternflyDetection = {
  class_id: number
  label: string
  confidence: number
  bbox_xyxy: number[]
}
export type DetectionResult = {
  status: 'detected' | 'not_detected' | 'unavailable'
  model: string
  detection_count: number
  detections: LanternflyDetection[]
  confidence_threshold?: number
  image_width?: number
  image_height?: number
  message?: string
}
export type UploadResponse = {
  message: string
  photo_id: string
  metadata: SightingMetadata
  detection: DetectionResult
  verification_status: 'pending_review'
}

export async function uploadPhoto(photo: File): Promise<UploadResponse> {
  const data = new FormData()
  data.append('photo', photo)
  const response = await fetch('/api/sightings', { method: 'POST', body: data })
  if (!response.ok) {
    let detail = `Upload failed (${response.status})`
    try { const body = await response.json(); if (typeof body.detail === 'string') detail = body.detail } catch { /* no JSON */ }
    throw new Error(detail)
  }
  return response.json() as Promise<UploadResponse>
}
