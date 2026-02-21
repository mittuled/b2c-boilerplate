/**
 * Locale string externalization pattern
 * All user-facing strings as a typed key-value map (English default)
 * 
 * Pattern for adding locales in Phase 3:
 * 1. Create messages-{locale}.ts with same keys
 * 2. Create locale resolver that picks based on user's preferred_language
 * 3. Export useMessages() hook that returns the resolved locale's messages
 */

export const messages = {
  // Auth
  'auth.signup.title': 'Create your account',
  'auth.signup.subtitle': 'Get started with your free account',
  'auth.signup.email': 'Email address',
  'auth.signup.password': 'Password',
  'auth.signup.confirm_password': 'Confirm password',
  'auth.signup.submit': 'Sign up',
  'auth.signup.have_account': 'Already have an account?',
  'auth.signup.sign_in_link': 'Sign in',
  'auth.signup.or_continue_with': 'Or continue with',
  'auth.signup.google': 'Google',
  'auth.signup.apple': 'Apple',

  'auth.login.title': 'Sign in to your account',
  'auth.login.email': 'Email address',
  'auth.login.password': 'Password',
  'auth.login.submit': 'Sign in',
  'auth.login.forgot_password': 'Forgot your password?',
  'auth.login.no_account': "Don't have an account?",
  'auth.login.sign_up_link': 'Sign up',

  'auth.verify_email.title': 'Verify your email',
  'auth.verify_email.message': 'We sent a verification link to your email address. Please check your inbox and click the link to verify.',
  'auth.verify_email.resend': 'Resend verification email',
  'auth.verify_email.resend_cooldown': 'You can resend in {seconds} seconds',

  'auth.reset_password.title': 'Reset your password',
  'auth.reset_password.email': 'Email address',
  'auth.reset_password.submit': 'Send reset link',
  'auth.reset_password.success': 'If an account exists with that email, we sent a password reset link.',
  'auth.reset_password.new_password': 'New password',
  'auth.reset_password.confirm_password': 'Confirm new password',
  'auth.reset_password.update': 'Update password',

  'auth.mfa.title': 'Two-factor authentication',
  'auth.mfa.setup_title': 'Set up two-factor authentication',
  'auth.mfa.enter_code': 'Enter the 6-digit code from your authenticator app',
  'auth.mfa.code': 'Verification code',
  'auth.mfa.verify': 'Verify',
  'auth.mfa.use_recovery': 'Use a recovery code instead',
  'auth.mfa.recovery_title': 'Enter recovery code',
  'auth.mfa.recovery_code': 'Recovery code',

  // Password strength
  'password.strength.weak': 'Weak',
  'password.strength.fair': 'Fair',
  'password.strength.good': 'Good',
  'password.strength.strong': 'Strong',
  'password.requirement.length': 'At least 8 characters',
  'password.requirement.uppercase': 'One uppercase letter',
  'password.requirement.lowercase': 'One lowercase letter',
  'password.requirement.digit': 'One number',
  'password.requirement.special': 'One special character',

  // Profile
  'profile.title': 'Profile settings',
  'profile.display_name': 'Display name',
  'profile.bio': 'Bio',
  'profile.timezone': 'Timezone',
  'profile.language': 'Preferred language',
  'profile.avatar': 'Profile photo',
  'profile.avatar.upload': 'Upload new photo',
  'profile.avatar.remove': 'Remove photo',
  'profile.save': 'Save changes',
  'profile.saved': 'Profile updated successfully',

  // Privacy
  'privacy.title': 'Privacy settings',
  'privacy.consent.marketing_email': 'Marketing emails',
  'privacy.consent.marketing_push': 'Push notifications',
  'privacy.consent.cookie_analytics': 'Analytics cookies',
  'privacy.consent.cookie_advertising': 'Advertising cookies',
  'privacy.consent.history': 'Consent history',
  'privacy.delete_account': 'Delete my account',
  'privacy.export_data': 'Download my data',
  'privacy.cookie_banner.title': 'Cookie preferences',
  'privacy.cookie_banner.accept_all': 'Accept all',
  'privacy.cookie_banner.reject_all': 'Reject all',
  'privacy.cookie_banner.customize': 'Customize',

  // Sessions
  'sessions.title': 'Active sessions',
  'sessions.current': 'Current session',
  'sessions.revoke': 'Revoke',
  'sessions.revoke_all': 'Revoke all other sessions',
  'sessions.last_active': 'Last active',

  // RBAC
  'rbac.forbidden.title': 'Access denied',
  'rbac.forbidden.message': "You don't have permission to access this page.",
  'rbac.forbidden.go_back': 'Go back',
  'rbac.forbidden.contact_admin': 'Contact admin',

  // Theme
  'theme.title': 'Appearance',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System default',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.retry': 'Try again',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.confirm': 'Confirm',
  'common.back': 'Back',
} as const;

export type MessageKey = keyof typeof messages;
