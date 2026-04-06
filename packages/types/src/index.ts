export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'done'
export type Priority = 'P0' | 'P1' | 'P2'
export type BriefType = 'team' | 'exec' | 'client'
export type RunStatus = 'success' | 'partial' | 'failed'
export type DeliveryStatus = 'delivered' | 'failed' | 'pending_review'
export type ClientUpdateStatus = 'draft' | 'approved' | 'sent'

export type Module = 'standup' | 'market' | 'campaign' | 'client_intel' | 'regulatory' | 'incident' | 'localization'
