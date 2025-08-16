'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

type PriceHistoryEntry = {
  price: number;
  lastUpdated: Date | string;
};

type GoldPriceDisplayProps = {
  initialPrice: number;
  initialLastUpdated: string;
};

export function GoldPriceDisplay({ initialPrice, initialLastUpdated }: GoldPriceDisplayProps) {
  const [price, setPrice] = useState(initialPrice);
  const [lastUpdated, setLastUpdated] = useState(initialLastUpdated);
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');
  const initialPriceRef = useRef(initialPrice);

  const fetchPriceData = async () => {
    try {
      const [priceRes, historyRes] = await Promise.all([
        fetch('/api/price'),
        fetch('/api/price/history')
      ]);

      if (priceRes.ok) {
        const priceData = await priceRes.json();
        if (priceData.price !== price) {
          setPrice(priceData.price);
          setLastUpdated(priceData.lastUpdated);
        }
      }
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Failed to fetch price data', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchPriceData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [price]);

  useEffect(() => {
    if (lastUpdated) {
      setFormattedDate(format(new Date(lastUpdated), "MMM d, yyyy 'at' h:mm a"));
    }
  }, [lastUpdated]);

  useEffect(() => {
    if (price !== initialPriceRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      initialPriceRef.current = price;
      return () => clearTimeout(timer);
    }
  }, [price]);

  const getTrend = () => {
    if (history.length < 2) {
      return { icon: <Minus className="h-4 w-4 text-muted-foreground" />, color: "text-muted-foreground", difference: null };
    }
    const currentEntry = history[history.length - 1];
    const previousEntry = history[history.length - 2];
    
    if (!currentEntry || !previousEntry) {
       return { icon: <Minus className="h-4 w-4 text-muted-foreground" />, color: "text-muted-foreground", difference: null };
    }

    const difference = currentEntry.price - previousEntry.price;

    if (difference > 0) {
      return { icon: <ArrowUp className="h-4 w-4 text-green-500" />, color: "text-green-500", difference };
    }
    if (difference < 0) {
      return { icon: <ArrowDown className="h-4 w-4 text-red-500" />, color: "text-red-500", difference };
    }
    return { icon: <Minus className="h-4 w-4 text-muted-foreground" />, color: "text-muted-foreground", difference: 0 };
  };

  const trend = getTrend();

  return (
    <Card className="w-full text-center shadow-lg border-primary/20 bg-card overflow-hidden">
      <CardHeader className="bg-primary/5 p-4">
        <CardTitle className="text-base font-medium text-white">
          Gold Price (24k)
        </CardTitle>
        <CardDescription className="text-sm">per 10 grams</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-3">
            <div
              className={`text-5xl font-bold text-primary transition-transform duration-500 ease-in-out ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              ₹{price.toLocaleString('en-IN')}
            </div>
            {trend.difference !== null && (
                <div className={`flex items-center gap-1 text-lg font-medium ${trend.color}`}>
                    {trend.icon}
                    <span>
                        ₹{Math.abs(trend.difference).toLocaleString('en-IN')}
                    </span>
                </div>
            )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Last Updated: {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}
