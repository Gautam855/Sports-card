'use client'

import { useState } from 'react'
import { MerchandiseShowcase } from '@/components/merchandise/MerchandiseShowcase'
import { Zap, Trophy, ShoppingBag, ShieldCheck, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SPORTS = [
    { id: 'all', label: 'All Sports' },
    { id: 'football', label: 'Football' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'running', label: 'Running' },
]

const BRANDS = [
    { id: 'all', label: 'All Brands' },
    { id: 'Nike', label: 'Nike' },
    { id: 'Adidas', label: 'Adidas' },
    { id: 'Babolat', label: 'Babolat' },
    { id: 'Asics', label: 'Asics' },
    { id: 'Lacoste', label: 'Lacoste' },
]

const CATEGORIES = [
    { id: 'all', label: 'All Categories' },
    { id: 'jerseys', label: 'Jerseys' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'apparel', label: 'Apparel' },
]

export default function StorePage() {
    const [sport, setSport] = useState('all')
    const [brand, setBrand] = useState('all')
    const [category, setCategory] = useState('all')

    const isFiltered = sport !== 'all' || brand !== 'all' || category !== 'all'

    const resetFilters = () => {
        setSport('all')
        setBrand('all')
        setCategory('all')
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-muted/30 border-b border-border">
                <div className="container-wide py-12 md:py-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-brand-500 font-bold tracking-wider uppercase mb-4 text-sm">
                            <ShoppingBag className="w-5 h-5" /> Official Merchandise
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-display mb-4">
                            Gear Up Like A Pro
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Shop top-selling jerseys, signature athlete shoes, and high-performance equipment. 
                            Curated selections from the best brands in sports.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-full">
                                <ShieldCheck className="w-4 h-4 text-green-500" /> Authentic Gear
                            </div>
                            <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-full">
                                <Trophy className="w-4 h-4 text-amber-500" /> Premium Brands
                            </div>
                            <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-full">
                                <Zap className="w-4 h-4 text-brand-500" /> Fast Shipping via Partners
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="container-wide py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                            <div className="flex-shrink-0 flex items-center gap-2 mr-2 text-muted-foreground text-sm font-bold uppercase tracking-wider">
                                <Filter className="w-4 h-4" /> Filters:
                            </div>
                            
                            {/* Sport Filter */}
                            <select 
                                value={sport}
                                onChange={(e) => setSport(e.target.value)}
                                className="bg-muted/50 border border-border rounded-full px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            >
                                {SPORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>

                            {/* Brand Filter */}
                            <select 
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="bg-muted/50 border border-border rounded-full px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            >
                                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                            </select>

                            {/* Category Filter */}
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-muted/50 border border-border rounded-full px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            >
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>

                            {isFiltered && (
                                <button 
                                    onClick={resetFilters}
                                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 ml-2 px-3 py-2 rounded-full hover:bg-red-50 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" /> Clear All
                                </button>
                            )}
                        </div>

                        <div className="text-xs text-muted-foreground font-medium bg-muted px-3 py-1.5 rounded-full">
                            Showing results for <span className="text-foreground font-bold">{sport === 'all' ? 'All Sports' : sport}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-wide py-10 space-y-16">
                {!isFiltered ? (
                    <>
                        {/* Hero Section - Featured */}
                        <section>
                            <MerchandiseShowcase 
                                placement="store_hero" 
                                layout="carousel" 
                                limit={6} 
                                title="Featured Collections"
                                subtitle="Signature releases and trending items"
                            />
                        </section>

                        {/* Sport Sections */}
                        <section>
                            <MerchandiseShowcase 
                                sport="football"
                                placement="store_grid" 
                                layout="grid" 
                                limit={4} 
                                title="Football Essentials"
                                subtitle="Official Jerseys: Real Madrid, Barcelona & more"
                            />
                        </section>

                        <section>
                            <MerchandiseShowcase 
                                sport="basketball"
                                placement="store_grid" 
                                layout="grid" 
                                limit={4} 
                                title="Basketball Signature Shoes"
                                subtitle="Kobe Bryant, LeBron James, Anthony Edwards & more"
                            />
                        </section>

                        <section>
                            <MerchandiseShowcase 
                                sport="tennis"
                                placement="store_grid" 
                                layout="grid" 
                                limit={4} 
                                title="Tennis Rackets & Footwear"
                                subtitle="Carlos Alcaraz & Novak Djokovic approved gear"
                            />
                        </section>
                    </>
                ) : (
                    /* Filtered View */
                    <section>
                        <MerchandiseShowcase 
                            sport={sport}
                            brand={brand}
                            category={category}
                            placement="store_grid" 
                            layout="grid" 
                            limit={20} 
                            title="Product Results"
                            subtitle={`Filtered results for ${sport !== 'all' ? sport : ''} ${brand !== 'all' ? brand : ''} ${category !== 'all' ? category : ''}`}
                        />
                    </section>
                )}
            </div>
        </div>
    )
}
