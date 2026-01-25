import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Kenyan Shillings currency
 * @param amount The amount to format
 * @returns Formatted currency string (e.g., "KSH 1,500")
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "KSH 0"
  
  // Format as KSH with commas, no decimal places
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
  
  return `KSH ${formatted}`
}

/**
 * Format phone number for display
 * @param phone The phone number string
 * @returns Formatted phone number (e.g., "+254 712 345 678")
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remove any non-digit characters except plus
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Format Kenyan numbers: +254 XXX XXX XXX
  if (cleaned.startsWith('+254') && cleaned.length === 13) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)} ${cleaned.substring(10)}`
  }
  
  // Format local Kenyan numbers: 07XX XXX XXX
  if (cleaned.startsWith('07') && cleaned.length === 10) {
    return `+254 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`
  }
  
  return phone
}

/**
 * Get status color classes based on task status
 * @param status Task status string
 * @returns Tailwind CSS classes for the status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'assigned':
      return 'bg-yellow-100 text-yellow-800'
    case 'pending':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get status text for display
 * @param status Task status string
 * @returns Human-readable status text
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'completed': return 'Completed'
    case 'in_progress': return 'In Progress'
    case 'assigned': return 'Assigned'
    case 'pending': return 'Pending'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text || ''
  return text.substring(0, maxLength) + '...'
}

/**
 * Get category badge color
 * @param category Service category
 * @returns Tailwind CSS classes for the category badge
 */
export function getCategoryColor(category: string): string {
  switch (category?.toLowerCase()) {
    case 'e-citizen':
      return 'bg-blue-100 text-blue-800'
    case 'education':
      return 'bg-purple-100 text-purple-800'
    case 'employment':
      return 'bg-green-100 text-green-800'
    case 'lifestyle':
      return 'bg-pink-100 text-pink-800'
    case 'training':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Format date for display
 * @param dateString ISO date string or Date object
 * @returns Formatted date string (e.g., "15 Jan 2024")
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return ''
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  if (isNaN(date.getTime())) return ''
  
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

/**
 * Calculate agent earnings (30% commission)
 * @param price Service price
 * @returns Agent earnings
 */
export function calculateAgentEarnings(price: number): number {
  return Math.round(price * 0.30)
}

/**
 * Calculate manager earnings (10% of agent earnings)
 * @param agentEarnings Agent's earnings from a task
 * @returns Manager earnings
 */
export function calculateManagerEarnings(agentEarnings: number): number {
  return Math.round(agentEarnings * 0.10)
}