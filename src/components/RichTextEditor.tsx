import { Button, Message, Space, Tooltip } from '@arco-design/web-react'
import { IconBrush } from '@arco-design/web-react/icon'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { useEffect, useMemo, useState } from 'react'
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

  return (
    <div className="next-rich-editor">
      <div className="next-rich-editor__toolbar-row">
        <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" />
        <Space>
          <Tooltip content={painterMarks ? '应用格式刷' : '格式刷'}>
            <Button
              size="small"
              icon={<IconBrush />}
              onClick={handleFormatBrush}
            >
              {painterMarks ? '应用' : '格式刷'}
            </Button>
          </Tooltip>
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
