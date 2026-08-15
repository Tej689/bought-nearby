const MAX_EDGE = 400
const JPEG_QUALITY = 0.7

/**
 * Reads a camera capture and returns a downscaled JPEG dataURL.
 *
 * This downscale is required, not an optimisation. localStorage caps around
 * 5MB; a single full-size iPhone photo as a dataURL is several MB on its own,
 * so storing them raw wedges the app after two or three logs — which, on a
 * demo stage, happens exactly when someone is watching.
 */
export async function toStoredPhoto(file: File): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } catch {
    // A missing photo is a cosmetic problem; a thrown error mid-log is not.
    return null
  }
}
