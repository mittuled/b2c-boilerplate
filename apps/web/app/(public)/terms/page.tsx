import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing use of our application.',
};

export default function TermsOfServicePage() {
  return (
    <main
      aria-labelledby="terms-heading"
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
        id="terms-heading"
        style={{
          fontSize: 'var(--font-size-2xl, 2rem)',
          fontWeight: 'var(--font-weight-bold, 700)',
          marginBottom: 'var(--spacing-md, 1.5rem)',
          color: 'var(--color-text-heading, #111)',
        }}
      >
        Terms of Service
      </h1>

      <p style={{ color: 'var(--color-text-secondary, #555)', marginBottom: 'var(--spacing-lg, 2rem)' }}>
        <strong>Last updated:</strong> February 2026
      </p>

      <p>
        Please read these Terms of Service (&quot;Terms&quot;) carefully before using our application.
        By accessing or using the application, you agree to be bound by these Terms. If you do not
        agree to these Terms, you must not use the application.
      </p>

      <Section id="acceptance" title="1. Acceptance of Terms">
        <p>
          By creating an account or using the application, you acknowledge that you have read,
          understood, and agree to be bound by these Terms, as well as our{' '}
          <a href="/privacy" style={linkStyle}>Privacy Policy</a>, which is incorporated herein
          by reference. These Terms apply to all users of the application.
        </p>
        <p>
          You must be at least 16 years of age to use this application. By using the application,
          you represent and warrant that you meet this age requirement.
        </p>
      </Section>

      <Section id="accounts" title="2. User Accounts">
        <p>
          To access certain features, you must create an account. You are responsible for:
        </p>
        <ul style={listStyle}>
          <li>Providing accurate and complete registration information</li>
          <li>Maintaining the security and confidentiality of your login credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized use of your account</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate these Terms,
          exhibit suspicious activity, or remain inactive for an extended period.
        </p>
      </Section>

      <Section id="acceptable-use" title="3. Acceptable Use">
        <p>You agree not to use the application to:</p>
        <ul style={listStyle}>
          <li>Violate any applicable laws, regulations, or third-party rights</li>
          <li>Upload or transmit malicious code, viruses, or harmful content</li>
          <li>Attempt to gain unauthorized access to other accounts or systems</li>
          <li>Engage in automated scraping, crawling, or data harvesting</li>
          <li>Circumvent security measures, rate limits, or access controls</li>
          <li>Impersonate another person or entity</li>
          <li>Send unsolicited communications (spam)</li>
          <li>Interfere with or disrupt the application or its infrastructure</li>
        </ul>
        <p>
          We reserve the right to investigate and take appropriate action against users who
          violate this section, including account suspension, termination, and reporting to
          law enforcement.
        </p>
      </Section>

      <Section id="intellectual-property" title="4. Intellectual Property">
        <p>
          The application and its original content (excluding user-generated content), features,
          and functionality are owned by us and are protected by international copyright, trademark,
          patent, trade secret, and other intellectual property laws.
        </p>
        <p>
          You retain ownership of any content you submit through the application. By submitting
          content, you grant us a limited, non-exclusive license to use, display, and store such
          content solely for the purpose of providing the application services.
        </p>
      </Section>

      <Section id="service-availability" title="5. Service Availability">
        <p>
          We strive to maintain high availability of the application but do not guarantee
          uninterrupted access. The application may be temporarily unavailable due to:
        </p>
        <ul style={listStyle}>
          <li>Scheduled maintenance (with advance notice when possible)</li>
          <li>Emergency maintenance or security patches</li>
          <li>Factors beyond our reasonable control (force majeure)</li>
        </ul>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the application
          at any time, with or without notice.
        </p>
      </Section>

      <Section id="liability" title="6. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, the application is provided
          &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether
          express or implied, including but not limited to implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement.
        </p>
        <p>
          In no event shall we be liable for any indirect, incidental, special, consequential,
          or punitive damages, including but not limited to loss of profits, data, use, goodwill,
          or other intangible losses, resulting from:
        </p>
        <ul style={listStyle}>
          <li>Your use of or inability to use the application</li>
          <li>Unauthorized access to or alteration of your data</li>
          <li>Statements or conduct of any third party on the application</li>
          <li>Any other matter relating to the application</li>
        </ul>
      </Section>

      <Section id="indemnification" title="7. Indemnification">
        <p>
          You agree to indemnify and hold harmless the application, its operators, affiliates,
          and their respective officers, directors, employees, and agents from any claims,
          liabilities, damages, losses, and expenses (including reasonable legal fees) arising
          out of or in connection with your use of the application or violation of these Terms.
        </p>
      </Section>

      <Section id="termination" title="8. Termination">
        <p>
          You may terminate your account at any time through the application settings (Settings &gt;
          Privacy &gt; Delete my account). Upon termination:
        </p>
        <ul style={listStyle}>
          <li>Your profile data will be anonymized and personally identifiable information scrubbed</li>
          <li>All active sessions will be revoked immediately</li>
          <li>Your uploaded files (e.g., avatars) will be deleted</li>
          <li>You may export your data before deletion through Settings &gt; Privacy &gt; Download my data</li>
        </ul>
        <p>
          We may terminate or suspend your access immediately, without prior notice, for conduct
          that we determine violates these Terms or is harmful to other users, us, or third parties.
        </p>
      </Section>

      <Section id="governing-law" title="9. Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes
          arising under these Terms shall be subject to the exclusive jurisdiction of the courts
          located in [Your Jurisdiction].
        </p>
      </Section>

      <Section id="changes" title="10. Changes to Terms">
        <p>
          We reserve the right to modify these Terms at any time. If we make material changes,
          we will provide notice through the application or via email. Your continued use of the
          application after changes are posted constitutes acceptance of the revised Terms.
        </p>
        <p>
          We encourage you to review these Terms periodically. The &quot;Last updated&quot; date
          at the top indicates when the most recent changes were made.
        </p>
      </Section>

      <Section id="contact" title="11. Contact Us">
        <p>
          If you have questions about these Terms, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> legal@example.com<br />
          <strong>Address:</strong> [Your Company Address]
        </p>
      </Section>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-link, #0066cc)',
  textDecoration: 'underline',
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
