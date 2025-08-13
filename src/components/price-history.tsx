"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";

type PriceHistoryEntry = {
  price: number;
  lastUpdated: Date | string;
};

type PriceHistoryProps = {
  initialHistory: PriceHistoryEntry[];
  apiKey?: string;
};

export function PriceHistory({ initialHistory, apiKey }: PriceHistoryProps) {
  const [history, setHistory] = useState<PriceHistoryEntry[]>(initialHistory);

  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/price/history');
            if (res.ok) {
                const data = await res.json();
                // Simple check to see if data is different
                if (JSON.stringify(data) !== JSON.stringify(history)) {
                    setHistory(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch price history:', error);
        }
    };
    
    // We don't need the API key for history, but this ensures polling starts
    // at the same time as the price display.
    const interval = setInterval(fetchHistory, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);

  }, [history, apiKey]);

  const getTrend = (index: number) => {
    if (index >= history.length - 1) {
      return { icon: <Minus className="h-4 w-4 text-muted-foreground" />, color: "text-muted-foreground", difference: null };
    }
    const currentPrice = history[index].price;
    const previousPrice = history[index + 1].price;
    const difference = currentPrice - previousPrice;

    if (difference > 0) {
      return { icon: <ArrowUp className="h-4 w-4 text-green-500" />, color: "text-green-500", difference };
    }
    if (difference < 0) {
      return { icon: <ArrowDown className="h-4 w-4 text-red-500" />, color: "text-red-500", difference };
    }
    return { icon: <Minus className="h-4 w-4 text-muted-foreground" />, color: "text-muted-foreground", difference: 0 };
  };
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Price</TableHead>
              <TableHead className="text-left">Date</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry, index) => {
              const { icon, color, difference } = getTrend(index);
              const isLatest = index === 0;
              return (
                <TableRow key={entry.lastUpdated.toString()}>
                  <TableCell className={`text-left font-medium ${color}`}>
                    ₹{entry.price.toLocaleString('en-IN')}
                    {isLatest && <Badge variant="outline" className="ml-2">Latest</Badge>}
                  </TableCell>
                  <TableCell className="text-left text-muted-foreground">
                    {isClient ? format(new Date(entry.lastUpdated), "MMM d, h:mm a") : ''}
                  </TableCell>
                  <TableCell className="flex justify-end items-center gap-1">
                    {icon}
                    {difference !== null && (
                      <span className={`text-xs ${color}`}>
                        {difference !== 0 ? `₹${Math.abs(difference).toLocaleString('en-IN')}`: ''}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
