'use client'

import { useEffect, useRef } from 'react'

interface ViewTrackerProps {
    contentId: string
    contentType?: string
}

/** Fires a view event once when the component mounts */
export function ViewTracker({ contentId, contentType = 'news' }: ViewTrackerProps) {
    const tracked = useRef(false)

    useEffect(() => {
        if (tracked.current) return
        tracked.current = true

        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentId, contentType, eventType: 'view' }),
        }).catch(() => {})
    }, [contentId, contentType])

    return null
}

/** Track a click event (use imperatively) */
export function trackClick(contentId: string, contentType: string = 'news') {
    fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, contentType, eventType: 'click' }),
    }).catch(() => {})
}
