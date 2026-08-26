'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Bell, 
    Trophy, 
    Zap, 
    ShoppingBag, 
    Calendar,
    Check,
    MoreHorizontal,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    type: 'system' | 'order' | 'news'
    read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = []

export function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

    const unreadCount = notifications.filter(n => !n.read).length

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const removeNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id))
    }

    return (
        <div className="relative">
            <Button 
                variant="ghost" 
                size="icon" 
                className="relative" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-background">
                        {unreadCount}
                    </span>
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay to close on click outside */}
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsOpen(false)}
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-[380px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                                <div>
                                    <h3 className="font-bold">Notifications</h3>
                                    <p className="text-xs text-muted-foreground">You have {unreadCount} unread messages</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={markAllRead}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {notifications.map((n) => (
                                            <div 
                                                key={n.id}
                                                className={cn(
                                                    "p-4 flex gap-4 hover:bg-muted/30 transition-colors relative group",
                                                    !n.read && "bg-primary/5"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                                    n.type === 'news' && "bg-blue-500/10 text-blue-500",
                                                    n.type === 'order' && "bg-orange-500/10 text-orange-500",
                                                    n.type === 'system' && "bg-purple-500/10 text-purple-500",
                                                )}>
                                                    {n.type === 'news' && <Trophy className="w-5 h-5" />}
                                                    {n.type === 'order' && <ShoppingBag className="w-5 h-5" />}
                                                    {n.type === 'system' && <Zap className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4 className="text-sm font-bold truncate">{n.title}</h4>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                        {n.message}
                                                    </p>
                                                </div>
                                                <button 
                                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removeNotification(n.id)
                                                    }}
                                                >
                                                    <X className="w-3 h-3 text-muted-foreground" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No new notifications</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-border bg-muted/30 text-center">
                                <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary">
                                    View All Notifications
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
