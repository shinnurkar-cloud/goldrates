import { GoldPriceDisplay } from '@/components/gold-price-display';
import { AdminPanel } from '@/components/admin-panel';
import { getGoldPrice, getGoldPriceHistory, getMessage, getCarouselImages } from '@/lib/data';
import { Gem } from 'lucide-react';
import { PriceHistory } from '@/components/price-history';
import { MessageBoard } from '@/components/message-board';
import { ImageCarousel } from '@/components/image-carousel';
import { PriceCalculator } from '@/components/price-calculator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default function Home() {
  const { price, lastUpdated } = getGoldPrice();
  const history = getGoldPriceHistory();
  const { message } = getMessage();
  const images = getCarouselImages();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-foreground p-4 font-body">
      <main className="w-full max-w-md mx-auto space-y-8 flex flex-col flex-grow justify-center">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full border-2 border-primary/20">
            <Gem className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-wider bg-gradient-to-r from-yellow-400 to-primary bg-clip-text text-transparent">
            KALABURAGI GOLD PRICE
          </h1>
          <div className="overflow-x-hidden whitespace-nowrap">
            <p className="text-primary inline-block animate-marquee">
              Live Gold Prices in Kalaburagi Saraf Bazar.
            </p>
          </div>
        </header>

        <ImageCarousel initialImages={images} />
        <MessageBoard initialMessage={message} />
        <GoldPriceDisplay initialPrice={price} initialLastUpdated={lastUpdated as any} initialHistory={history} />
        <PriceHistory initialHistory={history} />
        <PriceCalculator currentPrice={price} />

        <div className="w-full pt-4">
          <AdminPanel />
        </div>
      </main>
      <footer className="text-center py-4 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} KALABURAGI GOLD PRICE. Shinnurkar All rights reserved.
        </p>
      </footer>
    </div>
  );
}
