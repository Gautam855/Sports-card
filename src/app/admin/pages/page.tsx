import type { Metadata } from 'next'
import { CustomPagesPanel } from '@/components/admin/CustomPagesPanel'

export const metadata: Metadata = { title: 'Page Management' }

export default function AdminPagesPage() {
    return <CustomPagesPanel />
}
