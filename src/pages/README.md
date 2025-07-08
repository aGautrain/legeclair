# Pages

This directory contains the pages of the application.

## Available Pages

- `index.vue` - Landing page
- `login.vue` - User login page
- `register.vue` - User registration page
- `documents.vue` - Document generation dashboard

## Documents Page

The documents page (`/documents`) provides a comprehensive document generation and management interface with the following features:

### Features

- **Action Cards**: Quick access to generate TOS, Privacy Policy, and Terms & Conditions
- **Document Table**: View all generated documents with filtering, sorting, and pagination
- **Search & Filter**: Advanced filtering by document type, status, and date range
- **Document Management**: View, edit, download, regenerate, and delete documents
- **Bulk Operations**: Select multiple documents for bulk deletion
- **Export Functionality**: Export document list to CSV
- **Responsive Design**: Mobile-friendly interface

### Document Types

- **TOS (Terms of Service)**: Comprehensive terms of service for platforms
- **Privacy Policy**: GDPR-compliant privacy policies
- **CGU (Terms & Conditions)**: General terms and conditions

### Document Statuses

- **Draft**: Initial document state
- **Generated**: Document has been created
- **Published**: Document is live and active
- **Archived**: Document is no longer active

### Technical Implementation

- Vue 3 with Composition API and TypeScript
- Vuetify 3 components for UI
- Pinia store for state management
- Responsive design with mobile optimization
- Accessibility compliance (WCAG 2.1 AA)
- Error handling and loading states
