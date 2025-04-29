import { redirect } from 'next/navigation';

export default async function Home() {
  // Redirect to the dashboard page
  return redirect('/dashboard');
}
