type GoldPriceHistoryEntry = {
  price: number;
  lastUpdated: Date;
};

// This is a simple in-memory store.
// In a real application, you would use a database like Firestore, PostgreSQL, etc.
// This array lives only for the lifetime of the server process.
let goldPriceHistory: GoldPriceHistoryEntry[] = [
  { price: 72430, lastUpdated: new Date() }
];
let message: string = 'Welcome! All prices are for 24 Karat Gold per 10 grams.';
let carouselImages: string[] = [
    "https://placehold.co/600x400.png",
    "https://placehold.co/600x400.png",
    "https://placehold.co/600x400.png",
    "https://placehold.co/600x400.png",
    "https://placehold.co/600x400.png",
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
  // If the history is empty (can happen on dev server reload), initialize it
  if (goldPriceHistory.length === 0) {
    goldPriceHistory.push({
      price: 72430, // Start with the original default
      lastUpdated: new Date(Date.now() - 1000), // a bit in the past
    });
  }

  goldPriceHistory.push({
    price: newPrice,
    lastUpdated: new Date(),
  });

  // Keep only the last 5 updates
  if (goldPriceHistory.length > 5) {
    goldPriceHistory.shift();
  }
};

export const getGoldPrice = (): GoldPriceHistoryEntry => {
    if (goldPriceHistory.length === 0) {
        // This is a fallback for the edge case where the server has reloaded and no price has been set yet.
        return { price: 72430, lastUpdated: new Date().toISOString() as any };
    }
    const latest = goldPriceHistory[goldPriceHistory.length - 1];
    return {...latest, lastUpdated: latest.lastUpdated.toISOString() as any};
};
