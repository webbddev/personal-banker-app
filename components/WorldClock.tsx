'use client';

import * as React from "react";
import { Widget, WidgetContent } from "@/components/ui/widget";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const cities = [
  { name: "Chisinau", timezone: "Europe/Chisinau" },
  { name: "London", timezone: "Europe/London" },
  { name: "Moscow", timezone: "Europe/Moscow" },
  { name: "Frankfurt", timezone: "Europe/Berlin" },
  { name: "New York", timezone: "America/New_York" },
  { name: "Tokyo", timezone: "Asia/Tokyo" },
];

const CityClock = React.memo(({ name, timezone, time }: { name: string; timezone: string; time: Date }) => {
  const cityTime = React.useMemo(() => {
    return new Date(time.toLocaleString("en-US", { timeZone: timezone }));
  }, [time, timezone]);

  const hours = cityTime.getHours() % 12;
  const minutes = cityTime.getMinutes();
  const seconds = cityTime.getSeconds();

  const hDeg = ((hours + minutes / 60) / 12) * 360;
  const mDeg = ((minutes + seconds / 60) / 60) * 360;
  const sDeg = (seconds / 60) * 360;

  return (
    <Widget 
      className="group relative overflow-hidden rounded-[1.25rem] bg-black/[0.03] dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/5 transition-transform mx-auto "
      style={{
        width: 'var(--clock-size, 120px)',
        height: 'var(--clock-size, 120px)'
      }}
    >
      <WidgetContent className="flex flex-col items-center justify-center p-0 h-full">
        {/* SIZE REGULATION: The face size is controlled by the multiplier (0.62) in the div below */}
        <div className="absolute top-[8%] text-[min(8px,calc(var(--clock-size,120px)*0.065))] font-bold uppercase tracking-[0.1em] text-foreground/40 text-center w-full truncate px-1">
          {name}
        </div>
        
        <div 
          className="relative flex items-center justify-center"
          style={{
            width: 'calc(var(--clock-size, 120px) * 0.60)',
            height: 'calc(var(--clock-size, 120px) * 0.60)'
          }}
        >
          {[...Array(12)].map((_, i) => {
            const angle = ((i + 1) / 12) * 360;
            const rad = (angle * Math.PI) / 180;
            return (
              <div
                key={i}
                className="absolute text-[min(6px,calc(var(--clock-size,120px)*0.045))] font-bold text-foreground/15"
                style={{ 
                  transform: `translate(calc(sin(${rad}rad) * var(--clock-size, 120px) * 0.26), calc(-1 * cos(${rad}rad) * var(--clock-size, 120px) * 0.26))` 
                }}
              >
                {i + 1}
              </div>
            );
          })}

          <div className="relative size-full">
            <div
              className="absolute bottom-1/2 left-1/2 w-[2px] origin-bottom rounded-full bg-foreground/90 transition-transform duration-500 ease-out"
              style={{ 
                height: 'calc(var(--clock-size, 120px) * 0.18)',
                transform: `translateX(-50%) rotate(${hDeg}deg)` 
              }}
            />
            <div
              className="absolute bottom-1/2 left-1/2 w-[1.5px] origin-bottom rounded-full bg-foreground/60 transition-transform duration-500 ease-out"
              style={{ 
                height: 'calc(var(--clock-size, 120px) * 0.25)',
                transform: `translateX(-50%) rotate(${mDeg}deg)` 
              }}
            />
            <div
              className="absolute bottom-1/2 left-1/2 w-[1px] origin-bottom rounded-full bg-emerald-500/80 z-10"
              style={{ 
                height: 'calc(var(--clock-size, 120px) * 0.28)',
                transform: `translateX(-50%) rotate(${sDeg}deg)` 
              }}
            />
            <div className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-sm ring-[1px] ring-emerald-500/10 z-20" />
          </div>
        </div>

        <div className="absolute bottom-[8%] text-[min(9px,calc(var(--clock-size,120px)*0.075))] tabular-nums font-semibold text-foreground/70">
          {cityTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </div>
      </WidgetContent>
    </Widget>
  );
});

CityClock.displayName = 'CityClock';

export function WorldClock({ className, dialSize = '120px' }: { className?: string; dialSize?: string }) {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div 
        className={cn("grid grid-cols-2 gap-2 p-1 w-full justify-items-center mx-auto", className)}
        style={{ '--clock-size': dialSize } as React.CSSProperties}
      >
        {cities.map((city) => (
          <div 
            key={city.name}
            className="rounded-[1.25rem] bg-black/[0.03] dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/5 animate-pulse"
            style={{ width: dialSize, height: dialSize }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn("grid grid-cols-2 gap-2 p-1 w-full justify-items-center mx-auto", className)}
      style={{ '--clock-size': dialSize } as React.CSSProperties}
    >
      {cities.map((city) => (
        <CityClock key={city.name} name={city.name} timezone={city.timezone} time={now} />
      ))}
    </div>
  );
}
