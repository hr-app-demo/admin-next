import { Button, Input, Message, Modal, Popconfirm, Tree } from '@arco-design/web-react'
import { IconDelete, IconEdit, IconPlus } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../../apis/http'
import type { MailTemplateCategory, MailTemplateRecord } from '../types'

interface TemplateCategoryManagerModalProps {
  visible: boolean
  categories: MailTemplateCategory[]
  templates: MailTemplateRecord[]
  currentCategoryId: string
  onCreateRoot: (name: string) => Promise<void>
  onCreateChild: (parentId: string, name: string) => Promise<void>
  onRename: (categoryId: string, name: string) => Promise<void>
  onDelete: (categoryId: string) => Promise<void>
  onClose: () => void
}

export default function TemplateCategoryManagerModal({
  visible,
  categories,
  templates,
  currentCategoryId,
  onCreateRoot,
  onCreateChild,
  onRename,
  onDelete,
  onClose,
}: TemplateCategoryManagerModalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(currentCategoryId)
  const [mode, setMode] = useState<'idle' | 'create-root' | 'create-child' | 'rename'>('idle')
  const [draftName, setDraftName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const editingCategory = useMemo(
    () => categories.find((item) => item.id === activeCategoryId) || null,
    [activeCategoryId, categories],
  )

  const templateCountByCategory = useMemo(
    () =>
      templates.reduce<Record<string, number>>((acc, item) => {
        acc[item.categoryId] = (acc[item.categoryId] || 0) + 1
        return acc
      }, {}),
    [templates],
  )

  const treeData = useMemo(
    () =>
      categories
        .filter((item) => item.parentId === null)
        .map((root) => ({
          key: root.id,
          title: (
            <div className="next-mail-category-node">
              <span>{root.name}</span>
              <div className="next-mail-category-node__actions">
                <Button
                  size="mini"
                  type="text"
                  icon={<IconPlus />}
                  onClick={(event) => {
                    event.stopPropagation()
                    setActiveCategoryId(root.id)
                    setMode('create-child')
                    setDraftName('')
                  }}
                />
                <Button
                  size="mini"
                  type="text"
                  icon={<IconEdit />}
                  onClick={(event) => {
                    event.stopPropagation()
                    setActiveCategoryId(root.id)
                    setMode('rename')
                    setDraftName(root.name)
                  }}
                />
                <Popconfirm
                  title="确认删除当前目录吗？"
                  onOk={async (event) => {
                    event?.stopPropagation()
                    await handleDelete(root.id)
                  }}
                >
                  <Button
                    size="mini"
                    type="text"
                    status="danger"
                    icon={<IconDelete />}
                    onClick={(event) => event.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            </div>
          ),
          children: categories
            .filter((item) => item.parentId === root.id)
            .map((child) => ({
              key: child.id,
              title: (
                <div className="next-mail-category-node">
                  <span>
                    {child.name}
                    {templateCountByCategory[child.id] ? ` (${templateCountByCategory[child.id]})` : ''}
                  </span>
                  <div className="next-mail-category-node__actions">
                    <Button
                      size="mini"
                      type="text"
                      icon={<IconEdit />}
                      onClick={(event) => {
                        event.stopPropagation()
                        setActiveCategoryId(child.id)
                        setMode('rename')
                        setDraftName(child.name)
                      }}
                    />
                    <Popconfirm
                      title="确认删除当前目录吗？"
                      onOk={async (event) => {
                        event?.stopPropagation()
                        await handleDelete(child.id)
                      }}
                    >
                      <Button
                        size="mini"
                        type="text"
                        status="danger"
                        icon={<IconDelete />}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </Popconfirm>
                  </div>
                </div>
              ),
              isLeaf: true,
            })),
        })),
    [categories, templateCountByCategory],
  )

  const expandedKeys = useMemo(() => categories.filter((item) => item.parentId === null).map((item) => item.id), [categories])

  useEffect(() => {
    if (!visible) return
    setActiveCategoryId(currentCategoryId)
    setMode('idle')
    setDraftName('')
  }, [currentCategoryId, visible])

  useEffect(() => {
    if (mode === 'rename') {
      setDraftName(editingCategory?.name || '')
    }
  }, [editingCategory, mode])

  const openMode = (nextMode: 'create-root' | 'create-child' | 'rename', categoryId?: string) => {
    if (categoryId) {
      setActiveCategoryId(categoryId)
    }
    setMode(nextMode)
    if (nextMode === 'rename') {
      const current = categories.find((item) => item.id === (categoryId || activeCategoryId))
      setDraftName(current?.name || '')
      return
    }
    setDraftName('')
  }

  const handleSubmit = async () => {
    const nextName = draftName.trim()
    if (!nextName) {
      Message.warning('请先填写目录名称')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'create-root') {
        await onCreateRoot(nextName)
        Message.success('一级目录已创建')
      } else if (mode === 'create-child' && editingCategory) {
        if (editingCategory.parentId !== null) {
          Message.warning('只能在一级目录下新增二级目录')
          return
        }
        await onCreateChild(editingCategory.id, nextName)
        Message.success('二级目录已创建')
      } else if (mode === 'rename' && editingCategory) {
        await onRename(editingCategory.id, nextName)
        Message.success('目录已重命名')
      }
      setMode('idle')
      setDraftName('')
    } catch (error) {
      Message.error(getApiErrorMessage(error, '目录操作失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    try {
      await onDelete(categoryId)
      Message.success('目录已删除')
      setMode('idle')
      setDraftName('')
    } catch (error) {
      Message.error(getApiErrorMessage(error, '删除目录失败'))
    }
  }

  return (
    <Modal
      title="管理目录"
      visible={visible}
      onCancel={onClose}
      footer={null}
      className="next-mail-category-modal"
    >
      <div className="next-mail-category-modal__body">
        <div className="next-mail-category-modal__toolbar">
          <Button size="small" onClick={() => openMode('create-root')}>
            新增一级目录
          </Button>
        </div>

        <Tree
          treeData={treeData}
          defaultExpandedKeys={expandedKeys}
          selectedKeys={activeCategoryId ? [activeCategoryId] : []}
          onSelect={(keys) => {
            const key = String(keys[0] || '')
            if (key) setActiveCategoryId(key)
          }}
        />

        <div className="next-mail-category-modal__editor">
          <div className="next-job-create__field">
            <label>
              {mode === 'idle'
                ? '操作说明'
                : mode === 'create-root'
                  ? '一级目录名称'
                  : mode === 'create-child'
                    ? '二级目录名称'
                    : '目录名称'}
            </label>
            {mode === 'idle' ? (
              <div className="next-mail-category-modal__hint">
                在目录节点右侧直接新增子目录、重命名或删除；顶部按钮用于新增一级目录。
              </div>
            ) : (
              <Input value={draftName} onChange={setDraftName} placeholder="输入目录名称" />
            )}
          </div>
          <div className="next-mail-category-modal__footer">
            <Button onClick={onClose}>关闭</Button>
            {mode !== 'idle' ? (
              <Button type="primary" loading={submitting} onClick={handleSubmit}>
                保存目录
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  )
}
