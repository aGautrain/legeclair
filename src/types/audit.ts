import type { DocumentType } from "./document";

// Enums for better type safety
export enum SourceType {
  WEB = "WEB",
  DOCUMENT = "DOCUMENT",
}

export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum Category {
  GRAMMAR = "GRAMMAR",
  LEGAL = "LEGAL",
  COMPLIANCE = "COMPLIANCE",
  CLARITY = "CLARITY",
  STRUCTURE = "STRUCTURE",
  OTHER = "OTHER",
}

export interface Audit {
  id: string;
  name: string;
  sourceType: SourceType;
  documentType: DocumentType;
  sourceContent: string;
  correctedContent: string;
  status: AuditStatus;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  metadata?: AuditMetadata;
  corrections: Correction[];
  context?: string;
  notes?: string;
}

export type AuditStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REVIEWED"
  | "ARCHIVED";

export interface AuditMetadata {
  sourceUrl?: string;
  reviewer?: string;
  companyName?: string;
  domain?: string;
  jurisdiction?: string;
  customFields?: Record<string, any>;
}

export interface Correction {
  id: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  severity: Severity;
  category: Category;
  startPosition: number;
  endPosition: number;
  // Location information
  page?: number;
  lineStart?: number;
  lineEnd?: number;
  createdAt: Date;
}

export interface AuditFilters {
  search?: string;
  sourceType?: SourceType;
  documentType?: DocumentType;
  status?: AuditStatus;
  severity?: Severity;
  category?: Category;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AuditCreationConfig {
  sourceType: SourceType;
  documentType: DocumentType;
  sourceContent?: string;
  sourceUrl?: string;
  file?: File;
  companyName?: string;
  domain?: string;
  jurisdiction?: string;
  customFields?: Record<string, any>;
}

export interface TableSort {
  key: string;
  order: "asc" | "desc";
}

export interface PaginationConfig {
  page: number;
  itemsPerPage: number;
  totalItems: number;
}
