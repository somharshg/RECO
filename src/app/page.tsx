import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center px-6">

      <div className="text-center max-w-3xl">

        <p className="text-sm uppercase tracking-[0.3em] text-[#C8A76A] mb-4">
          AI-Native Real Estate Intelligence
        </p>

        <h1 className="text-7xl font-bold mb-4">
          RECO
        </h1>

        <h2 className="text-2xl text-zinc-300 mb-6">
          Real Estate Co-Pilot
        </h2>

        <p className="text-zinc-400 text-lg mb-12">
          Document → Intelligence → Trusted Conversation
        </p>

        <div className="grid md:grid-cols-3 gap-6">

          <Link href="/developer" className="border border-zinc-800 rounded-3xl p-8 hover:border-[#C8A76A] transition">
            <h3 className="text-xl font-semibold mb-2">
              Developer
            </h3>

            <p className="text-zinc-400 text-sm">
              Create and manage properties
            </p>
          </Link>

          <Link href="/broker" className="border border-zinc-800 rounded-3xl p-8 hover:border-[#C8A76A] transition">
            <h3 className="text-xl font-semibold mb-2">
              Broker
            </h3>

            <p className="text-zinc-400 text-sm">
              Access assigned properties
            </p>
          </Link>

          <Link href="/buyer" className="border border-zinc-800 rounded-3xl p-8 hover:border-[#C8A76A] transition">
            <h3 className="text-xl font-semibold mb-2">
              Buyer
            </h3>

            <p className="text-zinc-400 text-sm">
              Explore properties
            </p>
          </Link>

        </div>

      </div>

    </main>
  );
}