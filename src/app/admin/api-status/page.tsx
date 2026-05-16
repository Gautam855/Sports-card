import type { Metadata } from 'next'
import { APIStatusPanel } from '@/components/admin/APIStatusPanel'

export const metadata: Metadata = { title: 'API Status Monitor' }

export default function APIStatusPage() {
    return (
        <div className="space-y-8">
            <APIStatusPanel />
        </div>
    )
}
