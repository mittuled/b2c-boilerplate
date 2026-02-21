import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our privacy policy explains how we collect, use, and protect your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <main
      aria-labelledby="privacy-heading"
      style={{
        maxWidth: '72ch',
        margin: '0 auto',
        padding: 'var(--spacing-lg, 2rem) var(--spacing-md, 1rem)',
        color: 'var(--color-text-primary, #1a1a1a)',
        fontFamily: 'var(--font-family-body, system-ui, sans-serif)',
        lineHeight: 'var(--line-height-body, 1.6)',
      }}
    >
      <h1
        id="privacy-heading"
        style={{
          fontSize: 'var(--font-size-2xl, 2rem)',
          fontWeight: 'var(--font-weight-bold, 700)',
          marginBottom: 'var(--spacing-md, 1.5rem)',
          color: 'var(--color-text-heading, #111)',
        }}
      >
        Privacy Policy
      </h1>

      <p style={{ color: 'var(--color-text-secondary, #555)', marginBottom: 'var(--spacing-lg, 2rem)' }}>
        <strong>Last updated:</strong> February 2026
      </p>

      <p>
        Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose,
        and safeguard your information when you use our application. Please read this policy carefully.
        If you do not agree with the terms of this privacy policy, please do not access the application.
      </p>

      <Section id="data-collection" title="1. Information We Collect">
        <h3 style={h3Style}>Personal Data</h3>
        <p>
          When you create an account, we collect information you voluntarily provide, including:
        </p>
        <ul style={listStyle}>
          <li>Email address</li>
          <li>Display name</li>
          <li>Profile photo (optional)</li>
          <li>Phone number (optional)</li>
          <li>Timezone and language preferences</li>
        </ul>

        <h3 style={h3Style}>Automatically Collected Data</h3>
        <p>
          When you access the application, we may automatically collect certain information, including:
        </p>
        <ul style={listStyle}>
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device information and operating system</li>
          <li>Session data (login timestamps, session identifiers)</li>
          <li>Usage patterns and interaction data (subject to your cookie preferences)</li>
        </ul>
      </Section>

      <Section id="data-usage" title="2. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul style={listStyle}>
          <li>Create and manage your account</li>
          <li>Provide and maintain the application</li>
          <li>Authenticate your identity and manage sessions</li>
          <li>Send transactional communications (e.g., email verification, password resets)</li>
          <li>Send marketing communications (only with your explicit consent)</li>
          <li>Enforce our terms of service and protect against abuse</li>
          <li>Improve application performance and user experience</li>
          <li>Comply with legal obligations</li>
        </ul>
      </Section>

      <Section id="data-storage" title="3. Data Storage and Security">
        <p>
          Your data is stored securely using industry-standard encryption and access controls.
          We employ the following security measures:
        </p>
        <ul style={listStyle}>
          <li>Encryption in transit (TLS 1.2+) and at rest</li>
          <li>Row-level security policies restricting data access to authorized users</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Multi-factor authentication support for account protection</li>
          <li>Automatic session expiry and token rotation</li>
        </ul>
        <p>
          While we implement commercially reasonable security measures, no method of electronic
          storage is 100% secure. We cannot guarantee absolute security of your data.
        </p>
      </Section>

      <Section id="cookies" title="4. Cookies and Tracking">
        <p>
          We use cookies and similar technologies to maintain your session and preferences.
          You can manage your cookie preferences at any time through our cookie consent banner
          or your privacy settings. We categorize cookies as:
        </p>
        <ul style={listStyle}>
          <li><strong>Essential cookies:</strong> Required for core functionality (authentication, security). These cannot be disabled.</li>
          <li><strong>Analytics cookies:</strong> Help us understand how you use the application. Opt-in only.</li>
          <li><strong>Marketing cookies:</strong> Used for personalized content and advertising. Opt-in only.</li>
        </ul>
      </Section>

      <Section id="data-sharing" title="5. Data Sharing and Disclosure">
        <p>We do not sell your personal data. We may share your information in the following cases:</p>
        <ul style={listStyle}>
          <li><strong>Service providers:</strong> Third-party services that assist in operating the application (hosting, analytics, email delivery)</li>
          <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process</li>
          <li><strong>Safety:</strong> To protect the rights, property, or safety of our users or the public</li>
          <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        </ul>
      </Section>

      <Section id="data-rights" title="6. Your Rights">
        <p>
          Depending on your jurisdiction, you may have the following rights regarding your personal data:
        </p>
        <ul style={listStyle}>
          <li><strong>Access:</strong> Request a copy of your personal data (available in Settings &gt; Privacy &gt; Download my data)</li>
          <li><strong>Rectification:</strong> Update or correct inaccurate data (available in Settings &gt; Profile)</li>
          <li><strong>Erasure:</strong> Request deletion of your account and associated data (available in Settings &gt; Privacy &gt; Delete my account)</li>
          <li><strong>Portability:</strong> Export your data in a machine-readable format (JSON)</li>
          <li><strong>Restrict processing:</strong> Request limitation of data processing</li>
          <li><strong>Object:</strong> Object to data processing based on legitimate interests</li>
          <li><strong>Withdraw consent:</strong> Withdraw previously given consent at any time</li>
        </ul>
        <p>
          To exercise any of these rights, visit your Privacy Settings or contact us at the address below.
        </p>
      </Section>

      <Section id="data-retention" title="7. Data Retention">
        <p>
          We retain your personal data for as long as your account is active or as needed to provide
          you services. When you delete your account, we soft-delete your profile and scrub personally
          identifiable information. Certain data may be retained as required by law or for legitimate
          business purposes (e.g., fraud prevention, legal compliance).
        </p>
      </Section>

      <Section id="children" title="8. Children's Privacy">
        <p>
          Our application is not intended for children under 16 years of age. We do not knowingly
          collect personal data from children. If you believe we have collected data from a child,
          please contact us immediately.
        </p>
      </Section>

      <Section id="changes" title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material
          changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot;
          date. Your continued use of the application after changes are posted constitutes acceptance
          of the updated policy.
        </p>
      </Section>

      <Section id="contact" title="10. Contact Us">
        <p>
          If you have questions or concerns about this Privacy Policy or our data practices,
          please contact us at:
        </p>
        <p>
          <strong>Email:</strong> privacy@example.com<br />
          <strong>Address:</strong> [Your Company Address]
        </p>
      </Section>
    </main>
  );
}

const h3Style: React.CSSProperties = {
  fontSize: 'var(--font-size-md, 1.1rem)',
  fontWeight: 'var(--font-weight-semibold, 600)',
  marginTop: 'var(--spacing-sm, 1rem)',
  marginBottom: 'var(--spacing-xs, 0.5rem)',
};

const listStyle: React.CSSProperties = {
  paddingLeft: 'var(--spacing-md, 1.5rem)',
  marginBottom: 'var(--spacing-sm, 1rem)',
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      style={{ marginBottom: 'var(--spacing-lg, 2rem)' }}
    >
      <h2
        id={`${id}-heading`}
        style={{
          fontSize: 'var(--font-size-xl, 1.5rem)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          marginBottom: 'var(--spacing-sm, 0.75rem)',
          color: 'var(--color-text-heading, #111)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
