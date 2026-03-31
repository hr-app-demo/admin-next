import { jobProfiles, jobs, type JobListItem, type JobProfile } from '../data/mock'

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

let memoryJobs: JobListItem[] = cloneValue(jobs)
let memoryProfiles: Record<string, JobProfile> = cloneValue(jobProfiles)

export function getAllJobs() {
  return cloneValue(memoryJobs).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getJobProfileById(jobId: string) {
  const profile = memoryProfiles[jobId]
  return profile ? cloneValue(profile) : null
}

export function upsertJobProfile(profile: JobProfile, applicants = 0) {
  const listItem: JobListItem = {
    id: profile.id,
    title: profile.title,
    company: profile.company,
    country: profile.country,
    status: profile.status,
    applicants,
    createdAt: profile.createdAt,
    workMode: profile.workMode,
    owner: profile.owner,
    collaborators: profile.collaborators,
  }

  memoryJobs = memoryJobs.filter((job) => job.id !== profile.id)
  memoryJobs.push(listItem)
  memoryProfiles = {
    ...memoryProfiles,
    [profile.id]: cloneValue(profile),
  }
}
