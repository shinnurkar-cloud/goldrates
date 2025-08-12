import { GoldPriceDisplay } from '@/components/gold-price-display';
import { AdminPanel } from '@/components/admin-panel';
import { getGoldPrice } from '@/lib/data';
import { Gem } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default function Home() {
  const { price, lastUpdated } = getGoldPrice();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 font-body">
      <main className="w-full max-w-md mx-auto space-y-8 flex flex-col flex-grow justify-center">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full border-2 border-primary/20">
            <Gem className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground/90">
            GoldenEye
          </h1>
          <p className="text-muted-foreground">
            Live Gold Prices, Instantly.
          </p>
        </header>

        <GoldPriceDisplay initialPrice={price} initialLastUpdated={lastUpdated.toISOString()} />

        <div className="w-full pt-4">
          <AdminPanel />
        </div>
      </main>
      <footer className="text-center py-4 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GoldenEye. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
