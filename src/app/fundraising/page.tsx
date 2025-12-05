import { redirect } from 'next/navigation';

export default function FundraisingPage() {
  redirect('/fundraisers');
  return null;
}
