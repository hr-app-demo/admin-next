import { Button, Card, Space, Tree } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'
import { useMemo } from 'react'
import type { MailTemplateCategory, MailTemplateRecord } from '../types'

interface TemplateListCardProps {
  categories: MailTemplateCategory[]
  templates: MailTemplateRecord[]
  selectedTemplateId: string
  isCreating: boolean
  onSelectTemplate: (value: string) => void
  onOpenCategoryManager: () => void
  onCreateTemplate: () => void
}

export default function TemplateListCard({
  categories,
  templates,
  selectedTemplateId,
  isCreating,
  onSelectTemplate,
  onOpenCategoryManager,
  onCreateTemplate,
}: TemplateListCardProps) {
  const treeData = useMemo(
    () =>
      categories
        .filter((item) => item.parentId === null)
        .map((root) => ({
          key: root.id,
          title: root.name,
          selectable: false,
          children: categories
            .filter((item) => item.parentId === root.id)
            .map((child) => ({
              key: child.id,
              title: child.name,
              selectable: false,
              children: templates
                .filter((template) => template.categoryId === child.id)
                .map((template) => ({
                  key: `template:${template.id}`,
                  title: template.name,
                  isLeaf: true,
                })),
            })),
        })),
    [categories, templates],
  )

  const expandedKeys = useMemo(
    () => categories.map((item) => item.id),
    [categories],
  )

  return (
    <Card
      bordered={false}
      className="next-panel next-mail-template-list-card"
      title="邮件模板"
      extra={
        <div className="next-mail-template-extra">
          <Space>
            <Button size="small" onClick={onOpenCategoryManager}>
              管理目录
            </Button>
            <Button size="small" icon={<IconPlus />} onClick={onCreateTemplate}>
              新增模板
            </Button>
          </Space>
        </div>
      }
    >
      <div className="next-mail-template-list-card__body">
        <div className="next-settings-tree next-mail-template-tree">
          <Tree
            treeData={treeData}
            defaultExpandedKeys={expandedKeys}
            selectedKeys={isCreating ? [] : selectedTemplateId ? [`template:${selectedTemplateId}`] : []}
            onSelect={(keys) => {
              const key = String(keys[0] || '')
              if (!key) return
              if (key.startsWith('template:')) {
                onSelectTemplate(key.replace('template:', ''))
              }
            }}
          />
        </div>
        {!templates.length && !isCreating ? <div className="next-empty-state">当前目录下还没有模板。</div> : null}

        {isCreating ? <div className="next-settings-tree__draft">当前正在创建新模板，保存后会出现在目录树中。</div> : null}
      </div>
    </Card>
  )
}
