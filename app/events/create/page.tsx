import { redirect } from "next/navigation";

export default async function Welcome() {
  return redirect('/events/create/start')
}
