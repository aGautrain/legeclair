export interface Document {
  id: string
  name: string
  type: DocumentType
  content: string
  status: DocumentStatus
  createdAt: Date
  updatedAt: Date
  version: number
  metadata?: DocumentMetadata
}

export type DocumentType = 'TOS' | 'PRIVACY_POLICY' | 'CGU'

export type DocumentStatus = 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'ARCHIVED'

export interface DocumentMetadata {
  companyName?: string
  domain?: string
  jurisdiction?: string
  customFields?: Record<string, any>
}

export interface DocumentFilters {
  search?: string
  type?: DocumentType
  status?: DocumentStatus
  dateFrom?: Date
  dateTo?: Date
}

export interface DocumentGenerationConfig {
  type: DocumentType
  companyName: string
  domain: string
  jurisdiction: string
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