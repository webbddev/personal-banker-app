'use client';

import * as React from "react";
import {
  Widget,
  WidgetContent,
  WidgetTitle,
} from "@/components/ui/widget";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const cities = [
  { name: "Chisinau", timezone: "Europe/Chisinau" },
  { name: "London", timezone: "Europe/London" },
  { name: "Moscow", timezone: "Europe/Moscow" },
  { name: "New York", timezone: "America/New_York" },
  { name: "Tokyo", timezone: "Asia/Tokyo" },
];

export function WorldClock({ className }: { className?: string }) {
  const [times, setTimes] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      cities.forEach((city) => {
        try {
          newTimes[city.name] = new Intl.DateTimeFormat("en-US", {
            timeZone: city.timezone,
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }).format(new Date());
        } catch (e) {
          console.error(`Error formatting time for ${city.timezone}`, e);
          newTimes[city.name] = "Error";
        }
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Widget className={cn("h-auto w-full border-none shadow-none bg-transparent p-0", className)}>
      <WidgetContent className="flex-col justify-between p-0 gap-1 items-stretch">
        {cities.map((city) => (
          <div key={city.name} className="flex w-full items-center justify-between gap-2 px-3 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-all duration-200 group/clock">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Label className="text-[13px] font-medium text-sidebar-foreground/80 cursor-pointer group-hover/clock:text-sidebar-foreground transition-colors">
                {city.name}
              </Label>
            </div>
            <WidgetTitle className="text-[13px] font-semibold tabular-nums text-sidebar-foreground/90 group-hover/clock:text-sidebar-foreground transition-colors">
              {times[city.name] || "--:--"}
            </WidgetTitle>
          </div>
        ))}
      </WidgetContent>
    </Widget>
  );
}
