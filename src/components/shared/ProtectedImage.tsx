import { Spin } from '@arco-design/web-react'
import { useEffect, useState } from 'react'
import { createAssetObjectUrl } from '../../apis/assets'

interface ProtectedImageProps {
  src: string
  alt: string
  className?: string
}

export default function ProtectedImage({ src, alt, className }: ProtectedImageProps) {
  const [objectUrl, setObjectUrl] = useState('')

  useEffect(() => {
    let cancelled = false
    let currentObjectUrl = ''

    async function load() {
      try {
        const nextUrl = await createAssetObjectUrl(src)
        if (cancelled) {
          URL.revokeObjectURL(nextUrl)
          return
        }
        currentObjectUrl = nextUrl
        setObjectUrl(nextUrl)
      } catch {
        if (!cancelled) {
          setObjectUrl('')
        }
      }
    }

    if (src) {
      void load()
    } else {
      setObjectUrl('')
    }

    return () => {
      cancelled = true
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl)
      }
    }
  }, [src])

  if (!objectUrl) {
    return (
      <div className={className}>
        <Spin size={18} />
      </div>
    )
  }

  return <img src={objectUrl} alt={alt} className={className} />
}
