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

export const getGoldPriceHistory = (): GoldPriceHistoryEntry[] => {
  return [...goldPriceHistory].reverse(); // Return a reversed copy so latest is first
};

export const updateGoldPrice = (newPrice: number): void => {
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
    return goldPriceHistory[goldPriceHistory.length - 1];
};
