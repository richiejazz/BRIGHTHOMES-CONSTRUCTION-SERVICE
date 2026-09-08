import { Route, Routes } from 'react-router-dom'
import { Building2 } from 'lucide-react'

function FoundationHome() {
  return (
    <main className="min-h-screen bg-stone-100 p-8 text-stone-900">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center border-l-2 border-amber-700 pl-8">
        <Building2 aria-hidden="true" className="mb-8 size-10 text-amber-800" />
        <p className="mb-3 text-sm font-semibold tracking-[0.22em] text-stone-600">FOUNDATION</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">BRIGHTHOMES CONSTRUCTION SERVICE</h1>
        <p className="mt-6 text-xl text-stone-700">Building Dreams, Constructing Reality.</p>
        <p className="mt-10 text-sm text-stone-500">This temporary screen verifies the website foundation. The final public experience is intentionally deferred.</p>
      </div>
    </main>
  )
}

export default function App() {
  return <Routes><Route path="*" element={<FoundationHome />} /></Routes>
}
