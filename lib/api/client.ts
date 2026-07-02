/**
 * Centralised React Query key factory.
 * Keeps cache keys consistent across hooks and manual invalidations.
 */

export const queryKeys = {
  // Auth
  me: ['auth', 'me'] as const,

  // Jobs
  jobs: (params?: unknown) => ['jobs', 'list', params] as const,
  job:  (id: string)       => ['jobs', 'detail', id]   as const,
  myApplications:           ['jobs', 'my-applications'] as const,
  adminJobs:                ['jobs', 'admin', 'list']   as const,
  adminApps: (params?: unknown) => ['jobs', 'admin', 'applications', params] as const,

  // Matrimony
  myMatrimonyProfile: ['matrimony', 'my-profile']           as const,
  myMatches:          ['matrimony', 'my-matches']            as const,
  matrimonyProfiles: (params?: unknown) => ['matrimony', 'admin', 'profiles', params] as const,

  // Campaigns
  campaigns: (params?: unknown) => ['campaigns', 'list', params] as const,
  campaign:  (slug: string)     => ['campaigns', 'detail', slug] as const,

  // Donations
  campaigns_donations: (params?: unknown) => ['donations', 'campaigns', params] as const,
  transparency: ['donations', 'transparency'] as const,
  myDonations:  ['donations', 'my-donations'] as const,

  // Volunteers
  myVolunteer: ['volunteers', 'my-profile'] as const,
  myTasks:     ['volunteers', 'my-tasks']   as const,

  // Counselors
  counselorSessions: (params?: unknown) => ['counselors', 'sessions', params]  as const,
  counselorProfiles: (params?: unknown) => ['counselors', 'profiles', params]  as const,

  // Emotional evaluation
  evalQuestions:  ['emotional', 'questions']    as const,
  myEvalResponse: ['emotional', 'my-response']  as const,

  // Family
  familyMembers: ['family', 'members'] as const,

  // Admin
  adminStats: ['admin', 'stats']                          as const,
  adminUsers: (params?: unknown) => ['admin', 'users', params] as const,
  adminLogs:  (params?: unknown) => ['admin', 'logs', params]  as const,
}
