import {useCallback, useRef, useState} from 'react'
import {PatchEvent, set, useClient} from 'sanity'
import {Button, Card, Grid, Spinner, Stack, Text} from '@sanity/ui'
import {useToast} from '@sanity/ui/toast'
import {UploadIcon} from '@sanity/icons/Upload'
import imageUrlBuilder from '@sanity/image-url'

/**
 * Gallery input for wedding albums.
 *
 * The Studio's default array input forces editors through a dialog per photo
 * (alt text, caption, …), which is painful when a client album holds dozens of
 * pictures. This input replaces it with one drag & drop zone and a multi-file
 * picker: every selected file is uploaded straight to the Sanity asset CDN and
 * all of them are appended to the array in a single patch, in the order they
 * were selected. The first photo doubles as the album cover, so it carries a
 * "Cover" badge; thumbnails can be dragged to reorder and removed with ✕.
 *
 * Photo items intentionally hold nothing but the image — alt text falls back
 * to the album title on the website (see `mapAlbum`).
 */

type AlbumPhoto = {
  _type: 'albumPhoto'
  _key: string
  image?: unknown
}

/**
 * Minimal structural shape of the props the Studio passes to any array input.
 * Deliberately not `ArrayOfObjectsInputProps`: `defineField` infers an
 * untyped array as a primitives array, and a narrower parameter type keeps
 * this component assignable to whatever the schema expects while the runtime
 * still delivers the object-array props for this field.
 */
type BulkPhotosInputProps = {
  onChange: (patch: PatchEvent) => void
  value?: unknown
  readOnly?: boolean
}

/** Sanity only requires `_key` to be unique within the array. */
const newKey = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function BulkPhotosInput(props: BulkPhotosInputProps) {
  const {onChange, readOnly} = props
  const value: AlbumPhoto[] = Array.isArray(props.value)
    ? (props.value as AlbumPhoto[])
    : []

  const client = useClient()
  const {push: pushToast} = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<{done: number; total: number} | null>(
    null
  )
  const [dropActive, setDropActive] = useState(false)
  const dragIndexRef = useRef<number | null>(null)

  const builder = imageUrlBuilder(client)

  const thumbnail = (photo: AlbumPhoto) => {
    if (!photo?.image) return undefined
    try {
      return builder.image(photo.image).width(320).height(320).fit('crop').url()
    } catch {
      return undefined
    }
  }

  const commit = useCallback(
    (next: AlbumPhoto[]) => onChange(PatchEvent.from(set(next))),
    [onChange]
  )

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const images = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
      )
      if (!images.length) return

      setProgress({done: 0, total: images.length})
      const added: AlbumPhoto[] = []
      let failed = 0

      // Sequential on purpose: keeps the selection order in the gallery and
      // avoids hammering the CDN with dozens of parallel uploads.
      for (const [index, file] of images.entries()) {
        try {
          const asset = await client.assets.upload('image', file, {
            title: file.name.replace(/\.[^.]+$/, ''),
          })
          added.push({
            _type: 'albumPhoto',
            _key: newKey(),
            image: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}},
          })
        } catch {
          failed += 1
        }
        setProgress({done: index + 1, total: images.length})
      }

      setProgress(null)
      if (added.length) commit([...value, ...added])
      if (failed) {
        pushToast({
          status: 'error',
          title: `${failed} of ${images.length} photos failed to upload`,
        })
      }
    },
    [client, commit, pushToast, value]
  )

  const removeAt = (index: number) =>
    commit(value.filter((_, i) => i !== index))

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= value.length) return
    const next = [...value]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    commit(next)
  }

  return (
    <Stack gap={3}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        disabled={readOnly}
        onChange={(event) => {
          const files = event.target.files
          if (files) void upload(files)
          // Allow re-selecting the same file after a failed attempt.
          event.target.value = ''
        }}
      />

      <Card
        padding={4}
        radius={2}
        style={{
          border: `1px dashed ${
            dropActive
              ? 'var(--card-tone-primary-color)'
              : 'var(--card-hairline-color)'
          }`,
          textAlign: 'center',
        }}
        onDragOver={(event) => {
          if (readOnly) return
          event.preventDefault()
          setDropActive(true)
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(event) => {
          setDropActive(false)
          if (readOnly) return
          const files = event.dataTransfer.files
          if (files?.length) {
            event.preventDefault()
            void upload(files)
          }
        }}
      >
        {progress ? (
          <Stack gap={3}>
            <Spinner />
            <Text size={1}>
              Uploading {progress.done} of {progress.total} photos…
            </Text>
          </Stack>
        ) : (
          <Stack gap={3}>
            <Text size={1} weight="medium">
              Drag &amp; drop photos here
            </Text>
            <Text size={1} muted>
              Select as many files as you like — they are added in one go. The
              first photo becomes the album cover.
            </Text>
            {!readOnly && (
              <Button
                icon={UploadIcon}
                text="Select photos"
                onClick={() => fileInputRef.current?.click()}
              />
            )}
          </Stack>
        )}
      </Card>

      {value.length > 0 && (
        <Grid gridTemplateColumns={[2, 3, 4]} gap={3}>
          {value.map((photo, index) => (
            <Card
              key={photo._key}
              padding={0}
              radius={2}
              shadow={1}
              draggable={!readOnly}
              onDragStart={() => {
                dragIndexRef.current = index
              }}
              onDragOver={(event) => {
                if (dragIndexRef.current !== null) event.preventDefault()
              }}
              onDrop={(event) => {
                if (dragIndexRef.current === null) return
                event.preventDefault()
                event.stopPropagation()
                move(dragIndexRef.current, index)
                dragIndexRef.current = null
              }}
              onDragEnd={() => {
                dragIndexRef.current = null
              }}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
                cursor: readOnly ? 'default' : 'grab',
              }}
            >
              {thumbnail(photo) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbnail(photo)}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--card-hairline-color)',
                  }}
                />
              )}

              {index === 0 && (
                <span
                  style={{
                    position: 'absolute',
                    left: 6,
                    bottom: 6,
                    padding: '2px 6px',
                    borderRadius: 3,
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    fontSize: 11,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Cover
                </span>
              )}

              {!readOnly && (
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => removeAt(index)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    lineHeight: '24px',
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </Card>
          ))}
        </Grid>
      )}
    </Stack>
  )
}
