"use client";

import { useState, useEffect } from "react";
import { Send, LineChart, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  content: string;
  role: "user" | "assistant";
};

type MarketData = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

const WATCHED_SYMBOLS = ["^GSPC", "^DJI", "^IXIC", "GC=F", "BTC-USD"];
const SYMBOL_NAMES: { [key: string]: string } = {
  "^GSPC": "S&P 500",
  "^DJI": "Dow Jones",
  "^IXIC": "NASDAQ",
  "GC=F": "Gold",
  "BTC-USD": "Bitcoin",
};

// Mock data generator
function getMockMarketData(symbol: string): MarketData {
  const basePrice = {
    "^GSPC": 4500,
    "^DJI": 35000,
    "^IXIC": 14000,
    "GC=F": 1900,
    "BTC-USD": 45000,
  }[symbol] || 100;

  const change = (Math.random() * 2 - 1) * (basePrice * 0.02);
  const changePercent = (change / basePrice) * 100;

  return {
    symbol,
    price: basePrice + change,
    change,
    changePercent,
  };
}

function getMockDetailedAnalysis(symbol: string): string {
  const data = getMockMarketData(symbol);
  const volume = Math.floor(Math.random() * 1000000) + 500000;
  const marketCap = data.price * volume;
  const dayLow = data.price * 0.98;
  const dayHigh = data.price * 1.02;
  const weekLow = data.price * 0.9;
  const weekHigh = data.price * 1.1;

  const stats = [
    `Current Price: $${data.price.toFixed(2)}`,
    `Day Range: $${dayLow.toFixed(2)} - $${dayHigh.toFixed(2)}`,
    `52 Week Range: $${weekLow.toFixed(2)} - $${weekHigh.toFixed(2)}`,
    `Volume: ${volume.toLocaleString()}`,
    `Market Cap: $${(marketCap / 1e9).toFixed(2)}B`,
  ].join('\n');
  
  return `Analysis for ${SYMBOL_NAMES[symbol] || symbol}:\n${stats}`;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your market advisor. I can provide market data and analysis for major indices and assets. Try asking about the S&P 500, Dow Jones, NASDAQ, Gold, or Bitcoin!",
    },
  ]);
  const [input, setInput] = useState("");
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);

  const updateMarketData = async () => {
    setLoading(true);
    const data = WATCHED_SYMBOLS.map((symbol) => getMockMarketData(symbol));
    setMarketData(data);
    setLoading(false);
  };

  useEffect(() => {
    updateMarketData();
    const interval = setInterval(updateMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Check if the user is asking about a specific market
    const lowercaseInput = input.toLowerCase();
    let response = "";

    for (const [symbol, name] of Object.entries(SYMBOL_NAMES)) {
      if (lowercaseInput.includes(name.toLowerCase())) {
        response = getMockDetailedAnalysis(symbol);
        break;
      }
    }

    if (!response) {
      response = "I can provide detailed analysis for S&P 500, Dow Jones, NASDAQ, Gold, and Bitcoin. Please ask about one of these markets!";
    }

    const botMessage: Message = {
      role: "assistant",
      content: response,
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-4xl h-[800px] flex flex-col">
        <CardHeader className="border-b p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <LineChart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle>Market Advisor</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Market insights and analysis
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={updateMarketData}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-4 mt-6">
            {marketData.map((data) => (
              <Card key={data.symbol} className="p-4">
                <p className="text-sm font-medium">{SYMBOL_NAMES[data.symbol]}</p>
                <p className="text-lg font-bold">${data.price.toFixed(2)}</p>
                <p className={`text-sm ${data.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {data.change >= 0 ? "+" : ""}
                  {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
                </p>
              </Card>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 p-6">
          <ScrollArea className="flex-1 pr-4">
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              placeholder="Ask about market conditions, specific indices, or assets..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}