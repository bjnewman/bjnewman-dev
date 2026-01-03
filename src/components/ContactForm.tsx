import { useState, FormEvent, useEffect } from 'react';
import { FunFormFields, FunModeToggle } from './FunFormFields';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  // Honeypot field - should always be empty for real users
  website: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface ContactFormProps {
  webhookUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const MAX_MESSAGE_LENGTH = 1000;

// eslint-disable-next-line react-refresh/only-export-components
export const useContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '', // Honeypot field
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent, webhookUrl: string) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Honeypot check - if filled, it's a bot. Fake success silently.
    if (formData.website) {
      setIsSubmitting(true);
      // Simulate a brief delay to make it look real
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create abort controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || '(No subject)',
          message: formData.message,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // With no-cors mode, we can't read the response, so we assume success
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
      setErrors({});
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.error('Form submission timed out');
      }
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const messageCharsRemaining = MAX_MESSAGE_LENGTH - formData.message.length;

  return {
    formData,
    errors,
    isSubmitting,
    submitStatus,
    focusedField,
    messageCharsRemaining,
    handleSubmit,
    handleChange,
    setFocusedField,
    setSubmitStatus,
  };
};

export const ContactForm = ({
  webhookUrl: propWebhookUrl,
  onSuccess,
  onError,
}: ContactFormProps) => {
  const {
    formData,
    errors,
    isSubmitting,
    submitStatus,
    focusedField,
    messageCharsRemaining,
    handleSubmit,
    handleChange,
    setFocusedField,
  } = useContactForm();

  const [funModeActive, setFunModeActive] = useState(false);
  const webhookUrl = propWebhookUrl || import.meta.env.PUBLIC_FORM_WEBHOOK_URL || '';

  // Call callbacks when submit status changes
  useEffect(() => {
    if (submitStatus === 'success' && onSuccess) {
      onSuccess();
    } else if (submitStatus === 'error' && onError) {
      onError('Failed to send message. Please try again.');
    }
  }, [submitStatus, onSuccess, onError]);

  const onSubmit = async (e: FormEvent) => {
    await handleSubmit(e, webhookUrl);
  };

  return (
    <div className="contact-form-container">
      <form className="contact-form" onSubmit={onSubmit} noValidate>
        <div
          className={`form-field ${focusedField === 'name' ? 'focused' : ''} ${formData.name ? 'has-value' : ''}`}
        >
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            aria-label="Name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          <label htmlFor="name">Name *</label>
          {errors.name && (
            <span className="error-message" id="name-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div
          className={`form-field ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}
        >
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            aria-label="Email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          <label htmlFor="email">Email *</label>
          {errors.email && (
            <span className="error-message" id="email-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div
          className={`form-field ${focusedField === 'subject' ? 'focused' : ''} ${formData.subject ? 'has-value' : ''}`}
        >
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            onFocus={() => setFocusedField('subject')}
            onBlur={() => setFocusedField(null)}
            aria-label="Subject"
          />
          <label htmlFor="subject">Subject</label>
        </div>

        <div className="fun-mode-section">
          <FunModeToggle
            isActive={funModeActive}
            onToggle={() => setFunModeActive(!funModeActive)}
          />
        </div>

        <FunFormFields isVisible={funModeActive} />

        <div
          className={`form-field textarea-field ${focusedField === 'message' ? 'focused' : ''} ${formData.message ? 'has-value' : ''}`}
        >
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            onFocus={() => setFocusedField('message')}
            onBlur={() => setFocusedField(null)}
            rows={6}
            aria-label="Message"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : 'message-counter'}
          />
          <label htmlFor="message">Message *</label>
          <div className="message-footer">
            {errors.message && (
              <span className="error-message" id="message-error" role="alert">
                {errors.message}
              </span>
            )}
            <span
              className={`char-counter ${messageCharsRemaining < 100 ? 'warning' : ''}`}
              id="message-counter"
              aria-live="polite"
            >
              {messageCharsRemaining} characters remaining
            </span>
          </div>
        </div>

        {/* Honeypot field - hidden from humans, visible to bots */}
        <div
          className="form-field honeypot-field"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            opacity: 0,
            height: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <label htmlFor="website">Required only for robots and advanced super intelligences</label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          className={`submit-button ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>

        {submitStatus === 'success' && (
          <div className="status-message success" role="status">
            ✓ Message sent successfully! I'll get back to you soon.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="status-message error" role="alert">
            ✗ Failed to send message. Please try again or email me directly.
          </div>
        )}
      </form>
    </div>
  );
};
