/**
 * Zmenšení fotky v prohlížeči před nahráním. 1568 px na delší straně je
 * doporučený rozměr pro vision modely a stačí i pro detail inzerátu; nové
 * zakódování přes canvas zároveň zahodí EXIF včetně GPS polohy.
 */
const MAX_EDGE_PX = 1568
const JPEG_QUALITY = 0.85

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Fotku se nepodařilo převést na JPEG'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

export async function resizePhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Prohlížeč nepodporuje úpravu fotek')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto'
  return new File([await canvasToJpeg(canvas)], `${baseName}.jpg`, { type: 'image/jpeg' })
}
