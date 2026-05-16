import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

export function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return n.toString()
}

export function calcReadTime(content: string): number {
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}

export function getSportColor(sport?: string): string {
    const map: Record<string, string> = {
        football: '#22c55e',
        cricket: '#f59e0b',
        basketball: '#f97316',
        tennis: '#84cc16',
        boxing: '#ef4444',
        formula1: '#dc2626',
        ufc: '#7c3aed',
        rugby: '#ea580c',
        motogp: '#f59e0b',
        olympics: '#3b82f6',
    }
    return map[sport ?? ''] ?? '#3b82f6'
}