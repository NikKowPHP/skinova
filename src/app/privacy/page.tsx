export default function PrivacyPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 prose dark:prose-invert max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p>Last updated: July 29, 2024</p>

      <p>
        Skinova ("we," "our," or "us") is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you use our application.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect information about you in a variety of ways.</p>
      <ul>
        <li>
          <strong>Account and Profile Information:</strong> When you register,
          we collect your email address. During onboarding, we collect your skin
          type and primary skin concern to personalize your experience.
        </li>
        <li>
          <strong>Skin Scan Data:</strong> When you perform a scan, we collect
          the image you provide and any optional notes you add. This data is
          end-to-end encrypted.
        </li>
        <li>
          <strong>AI Analysis and Routine Data:</strong> We store the
          AI-generated analysis of your skin scan and the personalized routine
          recommendations. This data is also encrypted.
        </li>
        <li>
          <strong>Consultation Data:</strong> If you request a paid
          consultation, we create a record of the request and store any notes
          provided by the dermatologist, which are encrypted.
        </li>
        <li>
          <strong>Usage and Analytics Data:</strong> To help us improve the app,
          we use PostHog to collect information about how you interact with our
          service (e.g., features used, buttons clicked). We identify you by your
          user ID and email to understand usage patterns.
        </li>
        <li>
          <strong>Financial Data:</strong> We do not collect or store any
          payment information. All financial data is collected and stored by our
          payment processor, Stripe. We encourage you to review their privacy
          policy.
        </li>
        <li>
          <strong>Derivative Data:</strong> Information our servers
          automatically collect, such as your IP address (for rate limiting and
          security) and browser type.
        </li>
      </ul>

      <h2>2. Use of Your Information</h2>
      <p>
        Having accurate information about you permits us to provide you with a
        smooth, efficient, and customized experience. Specifically, we may use
        information collected about you to:
      </p>
      <ul>
        <li>Create and manage your account.</li>
        <li>Process your skin scans for AI-powered analysis.</li>
        <li>Generate personalized skincare routines.</li>
        <li>Facilitate paid consultations with dermatologists.</li>
        <li>
          Personalize and improve your user experience by tracking your
          progress over time.
        </li>
        <li>
          Email you regarding your account, such as for email verification,
          password resets, and periodic scan reminders.
        </li>
        <li>Process payments and subscriptions through our payment processor.</li>
        <li>Monitor and analyze usage and trends to improve the Service.</li>
      </ul>

      <h2>3. Disclosure of Your Information</h2>
      <p>
        We do not sell your data. We may share information we have collected
        about you in certain situations with the following third parties:
      </p>
      <ul>
        <li>
          <strong>AI Service Providers (Google Gemini):</strong> We send your
          skin scan image and profile data (skin type, concerns, notes) to
          Google's Gemini API for the sole purpose of providing analysis and
          feedback. We do not send personally identifiable information like your
          email along with this data.
        </li>
        <li>
          <strong>Dermatology Providers:</strong> If you purchase a
          consultation, our affiliated, board-certified dermatologists will
          have secure access to the relevant skin scan and its AI analysis to
          provide their professional assessment.
        </li>
        <li>
          <strong>Authentication and Storage (Supabase):</strong> We use
          Supabase for user authentication, database hosting, and secure file
          storage. Your email, encrypted data, and encrypted skin scans are
          managed by Supabase.
        </li>
        <li>
          <strong>Payment Processing (Stripe):</strong> We use Stripe for
          payment processing. Your payment details are sent directly to Stripe
          and are not stored on our servers.
        </li>
        <li>
          <strong>Analytics Services (PostHog):</strong> We use PostHog for
          product analytics. We send usage data, which may include your user ID
          and email, to PostHog to help us understand how you use our service.
        </li>
        <li>
          <strong>Email Services (Resend):</strong> We use Resend to send
          transactional emails. Your email address is shared with Resend for
          this purpose.
        </li>
        <li>
          <strong>By Law or to Protect Rights:</strong> If we believe the
          release of information about you is necessary to respond to legal
          process or to protect the rights, property, and safety of others, we
          may share your information as permitted by law.
        </li>
      </ul>

      <h2>4. Your Rights and Choices</h2>
      <ul>
        <li>
          <strong>Account Information:</strong> You may at any time review or
          change the information in your account by logging into your account
          settings.
        </li>
        <li>
          <strong>Data Export:</strong> You have the right to request an export
          of all your user-generated content (scans, notes, and analyses). This
          can be done from your account settings page.
        </li>
        <li>
          <strong>Data Deletion:</strong> You can request the deletion of your
          account and all associated data from your account settings page. This
          initiates an irreversible process. Your account is first marked for
          deletion and becomes inactive. After a grace period, all your data is
          permanently erased from our systems.
        </li>
      </ul>

      <h2>5. Security of Your Information</h2>
      <p>
        We use administrative, technical, and physical security measures to help
        protect your personal information. While we have taken reasonable steps
        to secure the information you provide to us, please be aware that no
        security measures are perfect or impenetrable.
      </p>
      <p>Specifically, we implement the following key security measures:</p>
      <ul>
        <li>
          <strong>Application-Layer Encryption:</strong> All sensitive data,
          including your skin scan images, notes, and AI feedback, is encrypted
          at rest in our database using industry-standard AES-256-GCM
          encryption. This means your data is unreadable even with direct
          database access.
        </li>
        <li>
          <strong>Secure Image Handling:</strong> Images are uploaded to a
          private cloud storage bucket and are only ever accessed via temporary,
          secure, time-limited URLs.
        </li>
        <li>
          <strong>Secure Authentication:</strong> User authentication is handled
          by Supabase, which provides secure management of passwords and login
          sessions.
        </li>
        <li>
          <strong>Secure Payments:</strong> We do not store your payment card
          details. All payment processing is handled securely by Stripe, a
          PCI-compliant payment processor.
        </li>
      </ul>

      <h2>6. Children's Privacy</h2>
      <p>
        Our services are not intended for individuals under the age of 13. We do
        not knowingly collect personal information from children under 13.
      </p>
      
      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have questions or comments about this Privacy Policy, please contact us at:
        <a href="mailto:lessay.tech@gmail.com">lessay.tech@gmail.com</a>
      </p>
    </div>
  );
}