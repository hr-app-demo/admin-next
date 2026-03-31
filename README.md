# Admin Web Next

新版 `admin` 重构起点项目，基于现有 `admin-web` 的依赖体系和 Vite 技术栈。

## 目标

- 围绕 `岗位 -> 招聘进展 -> 候选人 -> 流转` 重构后台
- 将 `招聘进展` 升级为一级核心工作台
- 后续按阶段逐步补充列内编辑、附件处理、批量操作和自动化

## 技术栈

- React 18
- Vite
- TypeScript
- Arco Design
- React Router

## 当前骨架

- 工作台
- 岗位管理
- 招聘进展
- 总人才库
- 邮件与模板
- 系统设置

## Vercel

- Root Directory: `admin-web-next`
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework Preset: `Vite`
- 已内置 `vercel.json`，并处理了 React Router 的 SPA rewrite

## 部署说明

在 Vercel 中创建一个新的 Project 时，指向当前仓库并设置：

- Root Directory: `admin-web-next`
- Build Command: `npm run build`
- Output Directory: `dist`

如果和其它前端项目共用一个 monorepo，这个项目可以独立部署，不影响 `admin-web` 或 `candidate-web`。

## 路由刷新

项目使用 React Router，已经通过 [vercel.json](/Users/ruanhaokang/workspace/hr/admin-web-next/vercel.json) 配置：

- 直接访问 `/jobs/job-1`
- 直接刷新 `/jobs/job-1/progress`
- 直接访问 `/candidates/1`

都不会出现 404。
# admin-next
