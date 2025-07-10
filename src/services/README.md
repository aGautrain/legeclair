# API Services

This directory contains the modular API services for the Legeclair frontend application.

## Structure

```
services/
├── config.ts          # Axios configuration and interceptors
├── types.ts           # Common TypeScript interfaces
├── auth.ts            # Authentication API endpoints
├── documents.ts       # Documents API endpoints
├── audits.ts          # Audits API endpoints
├── health.ts          # Health check API endpoints
├── index.ts           # Main export file
├── api.ts             # Backward compatibility re-exports
└── README.md          # This file
```

## Usage

### Import from main services index (recommended)

```typescript
import { authAPI, documentsAPI, auditsAPI, healthAPI } from "@/services";
```

### Import specific services

```typescript
import { authAPI } from "@/services/auth";
import { documentsAPI } from "@/services/documents";
import { auditsAPI } from "@/services/audits";
import { healthAPI } from "@/services/health";
```

### Import types

```typescript
import type { ApiResponse, PaginatedResponse } from "@/services/types";
```

### Import axios instance

```typescript
import api from "@/services/config";
```

## API Services

### Auth API (`auth.ts`)

- `register()` - User registration
- `login()` - User authentication
- `getProfile()` - Get user profile
- `updateProfile()` - Update user profile

### Documents API (`documents.ts`)

- `getDocuments()` - Get paginated documents with filters
- `getDocument()` - Get single document by ID
- `createDocument()` - Create new document
- `updateDocument()` - Update existing document
- `deleteDocument()` - Delete document
- `bulkDeleteDocuments()` - Delete multiple documents
- `getDocumentStats()` - Get document statistics

### Audits API (`audits.ts`)

- `getAudits()` - Get paginated audits with filters
- `getAudit()` - Get single audit by ID
- `createAudit()` - Create new audit (supports file upload)
- `updateAudit()` - Update existing audit
- `deleteAudit()` - Delete audit
- `bulkDeleteAudits()` - Delete multiple audits
- `createNewVersion()` - Create new audit version
- `getAuditStats()` - Get audit statistics

### Health API (`health.ts`)

- `check()` - Health check endpoint

## Configuration

The `config.ts` file handles:

- Axios instance configuration
- Base URL setup
- Request interceptors (authentication tokens)
- Response interceptors (error handling, 401 redirects)

## Types

Common TypeScript interfaces:

- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated data response

## Backward Compatibility

The original `api.ts` file now re-exports everything from the new modular structure, ensuring existing imports continue to work without changes.
