import { Button } from '@arco-design/web-react'
import { IconFile, IconPlus, IconSwap } from '@arco-design/web-react/icon'
import type { BatchEditMode } from './progressConfig'
import type { ProgressStage } from '../../data/mock'

interface ProgressStageActionsProps {
  activeStage: ProgressStage
  selectedCount: number
  onAddCandidates: () => void
  onBatchMail: () => void
  onOpenRateHighlight: () => void
  onOpenFlow: () => void
  onOpenOwner: () => void
  onExecuteAutomation: () => void
  onOpenBatchEdit: (mode: BatchEditMode) => void
  onQuickMove: (targetStage: Exclude<ProgressStage, 'all'>, note: string) => void
}

export default function ProgressStageActions({
  activeStage,
  selectedCount,
  onAddCandidates,
  onBatchMail,
  onOpenRateHighlight,
  onOpenFlow,
  onOpenOwner,
  onExecuteAutomation,
  onOpenBatchEdit,
  onQuickMove,
}: ProgressStageActionsProps) {
  if (activeStage === 'all') {
    return null
  }

  if (activeStage === 'screening') {
    return (
      <>
        <Button icon={<IconPlus />} onClick={onAddCandidates}>
          添加候选人
        </Button>
        <Button icon={<IconFile />} disabled={selectedCount === 0} onClick={onBatchMail}>
          批量发邮件
        </Button>
        <Button icon={<IconSwap />} disabled={selectedCount === 0} onClick={onOpenFlow}>
          批量流转阶段
        </Button>
      </>
    )
  }

  if (activeStage === 'assessment') {
    return (
      <>
        <Button icon={<IconFile />} disabled={selectedCount === 0} onClick={onBatchMail}>
          批量发邮件
        </Button>
        <Button icon={<IconPlus />} disabled={selectedCount === 0} onClick={onOpenOwner}>
          批量设置判题人
        </Button>
        <Button type="primary" disabled={selectedCount === 0} onClick={onExecuteAutomation}>
          执行自动化
        </Button>
      </>
    )
  }

  if (activeStage === 'passed') {
    return (
      <>
        <Button icon={<IconFile />} disabled={selectedCount === 0} onClick={onBatchMail}>
          批量发邮件
        </Button>
        <Button onClick={onOpenRateHighlight}>
          高亮时薪区间
        </Button>
        <Button disabled={selectedCount === 0} onClick={() => onOpenBatchEdit('signingStatus')}>
          批量更新签约进展
        </Button>
        <Button
          icon={<IconSwap />}
          disabled={selectedCount === 0}
          onClick={() => onQuickMove('assessment', '批量移回测试题回收，等待重新处理。')}
        >
          批量移回测试题回收
        </Button>
      </>
    )
  }

  if (activeStage === 'contract') {
    return (
      <>
        <Button icon={<IconFile />} disabled={selectedCount === 0} onClick={onBatchMail}>
          批量发邮件
        </Button>
        <Button disabled={selectedCount === 0} onClick={() => onOpenBatchEdit('contractReview')}>
          批量合同审核
        </Button>
        <Button
          type="primary"
          icon={<IconSwap />}
          disabled={selectedCount === 0}
          onClick={() => onQuickMove('employed', '批量标记成功签约并进入在职。')}
        >
          批量成功签约
        </Button>
      </>
    )
  }

  if (activeStage === 'employed') {
    return (
      <>
        <Button icon={<IconFile />} disabled={selectedCount === 0} onClick={onBatchMail}>
          批量发邮件
        </Button>
        <Button disabled={selectedCount === 0} onClick={() => onOpenBatchEdit('onboardingStatus')}>
          批量更新入职进展
        </Button>
      </>
    )
  }

  if (activeStage === 'replaced') {
    return (
      <>
        <Button icon={<IconFile />} disabled={selectedCount === 0} onClick={onBatchMail}>
          批量发邮件
        </Button>
        <Button disabled={selectedCount === 0} onClick={() => onOpenBatchEdit('onboardingStatus')}>
          批量更新入职进展
        </Button>
        <Button
          icon={<IconSwap />}
          disabled={selectedCount === 0}
          onClick={() => onQuickMove('screening', '批量恢复至待筛选名单。')}
        >
          批量恢复至待筛选
        </Button>
      </>
    )
  }

  if (activeStage === 'eliminated') {
    return (
      <>
        <Button icon={<IconFile />} disabled={selectedCount === 0} onClick={onBatchMail}>
          批量发邮件
        </Button>
        <Button disabled={selectedCount === 0} onClick={() => onOpenBatchEdit('signingStatus')}>
          批量更新签约进展
        </Button>
        <Button
          icon={<IconSwap />}
          disabled={selectedCount === 0}
          onClick={() => onQuickMove('assessment', '批量从淘汰移回测试题回收，重新评估。')}
        >
          批量移回测试题回收
        </Button>
      </>
    )
  }

  return (
    <Button icon={<IconSwap />} disabled={selectedCount === 0} onClick={onOpenFlow}>
      批量流转阶段
    </Button>
  )
}
