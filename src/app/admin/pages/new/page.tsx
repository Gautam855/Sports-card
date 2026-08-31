import type { Metadata } from 'next'
import { PageEditorClient } from '@/components/admin/PageEditorClient'

export const metadata: Metadata = { title: 'Create New Page' }

export default function AdminNewPagePage() {
    return <PageEditorClient />
}
