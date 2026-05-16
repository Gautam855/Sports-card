'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, ChevronLeft, ChevronRight, ShoppingCart, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MerchItem {
    id: string
    name: string
    description: string
    sport: string
    category: string
    brand: string
    athlete: string
    image_url: string
    price: number
    currency: string
    featured: boolean
    affiliate_url: string
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
)

interface MerchandiseShowcaseProps {
    placement: string
    sport?: string
    title?: string
    subtitle?: string
    className?: string
    limit?: number
    layout?: 'grid' | 'carousel' | 'sidebar'
    brand?: string
    category?: string
}

export function MerchandiseShowcase({ 
    placement, 
    sport, 
    title = "Official Merchandise", 
    subtitle = "Gear up like your favorite athletes",
    className,
    limit = 4,
    layout = 'grid',
    brand,
    category
}: MerchandiseShowcaseProps) {
    const [items, setItems] = useState<MerchItem[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    const CONTACT_PHONE = "+91 98765 43210"
    const WA_NUMBER = "919876543210"

    const getWaLink = (itemName: string) => `https://wa.me/${WA_NUMBER}?text=Hi!%20I%20am%20interested%20in%20buying:%20${encodeURIComponent(itemName)}`

    useEffect(() => {
        let url = `/api/merchandise?active=true&placement=${placement}&limit=${limit}`
        if (sport && sport !== 'all') url += `&sport=${sport}`
        if (brand && brand !== 'all') url += `&brand=${brand}`
        if (category && category !== 'all') url += `&category=${category}`

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setItems(data.items || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [placement, sport, limit])

    if (loading) {
        return (
            <div className={cn("w-full py-12 flex flex-col items-center justify-center", className)}>
                <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
        )
    }

    if (items.length === 0) return null // Hide silently if no merchandise configured for this spot

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    }

    if (layout === 'sidebar') {
        return (
            <div className={cn("bg-card/50 border border-border rounded-2xl overflow-hidden", className)}>
                <div className="p-4 border-b border-border/50 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-brand-500" />
                    <h3 className="font-bold">{title}</h3>
                </div>
                <div className="p-4 space-y-4">
                    {items.map(item => (
                        <a 
                            key={item.id} 
                            href={getWaLink(item.name)}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 group bg-background border border-border p-3 rounded-xl hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5 transition-all"
                        >
                            <div className="w-16 h-16 rounded-xl bg-white border border-border overflow-hidden flex-shrink-0 p-2">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <Tag className="w-full h-full text-muted-foreground/30 p-2" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-brand-500 font-bold mb-0.5 capitalize">{item.brand}</div>
                                <h4 className="font-semibold text-sm leading-tight truncate group-hover:text-brand-500 transition-colors">{item.name}</h4>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <span className="font-bold text-foreground">{item.currency} {item.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black font-display flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-brand-500" />
                        {title}
                    </h2>
                    {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>}
                </div>
                
                {layout === 'carousel' && items.length > 1 && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={prevSlide}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={nextSlide}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {layout === 'carousel' ? (
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-8"
                        >
                            <div className="w-full md:w-1/2 aspect-square max-h-[400px] bg-white rounded-2xl flex items-center justify-center p-8 border border-border/50">
                                {items[currentIndex].image_url ? (
                                    <img 
                                        src={items[currentIndex].image_url} 
                                        alt={items[currentIndex].name} 
                                        className="w-full h-full object-contain drop-shadow-xl" 
                                    />
                                ) : (
                                    <Tag className="w-32 h-32 text-muted-foreground/20" />
                                )}
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-brand-500/10 text-brand-600">{items[currentIndex].brand}</Badge>
                                    <Badge variant="outline" className="capitalize">{items[currentIndex].sport}</Badge>
                                    {items[currentIndex].athlete && (
                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">★ {items[currentIndex].athlete}</Badge>
                                    )}
                                </div>
                                <h3 className="text-3xl font-black">{items[currentIndex].name}</h3>
                                <p className="text-muted-foreground">{items[currentIndex].description}</p>
                                
                                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                        <span className="text-xl text-muted-foreground">{items[currentIndex].currency}</span> {items[currentIndex].price.toFixed(2)}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button asChild size="lg" className="rounded-full shadow-lg shadow-green-500/25 bg-green-500 hover:bg-green-600 text-white font-bold border-none transition-all hover:scale-105">
                                            <a href={getWaLink(items[currentIndex].name)} target="_blank" rel="noopener noreferrer">
                                                <WhatsAppIcon className="w-5 h-5 mr-2" /> Enquire Now
                                            </a>
                                        </Button>
                                        <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                                            <Phone className="w-4 h-4 text-brand-500" /> {CONTACT_PHONE}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map(item => (
                        <a 
                            key={item.id} 
                            href={getWaLink(item.name)}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex flex-col bg-card border border-border rounded-3xl overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1"
                        >
                            <div className="aspect-square bg-white relative p-6 flex items-center justify-center border-b border-border/50">
                                {item.featured && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <Badge className="bg-brand-500 text-white border-none shadow-sm">Hot</Badge>
                                    </div>
                                )}
                                {item.image_url ? (
                                    <img 
                                        src={item.image_url} 
                                        alt={item.name} 
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" 
                                    />
                                ) : (
                                    <Tag className="w-16 h-16 text-muted-foreground/20" />
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-xs font-bold text-brand-500 mb-2">{item.brand}</div>
                                <h3 className="font-bold text-foreground group-hover:text-brand-500 transition-colors line-clamp-2 mb-1">{item.name}</h3>
                                {item.athlete && (
                                    <p className="text-xs text-muted-foreground mb-4">x {item.athlete}</p>
                                )}
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <div className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                                        {item.currency} {item.price.toFixed(2)}
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full group-hover:bg-green-500 transition-colors">
                                        <span className="text-[10px] font-bold text-green-600 group-hover:text-white uppercase tracking-wider hidden sm:block">Enquire</span>
                                        <WhatsAppIcon className="w-4 h-4 text-green-600 group-hover:text-white" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}
