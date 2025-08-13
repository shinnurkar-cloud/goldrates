"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";

type PriceHistoryEntry = {
  price: number;
  lastUpdated: Date;
};

type PriceHistoryProps = {
  history: PriceHistoryEntry[];
};

export function PriceHistory({ history }: PriceHistoryProps) {
  const getTrend = (index: number) => {
    if (index >= history.length - 1) {
      return { icon: <Minus className="text-muted-foreground" />, color: "text-muted-foreground" };
    }
    const currentPrice = history[index].price;
    const previousPrice = history[index + 1].price;
    if (currentPrice > previousPrice) {
      return { icon: <ArrowUp className="text-green-500" />, color: "text-green-500" };
    }
    if (currentPrice < previousPrice) {
      return { icon: <ArrowDown className="text-red-500" />, color: "text-red-500" };
    }
    return { icon: <Minus className="text-muted-foreground" />, color: "text-muted-foreground" };
  };

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
              const { icon, color } = getTrend(index);
              const isLatest = index === 0;
              return (
                <TableRow key={entry.lastUpdated.toString()}>
                  <TableCell className={`text-left font-medium ${color}`}>
                    ₹{entry.price.toLocaleString('en-IN')}
                    {isLatest && <Badge variant="outline" className="ml-2">Latest</Badge>}
                  </TableCell>
                  <TableCell className="text-left text-muted-foreground">
                    {format(new Date(entry.lastUpdated), "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell className="flex justify-end items-center">
                    {icon}
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
