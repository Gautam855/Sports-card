import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ShieldCheck, Scale, ExternalLink, HelpCircle, Mail } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Disclaimer — SportsLNV Sports News & Analytics',
    description: 'Read the official SportsLNV disclaimer regarding sports news, stats, odds, predictions, fair use, and third-party content.',
    alternates: { canonical: '/disclaimer' },
    openGraph: {
        title: 'Disclaimer — SportsLNV',
        description: 'Read the official SportsLNV disclaimer regarding sports news, stats, odds, predictions, fair use, and third-party content.',
        url: 'https://www.sportslnv.com/disclaimer',
        type: 'website',
    },
}

export default function DisclaimerPage() {
    return (
        <div className="container-wide py-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                        Legal Information
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                    Website Disclaimer
                </h1>
                <p className="text-sm text-slate-500">
                    Last updated: September 2026
                </p>
            </div>

            {/* Quick Notice Card */}
            <div className="mb-10 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                    <p className="font-bold mb-1">Important Notice for All Visitors</p>
                    <p className="text-amber-800">
                        SportsLNV is an independent digital sports media publication. All content, match data, statistics, odds, and commentary provided on this website are published in good faith for informational, entertainment, and editorial purposes only.
                    </p>
                </div>
            </div>

            <div className="space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
                {/* 1. General Information */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center border border-slate-200">1</span>
                        General Information &amp; Editorial Nature
                    </h2>
                    <p>
                        The information provided on SportsLNV (accessible at{' '}
                        <Link href="/" className="text-red-600 hover:underline font-medium">
                            sportslnv.com
                        </Link>
                        ) is for general news, informational, and entertainment purposes only. SportsLNV assumes no responsibility for errors or omissions in the contents of the Service.
                    </p>
                    <p>
                        In no event shall SportsLNV be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence, or other tort, arising out of or in connection with the use of the Service or the contents of the Service. SportsLNV reserves the right to make additions, deletions, or modifications to the contents on the Service at any time without prior notice.
                    </p>
                </section>

                {/* 2. Sports News, Scores & Statistics */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center border border-slate-200">2</span>
                        Real-Time Sports Data, Scores &amp; Rumors
                    </h2>
                    <p>
                        Sports reporting and live coverage are fast-paced and dynamic. While our editorial team makes every effort to verify information through credible sources before publication:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                        <li>Match schedules, rosters, injury reports, and player transfers are subject to rapid and unforeseen changes.</li>
                        <li>Live scores, clock times, rankings, and match statistics may experience brief delays due to third-party data providers or broadcast synchronization.</li>
                        <li>Rumors and speculation regarding trades, contracts, or club management are clearly labeled as opinions, reports, or rumors, and should be evaluated accordingly.</li>
                    </ul>
                </section>

                {/* 3. Betting, Fantasy Sports & Financial Disclaimer */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center border border-slate-200">3</span>
                        Sports Betting &amp; Gambling Disclaimer
                    </h2>
                    <p>
                        SportsLNV may occasionally feature content related to betting odds, point spreads, match predictions, and fantasy sports advice.
                    </p>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm space-y-2">
                        <p className="font-semibold text-slate-900">
                            No Financial or Gambling Advice:
                        </p>
                        <p>
                            None of the material published on SportsLNV constitutes financial advice, betting advice, or an endorsement of any wagering platform. Sports betting and real-money gaming carry significant financial risk. We do not guarantee winnings or accuracy in any predictions or algorithmic models.
                        </p>
                        <p className="text-xs text-slate-500">
                            You are solely responsible for adhering to local laws regarding gambling and sports wagering in your jurisdiction. If you or someone you know has a gambling problem, please seek assistance through certified support organizations such as the National Council on Problem Gambling or local hotlines.
                        </p>
                    </div>
                </section>

                {/* 4. Opinions & Columns */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center border border-slate-200">4</span>
                        Editorial Opinions &amp; User Comments
                    </h2>
                    <p>
                        Articles labeled as &quot;Analysis,&quot; &quot;Opinion,&quot; &quot;Column,&quot; or &quot;Editorial&quot; reflect the personal views and commentary of their respective authors. They do not necessarily reflect the official viewpoints or policies of SportsLNV, its editors, or corporate leadership.
                    </p>
                    <p>
                        Comments published by users on articles or in community sections are solely the responsibility of the individual commenter. SportsLNV reserves the right to moderate, hide, or delete comments that violate our community standards or contain defamation, abuse, or spam.
                    </p>
                </section>

                {/* 5. Fair Use & Trademarks */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center border border-slate-200">5</span>
                        Fair Use &amp; Trademark Notice
                    </h2>
                    <p>
                        All team names, club logos, league insignias, tournaments (including but not limited to the NFL, NBA, MLB, Premier League, UEFA, FIFA, ICC, and Formula 1), and athlete likenesses mentioned on this website are trademarks, registered trademarks, or intellectual property of their respective owners.
                    </p>
                    <p>
                        Their mention on SportsLNV is strictly for editorial commentary, educational reference, and descriptive news reporting purposes under the Fair Use doctrine. SportsLNV is an independent publication and is not officially affiliated with, endorsed by, or sponsored by any sports league, franchise, or federation unless explicitly stated.
                    </p>
                </section>

                {/* 6. External Links & Advertisements */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center border border-slate-200">6</span>
                        External Links &amp; Third-Party Advertisements
                    </h2>
                    <p>
                        The Service may contain links to external websites that are not operated, maintained, or monitored by SportsLNV. Please note that we cannot guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                    </p>
                    <p>
                        We may also display third-party advertisements or sponsored content. The presence of an advertisement on SportsLNV does not constitute an endorsement, recommendation, or warranty of the products or services offered by the advertiser.
                    </p>
                </section>

                {/* 7. Limitation of Liability */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center border border-slate-200">7</span>
                        Limitation of Liability
                    </h2>
                    <p>
                        Under no circumstances shall SportsLNV, its directors, employees, partners, agents, or suppliers be liable for any damages resulting from your use or inability to use the Service or any content provided herein. Your use of the Service is solely at your own risk.
                    </p>
                </section>

                {/* 8. Contact Information */}
                <section className="pt-6 border-t border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-red-600" />
                        Questions Regarding This Disclaimer
                    </h2>
                    <p className="mb-4">
                        If you have questions about this Disclaimer or would like to request clarification on any matter, please reach out to our team:
                    </p>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-slate-900">SportsLNV Editorial &amp; Legal Desk</p>
                            <p className="text-sm text-slate-600">Email: <a href="mailto:support@sportslnv.com" className="text-red-600 font-semibold hover:underline">support@sportslnv.com</a></p>
                        </div>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        >
                            Contact Us →
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}
