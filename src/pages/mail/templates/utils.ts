import type { MailTemplateCategory, MailTemplateRecord } from './types'

export function cloneTemplate(template: MailTemplateRecord): MailTemplateRecord {
  return {
    ...template,
    attachments: template.attachments.map((item) => ({ ...item })),
    variables: [...template.variables],
  }
}

export function createEmptyTemplate(index: number, categoryId: string): MailTemplateRecord {
  return {
    id: `mail-template-${index + 1}`,
    name: '',
    categoryId,
    subject: '',
    content: '<p><br></p>',
    attachments: [],
    variables: [],
  }
}

export function getCategoryLabel(categories: MailTemplateCategory[], categoryId: string) {
  const category = categories.find((item) => item.id === categoryId)
  if (!category) return '未分类'
  if (!category.parentId) return category.name
  const parent = categories.find((item) => item.id === category.parentId)
  return parent ? `${parent.name} / ${category.name}` : category.name
}

export function getLeafCategories(categories: MailTemplateCategory[]) {
  return categories.filter((item) => item.parentId !== null)
}
