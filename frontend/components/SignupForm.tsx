'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/hooks/useAlert';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      showAlert('error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(name, email, password, passwordConfirm);
      showAlert('success', 'Account created successfully');
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h2 className="mb-8 text-2xl font-bold text-gray-800">Create your account</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Your name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="password-confirm"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Confirm password
          </label>
          <input
            id="password-confirm"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </div>
  );
}
