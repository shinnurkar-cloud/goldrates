'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';

type GoldPriceDisplayProps = {
  initialPrice: number;
  initialLastUpdated: string;
  apiKey?: string;
};

export function GoldPriceDisplay({ initialPrice, initialLastUpdated, apiKey }: GoldPriceDisplayProps) {
  const [price, setPrice] = useState(initialPrice);
  const [lastUpdated, setLastUpdated] = useState(initialLastUpdated);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Format date initially
    if (lastUpdated) {
      setFormattedDate(format(new Date(lastUpdated), "MMM d, yyyy 'at' h:mm a"));
    }
  }, [lastUpdated]);

  useEffect(() => {
    if (price !== initialPrice) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [price, initialPrice]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/price', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.price !== price) {
            setPrice(data.price);
            setLastUpdated(data.lastUpdated);
          }
        }
      } catch (error) {
        console.error('Failed to fetch price:', error);
      }
    };

    if (apiKey) {
      const interval = setInterval(fetchPrice, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [price, apiKey]);

  return (
    <Card className="w-full text-center shadow-lg border-primary/20 bg-card overflow-hidden">
      <CardHeader className="bg-primary/5 p-4">
        <CardTitle className="text-base font-medium text-primary-foreground/80">
          Gold Price (24k)
        </CardTitle>
        <CardDescription className="text-sm">per 10 grams</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div
          className={`text-5xl font-bold text-primary transition-transform duration-500 ease-in-out ${
            isAnimating ? 'scale-110' : 'scale-100'
          }`}
        >
          ₹{price.toLocaleString('en-IN')}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Last Updated: {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}
