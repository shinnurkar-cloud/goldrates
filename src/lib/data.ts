type GoldPriceData = {
  price: number;
  lastUpdated: Date;
};

// This is a simple in-memory store.
// In a real application, you would use a database like Firestore, PostgreSQL, etc.
// This object lives only for the lifetime of the server process.
let goldPriceData: GoldPriceData = {
  price: 72430,
  lastUpdated: new Date(),
};

export const getGoldPrice = (): GoldPriceData => {
  return goldPriceData;
};

export const updateGoldPrice = (newPrice: number): GoldPriceData => {
  goldPriceData = {
    price: newPrice,
    lastUpdated: new Date(),
  };
  return goldPriceData;
};
