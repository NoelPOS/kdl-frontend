import React from "react";

interface TimeHeader {
  key: number;
  startTime: string;
  endTime: string;
}

interface TimeHeadersProps {
  numCols: number;
  timeHeaders: TimeHeader[];
}

const TimeHeaders: React.FC<TimeHeadersProps> = ({ numCols, timeHeaders }) => (
  <div className="relative mb-2">
    <div
      className="grid gap-0 p-5"
      style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}
    >
      {timeHeaders.map(({ key, startTime, endTime }) => (
        <div key={key} className="h-8 relative">
          {startTime && (
            <div className="absolute -left-6 top-1 text-sm font-medium text-gray-600 bg-white px-1">
              {startTime}
            </div>
          )}
          {endTime && (
            <div className="absolute -right-6 top-1 text-sm font-medium text-gray-600 bg-white px-1">
              {endTime}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default TimeHeaders;
