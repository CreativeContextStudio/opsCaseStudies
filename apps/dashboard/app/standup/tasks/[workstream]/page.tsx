import { redirect } from 'next/navigation'

export default async function WorkstreamRedirect({ params }: { params: Promise<{ workstream: string }> }) {
  const { workstream } = await params
  redirect(`/standup/tasks?workstream=${workstream.toLowerCase()}`)
}
