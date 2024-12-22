import React, { useEffect, useState } from "react";
import { cn } from "~/utils/style";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

const calculateTimeLeft = (targetDate: Date) => {
  const difference = +targetDate - +new Date();
  const timeLeft = {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };

  return timeLeft;
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div
      className={cn(
        "font-archivo flex flex-row items-center justify-center gap-x-20 text-5xl text-white",
        className
      )}
    >
      {timeLeft.days > 0 && <CountdownLabel time={timeLeft.days} unit="Days" />}
      {(timeLeft.hours > 0 || timeLeft.days > 0) && (
        <CountdownLabel time={timeLeft.hours} unit="Hours" />
      )}
      {(timeLeft.hours > 0 || timeLeft.days > 0 || timeLeft.minutes > 0) && (
        <CountdownLabel time={timeLeft.minutes} unit="Minutes" />
      )}
      {(timeLeft.hours > 0 ||
        timeLeft.days > 0 ||
        timeLeft.minutes > 0 ||
        timeLeft.seconds > 0) && (
        <CountdownLabel time={timeLeft.seconds} unit="Seconds" />
      )}
    </div>
  );
};

const CountdownLabel = ({ time, unit }: { time: number; unit: string }) => {
  return (
    <div className="flex flex-col gap-y-5 text-center">
      <p
        className="font-digital text-9xl text-slate-400"
        suppressHydrationWarning
      >
        {time}
      </p>{" "}
      <p>{unit}</p>
    </div>
  );
};
