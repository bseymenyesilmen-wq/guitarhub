export default function SarkiDetay() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          🎵 Duman - Küfi
        </h1>

        <p className="text-zinc-400 mb-6">
          Ton: Em • BPM: 92
        </p>

        <div className="bg-zinc-900 p-5 rounded-xl mb-6">
          <div className="flex justify-between mb-2">
            <span>Öğrenme Durumu</span>
            <span>%75</span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full w-3/4"></div>
          </div>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            🎸 Kullanılan Akorlar
          </h2>

          <div className="flex gap-3 flex-wrap">
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">Em</div>
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">C</div>
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">G</div>
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">D</div>
          </div>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">
            📝 Notlarım
          </h2>

          <textarea
            className="w-full h-40 bg-zinc-800 rounded-xl p-4 outline-none"
            placeholder="Bu şarkı hakkında notlarını yaz..."
          />
        </div>
      </div>
    </main>
  );
}