'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

type PriceCalculatorProps = {
  currentPrice: number;
};

export function PriceCalculator({ currentPrice }: PriceCalculatorProps) {
  const [weight, setWeight] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(newWeight)) {
        setWeight(newWeight);
        const weightValue = parseFloat(newWeight);
        if (!isNaN(weightValue) && weightValue > 0) {
            // Price is per 10 grams
            const result = (weightValue / 10) * currentPrice;
            setCalculatedPrice(result);
        } else {
            setCalculatedPrice(null);
        }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Price Calculator
        </CardTitle>
        <CardDescription>Calculate the price based on weight.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="weight">Weight (grams)</Label>
          <Input
            id="weight"
            type="text"
            inputMode="decimal"
            placeholder="e.g., 5.5"
            value={weight}
            onChange={handleWeightChange}
          />
        </div>
        {calculatedPrice !== null && (
          <div className="p-4 bg-secondary/50 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Calculated Price</p>
            <p className="text-2xl font-bold text-primary">
              ₹{calculatedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
