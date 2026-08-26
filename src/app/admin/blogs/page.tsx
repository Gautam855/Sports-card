import type { Metadata } from 'next'
import { AdminBlogsPanel } from '@/components/admin/AdminBlogsPanel'

export const metadata: Metadata = { title: 'Blog Management' }

export default function AdminBlogsPage() {
    return <AdminBlogsPanel />
}
