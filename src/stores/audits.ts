import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Audit, 
  AuditStatus, 
  AuditFilters, 
  AuditCreationConfig,
  Correction,
  TableSort,
  PaginationConfig 
} from '@/types/audit'
import type { DocumentType } from '@/types/document'

export const useAuditsStore = defineStore('audits', () => {
  // State
  const audits = ref<Audit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<AuditFilters>({})
  const sort = ref<TableSort>({ key: 'createdAt', order: 'desc' })
  const pagination = ref<PaginationConfig>({
    page: 1,
    itemsPerPage: 10,
    totalItems: 0
  })
  const selectedAudits = ref<string[]>([])

  // Getters
  const filteredAudits = computed(() => {
    let filtered = [...audits.value]

    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(audit => 
        audit.name.toLowerCase().includes(searchTerm) ||
        audit.sourceContent.toLowerCase().includes(searchTerm) ||
        audit.correctedContent.toLowerCase().includes(searchTerm)
      )
    }

    // Apply source type filter
    if (filters.value.sourceType) {
      filtered = filtered.filter(audit => audit.sourceType === filters.value.sourceType)
    }

    // Apply status filter
    if (filters.value.status) {
      filtered = filtered.filter(audit => audit.status === filters.value.status)
    }

    // Apply severity filter
    if (filters.value.severity) {
      filtered = filtered.filter(audit => 
        audit.corrections.some(correction => correction.severity === filters.value.severity)
      )
    }

    // Apply category filter
    if (filters.value.category) {
      filtered = filtered.filter(audit => 
        audit.corrections.some(correction => correction.category === filters.value.category)
      )
    }

    // Apply date filters
    if (filters.value.dateFrom) {
      filtered = filtered.filter(audit => audit.createdAt >= filters.value.dateFrom!)
    }
    if (filters.value.dateTo) {
      filtered = filtered.filter(audit => audit.createdAt <= filters.value.dateTo!)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sort.value.key as keyof Audit]
      const bValue = b[sort.value.key as keyof Audit]
      
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

  const paginatedAudits = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.itemsPerPage
    const end = start + pagination.value.itemsPerPage
    return filteredAudits.value.slice(start, end)
  })

  const auditStats = computed(() => {
    const stats = {
      total: audits.value.length,
      bySourceType: { TOS: 0, PRIVACY_POLICY: 0, CGU: 0, WEB: 0, DOCUMENT: 0 },
      byStatus: { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, REVIEWED: 0, ARCHIVED: 0 },
      bySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
    }

    audits.value.forEach(audit => {
      stats.bySourceType[audit.sourceType]++
      stats.byStatus[audit.status]++
      
      audit.corrections.forEach(correction => {
        stats.bySeverity[correction.severity]++
      })
    })

    return stats
  })

  // Actions
  const fetchAudits = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for demonstration
      const mockAudits: Audit[] = [
        {
          id: '1',
          name: 'Terms of Service Review - Legeclair',
          sourceType: 'WEB',
          documentType: 'TOS',
          sourceContent: 'This Terms of Service agreement ("Agreement") is entered into between Legeclair ("Company") and the user ("User") of our services. By accessing or using our services, User agrees to be bound by these terms. The Company reserves the right to modify these terms at any time without notice. User is responsible for maintaining the confidentiality of their account information.',
          correctedContent: 'This Terms of Service agreement ("Agreement") is entered into between Legeclair ("Company") and the user ("User") of our services. By accessing or using our services, the User agrees to be bound by these terms. The Company reserves the right to modify these terms at any time with reasonable notice. The User is responsible for maintaining the confidentiality of their account information.',
          status: 'COMPLETED',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          version: 1,
          metadata: {
            sourceName: 'Legeclair TOS',
            companyName: 'Legeclair',
            domain: 'legeclair.com',
            jurisdiction: 'France',
            reviewer: 'Legal Team'
          },
          corrections: [
            {
              id: '1-1',
              originalText: 'User agrees',
              correctedText: 'the User agrees',
              explanation: 'Add definite article for better clarity and formal tone',
              severity: 'LOW',
              category: 'CLARITY',
              startPosition: 120,
              endPosition: 130,
              createdAt: new Date('2024-01-15')
            },
            {
              id: '1-2',
              originalText: 'without notice',
              correctedText: 'with reasonable notice',
              explanation: 'Legal requirement to provide reasonable notice for terms changes',
              severity: 'HIGH',
              category: 'LEGAL',
              startPosition: 180,
              endPosition: 195,
              createdAt: new Date('2024-01-15')
            },
            {
              id: '1-3',
              originalText: 'User is responsible',
              correctedText: 'The User is responsible',
              explanation: 'Add definite article for consistency and formal tone',
              severity: 'LOW',
              category: 'GRAMMAR',
              startPosition: 220,
              endPosition: 235,
              createdAt: new Date('2024-01-15')
            }
          ]
        },
        {
          id: '2',
          name: 'Privacy Policy Review - Legeclair',
          sourceType: 'DOCUMENT',
          documentType: 'PRIVACY_POLICY',
          sourceContent: 'We collect personal information including name, email, and usage data. This information is used to provide our services and may be shared with third parties. We store data for as long as necessary.',
          correctedContent: 'We collect personal information including name, email address, and usage data. This information is used to provide our services and may be shared with third-party service providers under strict data protection agreements. We store personal data only for as long as necessary to fulfill the purposes outlined in this policy.',
          status: 'IN_PROGRESS',
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-01-18'),
          version: 1,
          metadata: {
            sourceName: 'Legeclair Privacy Policy',
            companyName: 'Legeclair',
            domain: 'legeclair.com',
            jurisdiction: 'EU',
            reviewer: 'Privacy Officer'
          },
          corrections: [
            {
              id: '2-1',
              originalText: 'name, email, and usage data',
              correctedText: 'name, email address, and usage data',
              explanation: 'More specific terminology for better clarity',
              severity: 'MEDIUM',
              category: 'CLARITY',
              startPosition: 35,
              endPosition: 55,
              createdAt: new Date('2024-01-18')
            },
            {
              id: '2-2',
              originalText: 'may be shared with third parties',
              correctedText: 'may be shared with third-party service providers under strict data protection agreements',
              explanation: 'GDPR compliance requirement for data sharing transparency',
              severity: 'CRITICAL',
              category: 'COMPLIANCE',
              startPosition: 95,
              endPosition: 125,
              createdAt: new Date('2024-01-18')
            },
            {
              id: '2-3',
              originalText: 'We store data for as long as necessary',
              correctedText: 'We store personal data only for as long as necessary to fulfill the purposes outlined in this policy',
              explanation: 'GDPR requirement for specific data retention periods and purpose limitation',
              severity: 'CRITICAL',
              category: 'COMPLIANCE',
              startPosition: 130,
              endPosition: 165,
              createdAt: new Date('2024-01-18')
            }
          ]
        },
        {
          id: '3',
          name: 'Website Content Review - Legeclair',
          sourceType: 'WEB',
          documentType: 'TOS',
          sourceContent: 'Legeclair is a legal tech platform that helps businesses create compliant legal documents. Our AI-powered system generates customized legal documents in minutes. We serve clients worldwide and offer 24/7 support.',
          correctedContent: 'Legeclair is a legal technology platform that helps businesses create compliant legal documents. Our AI-powered system generates customized legal documents within minutes. We serve clients worldwide and offer comprehensive support during business hours.',
          status: 'PENDING',
          createdAt: new Date('2024-01-22'),
          updatedAt: new Date('2024-01-22'),
          version: 1,
          metadata: {
            sourceName: 'Legeclair Homepage',
            sourceUrl: 'https://legeclair.com',
            companyName: 'Legeclair',
            domain: 'legeclair.com',
            reviewer: 'Marketing Team'
          },
          corrections: [
            {
              id: '3-1',
              originalText: 'legal tech platform',
              correctedText: 'legal technology platform',
              explanation: 'Use full form for better clarity and professionalism',
              severity: 'LOW',
              category: 'CLARITY',
              startPosition: 15,
              endPosition: 30,
              createdAt: new Date('2024-01-22')
            },
            {
              id: '3-2',
              originalText: 'in minutes',
              correctedText: 'within minutes',
              explanation: 'More precise time indication',
              severity: 'LOW',
              category: 'CLARITY',
              startPosition: 95,
              endPosition: 105,
              createdAt: new Date('2024-01-22')
            },
            {
              id: '3-3',
              originalText: '24/7 support',
              correctedText: 'comprehensive support during business hours',
              explanation: 'More accurate representation of actual support availability',
              severity: 'MEDIUM',
              category: 'CLARITY',
              startPosition: 140,
              endPosition: 150,
              createdAt: new Date('2024-01-22')
            }
          ]
        }
      ]

      audits.value = mockAudits
      pagination.value.totalItems = audits.value.length
    } catch (err) {
      error.value = 'Failed to fetch audits'
      console.error('Error fetching audits:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAudit = async (id: string): Promise<Audit | null> => {
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Find audit in existing data or return null
      const audit = audits.value.find(a => a.id === id)
      return audit || null
    } catch (error) {
      console.error('Error fetching audit:', error)
      return null
    }
  }

  const createAudit = async (config: AuditCreationConfig): Promise<Audit> => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock corrections based on content analysis
      const mockCorrections: Correction[] = [
        {
          id: `${Date.now()}-1`,
          originalText: 'sample text',
          correctedText: 'corrected sample text',
          explanation: 'Example correction for demonstration',
          severity: 'MEDIUM',
          category: 'CLARITY',
          startPosition: 0,
          endPosition: 10,
          createdAt: new Date()
        }
      ]

      const newAudit: Audit = {
        id: Date.now().toString(),
        name: `Audit - ${config.sourceName}`,
        sourceType: config.sourceType,
        documentType: config.documentType,
        sourceContent: config.sourceContent,
        correctedContent: config.sourceContent, // Initially same as source
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        metadata: {
          sourceName: config.sourceName,
          sourceUrl: config.sourceUrl,
          companyName: config.companyName,
          domain: config.domain,
          jurisdiction: config.jurisdiction,
          customFields: config.customFields
        },
        corrections: mockCorrections
      }

      audits.value.unshift(newAudit)
      pagination.value.totalItems = audits.value.length

      return newAudit
    } catch (err) {
      error.value = 'Failed to create audit'
      console.error('Error creating audit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAudit = async (id: string, updates: Partial<Audit>): Promise<Audit> => {
    loading.value = true
    error.value = null

    try {
      const index = audits.value.findIndex(audit => audit.id === id)
      if (index === -1) {
        throw new Error('Audit not found')
      }

      const updatedAudit = {
        ...audits.value[index],
        ...updates,
        updatedAt: new Date(),
        version: audits.value[index].version + 1
      }

      audits.value[index] = updatedAudit
      return updatedAudit
    } catch (err) {
      error.value = 'Failed to update audit'
      console.error('Error updating audit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAudit = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const index = audits.value.findIndex(audit => audit.id === id)
      if (index === -1) {
        throw new Error('Audit not found')
      }

      audits.value.splice(index, 1)
      pagination.value.totalItems = audits.value.length
      
      // Remove from selected audits if present
      const selectedIndex = selectedAudits.value.indexOf(id)
      if (selectedIndex > -1) {
        selectedAudits.value.splice(selectedIndex, 1)
      }
    } catch (err) {
      error.value = 'Failed to delete audit'
      console.error('Error deleting audit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const bulkDeleteAudits = async (ids: string[]): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      audits.value = audits.value.filter(audit => !ids.includes(audit.id))
      pagination.value.totalItems = audits.value.length
      selectedAudits.value = []
    } catch (err) {
      error.value = 'Failed to delete audits'
      console.error('Error bulk deleting audits:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: AuditFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // Reset to first page when filtering
  }

  const setSort = (newSort: TableSort) => {
    sort.value = newSort
  }

  const setPagination = (newPagination: Partial<PaginationConfig>) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  const toggleAuditSelection = (id: string) => {
    const index = selectedAudits.value.indexOf(id)
    if (index > -1) {
      selectedAudits.value.splice(index, 1)
    } else {
      selectedAudits.value.push(id)
    }
  }

  const clearSelection = () => {
    selectedAudits.value = []
  }

  const selectAll = () => {
    selectedAudits.value = paginatedAudits.value.map(audit => audit.id)
  }

    return {
    // State
    audits,
    loading,
    error,
    filters,
    sort,
    pagination,
    selectedAudits,
    
    // Getters
    filteredAudits,
    paginatedAudits,
    auditStats,
    
    // Actions
    fetchAudits,
    fetchAudit,
    createAudit,
    updateAudit,
    deleteAudit,
    bulkDeleteAudits,
    setFilters,
    setSort,
    setPagination,
    toggleAuditSelection,
    clearSelection,
    selectAll
  }
}) 