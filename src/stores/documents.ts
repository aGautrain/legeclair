import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Document, 
  DocumentType, 
  DocumentStatus, 
  DocumentFilters, 
  DocumentGenerationConfig,
  TableSort,
  PaginationConfig 
} from '@/types/document'

export const useDocumentsStore = defineStore('documents', () => {
  // State
  const documents = ref<Document[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<DocumentFilters>({})
  const sort = ref<TableSort>({ key: 'createdAt', order: 'desc' })
  const pagination = ref<PaginationConfig>({
    page: 1,
    itemsPerPage: 10,
    totalItems: 0
  })
  const selectedDocuments = ref<string[]>([])

  // Getters
  const filteredDocuments = computed(() => {
    let filtered = [...documents.value]

    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm)
      )
    }

    // Apply type filter
    if (filters.value.type) {
      filtered = filtered.filter(doc => doc.type === filters.value.type)
    }

    // Apply status filter
    if (filters.value.status) {
      filtered = filtered.filter(doc => doc.status === filters.value.status)
    }

    // Apply date filters
    if (filters.value.dateFrom) {
      filtered = filtered.filter(doc => doc.createdAt >= filters.value.dateFrom!)
    }
    if (filters.value.dateTo) {
      filtered = filtered.filter(doc => doc.createdAt <= filters.value.dateTo!)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sort.value.key as keyof Document]
      const bValue = b[sort.value.key as keyof Document]
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return sort.value.order === 'asc' ? -1 : 1
      if (bValue === undefined) return sort.value.order === 'asc' ? 1 : -1
      
      if (sort.value.order === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  })

  const paginatedDocuments = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.itemsPerPage
    const end = start + pagination.value.itemsPerPage
    return filteredDocuments.value.slice(start, end)
  })

  const documentStats = computed(() => {
    const stats = {
      total: documents.value.length,
      byType: { TOS: 0, PRIVACY_POLICY: 0, CGU: 0 },
      byStatus: { DRAFT: 0, GENERATED: 0, PUBLISHED: 0, ARCHIVED: 0 }
    }

    documents.value.forEach(doc => {
      stats.byType[doc.type]++
      stats.byStatus[doc.status]++
    })

    return stats
  })

  // Actions
  const fetchDocuments = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for demonstration
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Terms of Service - Legeclair',
          type: 'TOS',
          content: 'Generated TOS content...',
          status: 'PUBLISHED',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          version: 1,
          metadata: {
            companyName: 'Legeclair',
            domain: 'legeclair.com',
            jurisdiction: 'France'
          }
        },
        {
          id: '2',
          name: 'Privacy Policy - Legeclair',
          type: 'PRIVACY_POLICY',
          content: 'Generated Privacy Policy content...',
          status: 'GENERATED',
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-01-18'),
          version: 1,
          metadata: {
            companyName: 'Legeclair',
            domain: 'legeclair.com',
            jurisdiction: 'EU'
          }
        },
        {
          id: '3',
          name: 'Terms & Conditions - Legeclair',
          type: 'CGU',
          content: 'Generated CGU content...',
          status: 'DRAFT',
          createdAt: new Date('2024-01-22'),
          updatedAt: new Date('2024-01-22'),
          version: 1,
          metadata: {
            companyName: 'Legeclair',
            domain: 'legeclair.com',
            jurisdiction: 'France'
          }
        }
      ]

      documents.value = mockDocuments
      pagination.value.totalItems = documents.value.length
    } catch (err) {
      error.value = 'Failed to fetch documents'
      console.error('Error fetching documents:', err)
    } finally {
      loading.value = false
    }
  }

  const createDocument = async (config: DocumentGenerationConfig): Promise<Document> => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newDocument: Document = {
        id: Date.now().toString(),
        name: `${config.type} - ${config.companyName}`,
        type: config.type,
        content: `Generated ${config.type} content for ${config.companyName}...`,
        status: 'GENERATED',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        metadata: {
          companyName: config.companyName,
          domain: config.domain,
          jurisdiction: config.jurisdiction,
          customFields: config.customFields
        }
      }

      documents.value.unshift(newDocument)
      pagination.value.totalItems = documents.value.length

      return newDocument
    } catch (err) {
      error.value = 'Failed to create document'
      console.error('Error creating document:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDocument = async (id: string, updates: Partial<Document>): Promise<Document> => {
    loading.value = true
    error.value = null

    try {
      const index = documents.value.findIndex(doc => doc.id === id)
      if (index === -1) {
        throw new Error('Document not found')
      }

      const updatedDocument = {
        ...documents.value[index],
        ...updates,
        updatedAt: new Date(),
        version: documents.value[index].version + 1
      }

      documents.value[index] = updatedDocument
      return updatedDocument
    } catch (err) {
      error.value = 'Failed to update document'
      console.error('Error updating document:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDocument = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const index = documents.value.findIndex(doc => doc.id === id)
      if (index === -1) {
        throw new Error('Document not found')
      }

      documents.value.splice(index, 1)
      pagination.value.totalItems = documents.value.length
      
      // Remove from selected documents if present
      const selectedIndex = selectedDocuments.value.indexOf(id)
      if (selectedIndex > -1) {
        selectedDocuments.value.splice(selectedIndex, 1)
      }
    } catch (err) {
      error.value = 'Failed to delete document'
      console.error('Error deleting document:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const bulkDeleteDocuments = async (ids: string[]): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      documents.value = documents.value.filter(doc => !ids.includes(doc.id))
      pagination.value.totalItems = documents.value.length
      selectedDocuments.value = []
    } catch (err) {
      error.value = 'Failed to delete documents'
      console.error('Error bulk deleting documents:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: DocumentFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // Reset to first page when filtering
  }

  const setSort = (newSort: TableSort) => {
    sort.value = newSort
  }

  const setPagination = (newPagination: Partial<PaginationConfig>) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  const toggleDocumentSelection = (id: string) => {
    const index = selectedDocuments.value.indexOf(id)
    if (index > -1) {
      selectedDocuments.value.splice(index, 1)
    } else {
      selectedDocuments.value.push(id)
    }
  }

  const clearSelection = () => {
    selectedDocuments.value = []
  }

  const selectAll = () => {
    selectedDocuments.value = paginatedDocuments.value.map(doc => doc.id)
  }

  return {
    // State
    documents,
    loading,
    error,
    filters,
    sort,
    pagination,
    selectedDocuments,

    // Getters
    filteredDocuments,
    paginatedDocuments,
    documentStats,

    // Actions
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    bulkDeleteDocuments,
    setFilters,
    setSort,
    setPagination,
    toggleDocumentSelection,
    clearSelection,
    selectAll
  }
}) 