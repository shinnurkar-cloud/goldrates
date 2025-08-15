type GoldPriceHistoryEntry = {
  price: number;
  lastUpdated: Date;
};

// This is a simple in-memory store.
// In a real application, you would use a database like Firestore, PostgreSQL, etc.
// This array lives only for the lifetime of the server process.
let goldPriceHistory: GoldPriceHistoryEntry[] = [
  { price: 100500, lastUpdated: new Date() }
];
let message: string = 'Welcome! All prices are for 24 Karat Gold per 10 grams.';
let carouselImages: string[] = [
    "https://placehold.co/600x400.png?text=gold+bars",
    "https://placehold.co/600x400.png?text=gold+bars",
    "https://placehold.co/600x400.png?text=gold+bars",
    "https://placehold.co/600x400.png?text=gold+bars",
    "https://placehold.co/600x400.png?text=gold+bars",
];


export const getMessage = (): { message: string } => {
  return { message };
};

export const updateMessage = (newMessage: string): void => {
  message = newMessage;
};

export const getCarouselImages = (): string[] => {
    return [...carouselImages];
};

export const updateCarouselImages = (newImages: string[]): void => {
    carouselImages = newImages;
};

export const getGoldPriceHistory = (): GoldPriceHistoryEntry[] => {
  // Return a copy with ISO strings to ensure consistency between server and client
  return [...goldPriceHistory]
    .map(entry => ({...entry, lastUpdated: entry.lastUpdated.toISOString() as any}));
};

export const updateGoldPrice = (newPrice: number): void => {
  goldPriceHistory.push({
    price: newPrice,
    lastUpdated: new D_ate(),
  });

  // Keep only the last 5 updates
  while (goldPriceHistory.length > 5) {
    goldPriceHistory.shift();
  }
};

export const getGoldPrice = (): GoldPriceHistoryEntry => {
    if (goldPriceHistory.length === 0) {
        // This is a fallback for the edge case where the server has reloaded and no price has been set yet.
        return { price: 100500, lastUpdated: new Date().toISOString() as any };
    }
    const latest = goldPriceHistory[goldPriceHistory.length - 1];
    return {...latest, lastUpdated: latest.lastUpdated.toISOString() as any};
};
