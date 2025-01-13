import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="grid grid-cols-2 gap-4">
        <Link href="/masa-satis">
          <Button className="w-64 h-32 text-xl">Masa Satış</Button>
        </Link>
        <Link href="/tezgah-satis">
          <Button className="w-64 h-32 text-xl">Tezgah Satış</Button>
        </Link>
        <Link href="/paket-satis">
          <Button className="w-64 h-32 text-xl">Paket Satış</Button>
        </Link>
        <Link href="/raporlar">
          <Button className="w-64 h-32 text-xl">Raporlar</Button>
        </Link>
        <Link href="/ayarlar">
          <Button className="w-64 h-32 text-xl col-span-2">Ayarlar</Button>
        </Link>
      </div>
    </main>
  );
}