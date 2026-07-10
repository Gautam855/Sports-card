import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Read the terms and conditions governing the use of SportsLNV.',
    alternates: { canonical: '/terms' },
}

export default function TermsOfServicePage() {
    return (
        <div className="container-wide py-12 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-10">
                Last updated: July 10, 2026
            </p>

            <div className="prose prose-invert prose-sm max-w-none space-y-8">
                {/* Agreement */}
                <section>
                    <h2 className="text-xl font-bold mb-3">1. Agreement to Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        By accessing or using the SportsLNV website at sportslnv.com (the &quot;Service&quot;), you agree
                        to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms,
                        do not use our Service. We reserve the right to modify these Terms at any time, and such
                        modifications shall be effective immediately upon posting. Your continued use of the
                        Service constitutes acceptance of the modified Terms.
                    </p>
                </section>

                {/* Eligibility */}
                <section>
                    <h2 className="text-xl font-bold mb-3">2. Eligibility</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        You must be at least 13 years of age to use this Service. By using this Service, you
                        represent and warrant that you meet this age requirement. If you are under 18, you
                        represent that you have your parent&apos;s or legal guardian&apos;s permission to use the Service
                        and that they have agreed to these Terms on your behalf.
                    </p>
                </section>

                {/* User Accounts */}
                <section>
                    <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        When you create an account with us, you must provide accurate, complete, and current
                        information. You are responsible for safeguarding the password that you use to access
                        the Service and for any activities or actions under your password. You agree to:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li>Maintain the security of your account credentials</li>
                        <li>Notify us immediately of any unauthorized access or use of your account</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                        We reserve the right to suspend or terminate your account at our sole discretion, without
                        notice, for conduct that we determine violates these Terms or is harmful to other users,
                        us, or third parties, or for any other reason.
                    </p>
                </section>

                {/* Acceptable Use */}
                <section>
                    <h2 className="text-xl font-bold mb-3">4. Acceptable Use</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        You agree not to use the Service to:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li>Violate any applicable laws, regulations, or these Terms</li>
                        <li>Infringe upon the intellectual property rights of others</li>
                        <li>Transmit any harmful, offensive, or objectionable content</li>
                        <li>Harass, abuse, or threaten other users</li>
                        <li>Attempt to gain unauthorized access to our systems or networks</li>
                        <li>Use automated scripts or bots to scrape, crawl, or collect data</li>
                        <li>Interfere with or disrupt the integrity or performance of the Service</li>
                        <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                        <li>Distribute spam, unsolicited communications, or chain messages</li>
                    </ul>
                </section>

                {/* Intellectual Property */}
                <section>
                    <h2 className="text-xl font-bold mb-3">5. Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Service and its original content, features, and functionality are owned by SportsLNV
                        and are protected by copyright, trademark, and other intellectual property laws. Our
                        trademarks and trade dress may not be used in connection with any product or service
                        without our prior written consent.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                        Sports data, scores, statistics, and related content displayed on our Service may be
                        sourced from third-party providers and are subject to their respective terms and
                        intellectual property rights.
                    </p>
                </section>

                {/* User Content */}
                <section>
                    <h2 className="text-xl font-bold mb-3">6. User-Generated Content</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        By posting comments, opinions, or other content on the Service, you grant us a
                        non-exclusive, worldwide, royalty-free, perpetual, and irrevocable license to use,
                        reproduce, modify, publish, and distribute such content in connection with the Service.
                        You represent and warrant that you own or have the necessary rights to submit such content
                        and that it does not violate these Terms or any applicable law.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                        We reserve the right to remove any user-generated content at our discretion, without
                        notice, for any reason including content that we believe violates these Terms.
                    </p>
                </section>

                {/* Disclaimer */}
                <section>
                    <h2 className="text-xl font-bold mb-3">7. Disclaimer of Warranties</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranties of
                        any kind, either express or implied. We do not warrant that the Service will be
                        uninterrupted, timely, secure, or error-free. We make no warranties regarding the
                        accuracy, reliability, or completeness of any content on the Service.
                    </p>
                    <div className="mt-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-200/90 font-medium">
                            ⚠️ Sports predictions, fantasy tips, and match analyses provided on this Service are
                            for informational and entertainment purposes only. They do not constitute professional
                            advice. Always exercise your own judgment and discretion.
                        </p>
                    </div>
                </section>

                {/* Limitation of Liability */}
                <section>
                    <h2 className="text-xl font-bold mb-3">8. Limitation of Liability</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        To the fullest extent permitted by applicable law, in no event shall SportsLNV, its
                        directors, employees, partners, agents, suppliers, or affiliates be liable for any
                        indirect, incidental, special, consequential, or punitive damages, including without
                        limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li>Your access to or use of (or inability to access or use) the Service</li>
                        <li>Any conduct or content of any third party on the Service</li>
                        <li>Any content obtained from the Service</li>
                        <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                    </ul>
                </section>

                {/* Third-Party Links */}
                <section>
                    <h2 className="text-xl font-bold mb-3">9. Third-Party Links</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Our Service may contain links to third-party websites or services that are not owned or
                        controlled by SportsLNV. We have no control over, and assume no responsibility for, the
                        content, privacy policies, or practices of any third-party websites or services. You
                        acknowledge and agree that SportsLNV shall not be responsible or liable for any damage
                        or loss caused by the use of any such content, goods, or services available through
                        any such websites or services.
                    </p>
                </section>

                {/* Indemnification */}
                <section>
                    <h2 className="text-xl font-bold mb-3">10. Indemnification</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        You agree to defend, indemnify, and hold harmless SportsLNV and its officers, directors,
                        employees, and agents from and against any and all claims, damages, obligations, losses,
                        liabilities, costs, or debt, and expenses arising from: (a) your use of and access to
                        the Service; (b) your violation of any term of these Terms; (c) your violation of any
                        third-party right, including any intellectual property or privacy right; or (d) any claim
                        that your content caused damage to a third party.
                    </p>
                </section>

                {/* Termination */}
                <section>
                    <h2 className="text-xl font-bold mb-3">11. Termination</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We may terminate or suspend your access to the Service immediately, without prior notice
                        or liability, for any reason, including without limitation if you breach these Terms.
                        Upon termination, your right to use the Service will immediately cease. All provisions
                        of these Terms which by their nature should survive termination shall survive, including
                        ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                    </p>
                </section>

                {/* Governing Law */}
                <section>
                    <h2 className="text-xl font-bold mb-3">12. Governing Law</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        These Terms shall be governed and construed in accordance with applicable laws, without
                        regard to conflict of law principles. Any disputes arising under or in connection with
                        these Terms shall be subject to the exclusive jurisdiction of the competent courts.
                        Our failure to enforce any right or provision of these Terms will not be considered a
                        waiver of those rights.
                    </p>
                </section>

                {/* Severability */}
                <section>
                    <h2 className="text-xl font-bold mb-3">13. Severability</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        If any provision of these Terms is found to be unenforceable or invalid, that provision
                        will be limited or eliminated to the minimum extent necessary so that these Terms will
                        otherwise remain in full force and effect.
                    </p>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-xl font-bold mb-3">14. Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        If you have any questions about these Terms of Service, please contact us at:
                    </p>
                    <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-sm font-semibold">SportsLNV</p>
                        <p className="text-sm text-muted-foreground">Email: legal@sportslnv.com</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
