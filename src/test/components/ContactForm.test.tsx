import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ContactForm } from '../../components/ContactForm';

describe('ContactForm', () => {
  let originalFetch: typeof fetch;
  const mockWebhookUrl = 'https://script.google.com/mock-webhook';

  beforeEach(() => {
    originalFetch = window.fetch;
  });

  afterEach(() => {
    window.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('should show character counter for message field', () => {
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    expect(screen.getByText('1000 characters remaining')).toBeInTheDocument();
  });

  it('should update character counter as user types', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const messageField = screen.getByLabelText('Message *');
    await user.type(messageField, 'Hello');

    expect(screen.getByText('995 characters remaining')).toBeInTheDocument();
  });

  it('should show warning when character count is low', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const messageField = screen.getByLabelText('Message *');
    const longMessage = 'a'.repeat(950);
    await user.type(messageField, longMessage);

    const counter = screen.getByText(/50 characters remaining/i);
    expect(counter).toHaveClass('warning');
  });

  it('should show error when name is empty on submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('should show error when email is empty on submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should accept valid email format', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    window.fetch = mockFetch;

    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const nameField = screen.getByLabelText('Name *');
    const emailField = screen.getByLabelText('Email *');
    const messageField = screen.getByLabelText('Message *');

    await user.type(nameField, 'John Doe');
    await user.type(emailField, 'john@example.com');
    await user.type(messageField, 'Test message');

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    // Should not show any email validation errors
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email')).not.toBeInTheDocument();
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('should show error when message is empty on submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });

  it('should clear error when user starts typing in a field', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();

    // Start typing in name field
    const nameField = screen.getByLabelText('Name *');
    await user.type(nameField, 'J');

    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('should mark fields with aria-invalid when there are errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    const nameField = screen.getByLabelText('Name *');
    const emailField = screen.getByLabelText('Email *');
    const messageField = screen.getByLabelText('Message *');

    expect(nameField).toHaveAttribute('aria-invalid', 'true');
    expect(emailField).toHaveAttribute('aria-invalid', 'true');
    expect(messageField).toHaveAttribute('aria-invalid', 'true');
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    window.fetch = mockFetch;

    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    // Fill out form
    await user.type(screen.getByLabelText('Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject'), 'Test Subject');
    await user.type(screen.getByLabelText('Message *'), 'Test message content');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    // Verify fetch was called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        mockWebhookUrl,
        expect.objectContaining({
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('John Doe'),
        })
      );
    });
  });

  it('should show success message after successful submission', async () => {
    const user = userEvent.setup();
    window.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    // Fill out form
    await user.type(screen.getByLabelText('Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email *'), 'john@example.com');
    await user.type(screen.getByLabelText('Message *'), 'Test message');

    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup();
    window.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    // Fill out form
    const nameField = screen.getByLabelText('Name *') as HTMLInputElement;
    const emailField = screen.getByLabelText('Email *') as HTMLInputElement;
    const messageField = screen.getByLabelText('Message *') as HTMLTextAreaElement;

    await user.type(nameField, 'John Doe');
    await user.type(emailField, 'john@example.com');
    await user.type(messageField, 'Test message');

    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Verify form is cleared
    await waitFor(() => {
      expect(nameField.value).toBe('');
      expect(emailField.value).toBe('');
      expect(messageField.value).toBe('');
    });
  });

  it('should show error message when submission fails', async () => {
    const user = userEvent.setup();
    window.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    // Fill out form
    await user.type(screen.getByLabelText('Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email *'), 'john@example.com');
    await user.type(screen.getByLabelText('Message *'), 'Test message');

    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup();
    let resolvePromise: () => void;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolvePromise = () => resolve({ ok: true } as Response);
    });
    window.fetch = vi.fn().mockReturnValue(fetchPromise);

    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    // Fill out form
    await user.type(screen.getByLabelText('Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email *'), 'john@example.com');
    await user.type(screen.getByLabelText('Message *'), 'Test message');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    // Button should be disabled while submitting
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Sending...');

    // Resolve the promise
    resolvePromise!();

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Send Message');
    });
  });

  it('should not allow message longer than max length', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const messageField = screen.getByLabelText('Message *');
    const longMessage = 'a'.repeat(1001);
    await user.type(messageField, longMessage);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    expect(screen.getByText(/message must be 1000 characters or less/i)).toBeInTheDocument();
  });

  it('should handle optional subject field correctly', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    window.fetch = mockFetch;

    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    // Fill out form WITHOUT subject
    await user.type(screen.getByLabelText('Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email *'), 'john@example.com');
    await user.type(screen.getByLabelText('Message *'), 'Test message');

    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Verify submission includes "(No subject)"
    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.subject).toBe('(No subject)');
    });
  });

  it('should call onSuccess callback after successful submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    window.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<ContactForm webhookUrl={mockWebhookUrl} onSuccess={onSuccess} />);

    // Fill out form
    await user.type(screen.getByLabelText('Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email *'), 'john@example.com');
    await user.type(screen.getByLabelText('Message *'), 'Test message');

    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onError callback after failed submission', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    window.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<ContactForm webhookUrl={mockWebhookUrl} onError={onError} />);

    // Fill out form
    await user.type(screen.getByLabelText('Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email *'), 'john@example.com');
    await user.type(screen.getByLabelText('Message *'), 'Test message');

    // Submit form
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Failed to send message. Please try again.');
    });
  });

  it('should add focused class when field is focused', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const nameField = screen.getByLabelText('Name *');
    const fieldContainer = nameField.closest('.form-field');

    // Initially not focused
    expect(fieldContainer).not.toHaveClass('focused');

    // Click to focus
    await user.click(nameField);

    expect(fieldContainer).toHaveClass('focused');

    // Blur the field
    await user.tab();

    expect(fieldContainer).not.toHaveClass('focused');
  });

  it('should add has-value class when field has content', async () => {
    const user = userEvent.setup();
    render(<ContactForm webhookUrl={mockWebhookUrl} />);

    const nameField = screen.getByLabelText('Name *');
    const fieldContainer = nameField.closest('.form-field');

    // Initially no value
    expect(fieldContainer).not.toHaveClass('has-value');

    // Type something
    await user.type(nameField, 'John');

    expect(fieldContainer).toHaveClass('has-value');
  });
});
