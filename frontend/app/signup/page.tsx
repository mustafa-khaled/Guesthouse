import type { Metadata } from 'next'
import SignupForm from '@/components/SignupForm'

export const metadata: Metadata = {
  title: 'Sign up',
}

export default function SignupPage() {
  return (
    <div className="py-16 px-8">
      <SignupForm />
    </div>
  )
}
