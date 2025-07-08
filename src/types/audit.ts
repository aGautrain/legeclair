import type { DocumentType } from './document'

export interface Audit {
  id: string
  name: string
  sourceType: 'WEB' | 'DOCUMENT'
  documentType: DocumentType
  sourceContent: string
  correctedContent: string
  status: AuditStatus
  createdAt: Date
  updatedAt: Date
  version: number
  metadata?: AuditMetadata
  corrections: Correction[]
}

export type AuditStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED' | 'ARCHIVED'

export interface AuditMetadata {
  sourceUrl?: string
  sourceName?: string
  reviewer?: string
  companyName?: string
  domain?: string
  jurisdiction?: string
  customFields?: Record<string, any>
}

export interface Correction {
  id: string
  originalText: string
  correctedText: string
  explanation: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category: 'GRAMMAR' | 'LEGAL' | 'COMPLIANCE' | 'CLARITY' | 'STRUCTURE' | 'OTHER'
  startPosition: number
  endPosition: number
  createdAt: Date
}

export interface AuditFilters {
  search?: string
  sourceType?: 'WEB' | 'DOCUMENT'
  documentType?: DocumentType
  status?: AuditStatus
  severity?: Correction['severity']
  category?: Correction['category']
  dateFrom?: Date
  dateTo?: Date
}

export interface AuditCreationConfig {
  sourceType: 'WEB' | 'DOCUMENT'
  documentType: DocumentType
  sourceContent: string
  sourceName: string
  sourceUrl?: string
  companyName?: string
  domain?: string
  jurisdiction?: string
  customFields?: Record<string, any>
}

export interface TableSort {
  key: string
  order: 'asc' | 'desc'
}

export interface PaginationConfig {
  page: number
  itemsPerPage: number
  totalItems: number
} 