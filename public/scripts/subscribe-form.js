(() => {
  const forms = document.querySelectorAll('[data-subscribe-form]');

  for (const form of forms) {
    if (!(form instanceof HTMLFormElement)) continue;

    const emailInput = form.querySelector('input[name="email"]');
    const honeypotInput = form.querySelector('input[name="website"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.subscribe-status');

    if (
      !(emailInput instanceof HTMLInputElement) ||
      !(submitButton instanceof HTMLButtonElement) ||
      !(status instanceof HTMLElement)
    ) {
      continue;
    }

    // Use aria-busy/aria-disabled instead of the disabled attribute: disabling
    // the focused button would drop keyboard focus back to the page body.
    let pending = false;
    const setPending = value => {
      pending = value;
      form.setAttribute('aria-busy', String(value));
      emailInput.readOnly = value;
      submitButton.setAttribute('aria-disabled', String(value));
      submitButton.textContent = value ? 'Subscribing...' : 'Subscribe';
    };

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending) return;
      status.textContent = '';

      if (!emailInput.value.trim()) {
        status.textContent = 'Enter your email address.';
        return;
      }

      setPending(true);

      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: emailInput.value.trim(),
            website:
              honeypotInput instanceof HTMLInputElement ? honeypotInput.value : '',
            referrer: window.location.href
          })
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            typeof payload?.error === 'string'
              ? payload.error
              : 'Something went wrong. Try again.'
          );
        }

        status.textContent =
          typeof payload?.message === 'string'
            ? payload.message
            : 'Check your inbox to confirm your subscription.';
        form.reset();
      } catch (error) {
        status.textContent =
          error instanceof Error
            ? error.message
            : 'Something went wrong. Try again.';
      } finally {
        setPending(false);
      }
    });
  }
})();
