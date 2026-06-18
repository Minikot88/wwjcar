import { useState } from 'react';

export function useAdminAction() {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function run(action, successMessage = '') {
    setIsBusy(true);
    setError('');
    setSuccess('');

    try {
      const result = await action();
      if (successMessage) setSuccess(successMessage);
      return result;
    } catch (actionError) {
      setError(actionError.message || 'CMS operation failed');
      return null;
    } finally {
      setIsBusy(false);
    }
  }

  function clearFeedback() {
    setError('');
    setSuccess('');
  }

  return { isBusy, error, success, run, clearFeedback, setError, setSuccess };
}
