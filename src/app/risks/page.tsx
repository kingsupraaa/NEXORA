import { redirect } from 'next/navigation';

export default function RisksPage() {
  redirect('/projects?view=risks');
}
