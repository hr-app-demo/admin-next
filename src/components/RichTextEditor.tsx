import { Button, Message, Space } from '@arco-design/web-react'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import '@wangeditor/editor/dist/css/style.css'

const removableMarkKeys = [
  'bold',
  'italic',
  'underline',
  'through',
  'code',
  'sup',
  'sub',
  'color',
  'bgColor',
  'fontSize',
  'fontFamily',
] as const

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '请输入内容',
}: RichTextEditorProps) {
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [painterMarks, setPainterMarks] = useState<Record<string, unknown> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [editor])

  const toolbarConfig: Partial<IToolbarConfig> = useMemo(
    () => ({
      toolbarKeys: [
        'headerSelect',
        'fontFamily',
        'fontSize',
        'bold',
        'italic',
        'underline',
        'color',
        'bgColor',
        'blockquote',
        'clearStyle',
        '|',
        'bulletedList',
        'numberedList',
        'insertHr',
        '|',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'indent',
        'delIndent',
        '|',
        'insertLink',
        'undo',
        'redo',
      ],
    }),
    [],
  )

  const editorConfig: Partial<IEditorConfig> = useMemo(
    () => ({
      placeholder,
      scroll: false,
      MENU_CONF: {
        fontFamily: {
          fontFamilyList: [
            'Arial',
            'Helvetica',
            'Times New Roman',
            'Georgia',
            'Verdana',
            'Courier New',
          ],
        },
        fontSize: {
          fontSizeList: ['12px', '14px', '16px', '18px', '24px', '30px', '36px'],
        },
      },
    }),
    [placeholder],
  )

  const handleFormatBrush = () => {
    if (!editor) return

    if (!painterMarks) {
      const marks = editor.getSelectionText()
        ? ((editor as unknown as { getSelectionText: () => string }).getSelectionText(), (editor as unknown as { marks?: Record<string, unknown> }).marks)
        : null
      const currentMarks =
        (editor as unknown as { getMarks?: () => Record<string, unknown> | null }).getMarks?.() ||
        marks ||
        null

      if (!currentMarks || Object.keys(currentMarks).length === 0) {
        Message.warning('请先选中一段有格式的文本，再点击格式刷')
        return
      }

      setPainterMarks(currentMarks)
      Message.success('已复制当前格式，请选中目标文本后再次点击格式刷应用')
      return
    }

    removableMarkKeys.forEach((key) => {
      try {
        editor.removeMark(key)
      } catch {}
    })

    Object.entries(painterMarks).forEach(([key, markValue]) => {
      try {
        editor.addMark(key, markValue)
      } catch {}
    })

    setPainterMarks(null)
    Message.success('格式刷已应用')
  }

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!file.type.startsWith('image/')) {
      Message.warning('请选择图片文件')
      return
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })

      if (!editor) {
        onChange(
          `${value || ''}<p><img src="${dataUrl}" alt="${file.name}" style="max-width: 100%;" /></p>`,
        )
        Message.success('图片已插入')
        return
      }

      editor.focus()
      ;(editor as unknown as { dangerouslyInsertHtml?: (html: string) => void }).dangerouslyInsertHtml?.(
        `<p><img src="${dataUrl}" alt="${file.name}" style="max-width: 100%;" /></p>`,
      )
      Message.success('图片已插入')
    } catch {
      Message.error('图片上传失败，请重试')
    }
  }

  return (
    <div className="next-rich-editor">
      <div className="next-rich-editor__toolbar-row">
        <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" />
        <Space>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          <Button size="small" onClick={() => fileInputRef.current?.click()}>
            上传图片
          </Button>
          <Button size="small" onClick={handleFormatBrush}>
            {painterMarks ? '应用格式刷' : '格式刷'}
          </Button>
          {painterMarks ? (
            <Button size="small" type="secondary" onClick={() => setPainterMarks(null)}>
              取消
            </Button>
          ) : null}
        </Space>
      </div>
      <Editor
        defaultConfig={editorConfig}
        value={value}
        mode="default"
        onCreated={setEditor}
        onChange={(instance) => onChange(instance.getHtml())}
      />
    </div>
  )
}
