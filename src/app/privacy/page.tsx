import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Learn how SportsLNV collects, uses, and protects your personal information.',
    alternates: { canonical: '/privacy' },
}

export default function PrivacyPolicyPage() {
    return (
        <div className="container-wide py-12 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-10">
                Last updated: July 10, 2026
            </p>

            <div className="prose prose-invert prose-sm max-w-none space-y-8">
                {/* Introduction */}
                <section>
                    <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        SportsLNV (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website sportslnv.com (the &quot;Service&quot;).
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                        when you visit our website. Please read this policy carefully. By using the Service, you
                        consent to the data practices described in this policy.
                    </p>
                </section>

                {/* Information We Collect */}
                <section>
                    <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>

                    <h3 className="text-base font-semibold mt-4 mb-2">2.1 Information You Provide</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        When you register for an account, subscribe to our newsletter, or interact with our
                        features, we may collect:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li>Name and email address</li>
                        <li>Username and password</li>
                        <li>Profile information you choose to provide</li>
                        <li>Comments, likes, and other interactions</li>
                    </ul>

                    <h3 className="text-base font-semibold mt-4 mb-2">2.2 Information Collected Automatically</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        When you access our Service, we automatically collect certain information, including:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li>IP address and browser type</li>
                        <li>Device information and operating system</li>
                        <li>Pages visited, time spent, and referring URLs</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </section>

                {/* How We Use Your Information */}
                <section>
                    <h2 className="text-xl font-bold mb-3">3. How We Use Your Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We use the information we collect for the following purposes:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li>To provide, operate, and maintain our Service</li>
                        <li>To improve, personalize, and expand our Service</li>
                        <li>To understand and analyze usage trends and preferences</li>
                        <li>To communicate with you, including for customer service and updates</li>
                        <li>To send you marketing and promotional communications (with your consent)</li>
                        <li>To detect, prevent, and address technical issues or fraud</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                {/* Cookies */}
                <section>
                    <h2 className="text-xl font-bold mb-3">4. Cookies and Tracking Technologies</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We use cookies, web beacons, and similar technologies to collect information and improve
                        our Service. Cookies are small data files stored on your device. You can instruct your
                        browser to refuse all cookies or to indicate when a cookie is being sent. However, if
                        you do not accept cookies, some portions of our Service may not function properly.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                        We use both session cookies (which expire when you close your browser) and persistent
                        cookies (which remain on your device until deleted or expired). We also use third-party
                        analytics services such as Google Analytics to help us understand usage patterns.
                    </p>
                </section>

                {/* Third-Party Services */}
                <section>
                    <h2 className="text-xl font-bold mb-3">5. Third-Party Services</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Our Service may contain links to third-party websites or services that are not owned or
                        controlled by us. We have no control over, and assume no responsibility for, the content,
                        privacy policies, or practices of any third-party websites or services. We strongly advise
                        you to review the privacy policy of every site you visit.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                        We may use third-party advertising partners, including Google AdSense, to serve ads on
                        our Service. These partners may use cookies and similar technologies to collect information
                        about your browsing activities to provide you with targeted advertisements.
                    </p>
                </section>

                {/* Data Sharing */}
                <section>
                    <h2 className="text-xl font-bold mb-3">6. Data Sharing and Disclosure</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We do not sell your personal information. We may share your information in the following
                        situations:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li><strong>Service Providers:</strong> With trusted third parties who assist us in operating our Service</li>
                        <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                        <li><strong>Protection:</strong> To protect our rights, privacy, safety, or property</li>
                        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                        <li><strong>With Your Consent:</strong> When you have given us explicit permission</li>
                    </ul>
                </section>

                {/* Data Security */}
                <section>
                    <h2 className="text-xl font-bold mb-3">7. Data Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We implement commercially reasonable security measures to protect your personal information
                        from unauthorized access, alteration, disclosure, or destruction. However, no method of
                        transmission over the Internet or electronic storage is 100% secure, and we cannot
                        guarantee absolute security.
                    </p>
                </section>

                {/* Data Retention */}
                <section>
                    <h2 className="text-xl font-bold mb-3">8. Data Retention</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We retain your personal information only for as long as necessary to fulfill the purposes
                        for which it was collected, including to satisfy any legal, accounting, or reporting
                        requirements. When we no longer need your personal information, we will securely delete
                        or anonymize it.
                    </p>
                </section>

                {/* Your Rights */}
                <section>
                    <h2 className="text-xl font-bold mb-3">9. Your Privacy Rights</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Depending on applicable law, you may have the following rights regarding your personal information:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                        <li><strong>Correction:</strong> Request that we correct any inaccurate information</li>
                        <li><strong>Deletion:</strong> Request that we delete your personal information</li>
                        <li><strong>Opt-Out:</strong> Opt out of marketing communications at any time</li>
                        <li><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                        <li><strong>Do Not Sell:</strong> We do not sell personal information</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                        To exercise any of these rights, please contact us at the email address provided below.
                        We will respond to your request within a reasonable timeframe as required by applicable law.
                    </p>
                </section>

                {/* Children's Privacy */}
                <section>
                    <h2 className="text-xl font-bold mb-3">10. Children&apos;s Privacy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Our Service is not intended for individuals under the age of 13. We do not knowingly
                        collect personal information from children under 13. If we become aware that we have
                        collected personal information from a child under 13 without verification of parental
                        consent, we will take steps to delete that information promptly. If you believe we have
                        collected information from a child under 13, please contact us immediately.
                    </p>
                </section>

                {/* Changes */}
                <section>
                    <h2 className="text-xl font-bold mb-3">11. Changes to This Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We may update this Privacy Policy from time to time. We will notify you of any changes
                        by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                        Your continued use of the Service after any changes constitutes your acceptance of the
                        updated policy.
                    </p>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-xl font-bold mb-3">12. Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        If you have any questions or concerns about this Privacy Policy or our data practices,
                        please contact us at:
                    </p>
                    <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-sm font-semibold">SportsLNV</p>
                        <p className="text-sm text-muted-foreground">Email: privacy@sportslnv.com</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
