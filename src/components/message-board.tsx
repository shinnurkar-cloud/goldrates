'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

type MessageBoardProps = {
  initialMessage: string;
};

export function MessageBoard({ initialMessage }: MessageBoardProps) {
  const [message, setMessage] = useState(initialMessage);

  const fetchMessage = async () => {
    try {
        const res = await fetch('/api/message');
        if (res.ok) {
            const data = await res.json();
            if(data.message !== message) {
                setMessage(data.message);
            }
        }
    } catch(e) {
        console.error("Failed to fetch message", e);
    }
  }

  useEffect(() => {
    const interval = setInterval(fetchMessage, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [message]);

  return (
    <Card className="w-full bg-secondary/50 border-secondary">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-secondary-foreground flex-shrink-0" />
          <p className="text-sm text-secondary-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
