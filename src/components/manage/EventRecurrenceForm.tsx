"use client";
import { Event } from "@/lib/content";
import { useState, useEffect } from "react";

interface EventRecurrenceFormProps {
  recurrence: Event["repeat"];
  onChange: (recurrence: Event["repeat"]) => void;
  startDate: string;
}

export default function EventRecurrenceForm({
  recurrence,
  onChange,
  startDate,
}: EventRecurrenceFormProps) {
  const handleFrequencyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onChange({
      ...(recurrence || {}),
      frequency: e.target.value as any,
    });
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...(recurrence || {}),
      interval: parseInt(e.target.value, 10),
    });
  };

  const handleUntilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...(recurrence || {}),
      until: e.target.value,
    });
  };

  const handleByDayToggle = (day: string) => {
    const byday = (recurrence?.byday as string[]) || [];
    const newByday = byday.includes(day)
      ? byday.filter((d) => d !== day)
      : [...byday, day];
    onChange({
      ...(recurrence || {}),
      byday: newByday,
    });
  };

  const handleByMonthDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...(recurrence || {}),
      bymonthday: parseInt(e.target.value, 10),
    });
  };

  const handleEndsOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEndsOn(e.target.value);
    if (e.target.value === "never") {
      onChange({
        ...(recurrence || {}),
        until: undefined,
      });
    }
  };

  const [endsOn, setEndsOn] = useState("never");

  const [monthlyType, setMonthlyType] = useState("day");

  const handleMonthlyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonthlyType(e.target.value);
    if (e.target.value === "day") {
      onChange({
        ...(recurrence || {}),
        byday: undefined,
        bymonthday: new Date(startDate).getDate(),
      });
    } else {
      onChange({
        ...(recurrence || {}),
        bymonthday: undefined,
        byday: "1SU",
      });
    }
  };

  const handleMonthlyNthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nth = parseInt(e.target.value, 10);
    const byday = (recurrence?.byday as string[]) || [];
    const day = byday.length > 0 ? byday[0].slice(-2) : "SU";
    onChange({
      ...(recurrence || {}),
      byday: `${nth}${day}`,
      bymonthday: undefined,
    });
  };

  const handleMonthlyDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const day = e.target.value;
    const byday = (recurrence?.byday as string) || "";
    const nth = byday.slice(0, -2);
    onChange({
      ...(recurrence || {}),
      byday: `${nth}${day}`,
      bymonthday: undefined,
    });
  };

  const getSummary = () => {
    if (!recurrence) return "";

    const { frequency, interval, byday, bymonthday, until } = recurrence;
    let summary = `Repeats every ${interval} ${frequency.replace("ly", "")}s`;

    if (frequency === "weekly" && byday && (byday as string[]).length > 0) {
      summary += ` on ${(byday as string[]).join(", ")}`;
    }

    if (frequency === "monthly" && bymonthday) {
      summary += ` on day ${bymonthday}`;
    }

    if (until) {
      summary += `, until ${until}`;
    }

    return summary;
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={!!recurrence}
          onChange={(e) =>
            onChange(
              e.target.checked
                ? {
                    frequency: "monthly",
                    interval: 1,
                    bymonthday: new Date(startDate).getDate(),
                  }
                : undefined
            )
          }
        />
        <span>Repeats</span>
      </label>

      {recurrence && (
        <div className="space-y-4 p-4 border rounded-md">
          <div className="flex items-center space-x-2">
            <span>Every</span>
            <input
              type="number"
              value={recurrence.interval || 1}
              onChange={handleIntervalChange}
              className="w-16 input"
            />
            <select
              value={recurrence.frequency}
              onChange={handleFrequencyChange}
              className="input"
            >
              <option value="daily">day(s)</option>
              <option value="weekly">week(s)</option>
              <option value="monthly">month(s)</option>
              <option value="yearly">year(s)</option>
            </select>
          </div>

          {recurrence.frequency === "weekly" && (
            <div className="flex items-center space-x-2">
              <span>on</span>
              <div className="flex space-x-2">
                {[
                  { label: "S", value: "SU" },
                  { label: "M", value: "MO" },
                  { label: "T", value: "TU" },
                  { label: "W", value: "WE" },
                  { label: "T", value: "TH" },
                  { label: "F", value: "FR" },
                  { label: "S", value: "SA" },
                ].map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleByDayToggle(day.value)}
                    className={`w-8 h-8 rounded-full ${((recurrence.byday as string[]) || []).includes(day.value)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                      }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recurrence.frequency === "monthly" && (
            <div className="flex items-center space-x-2">
              <span>on</span>
              <select value={monthlyType} onChange={handleMonthlyTypeChange} className="input">
                <option value="day">day</option>
                <option value="the">the</option>
              </select>
              {monthlyType === "day" && (
                <input
                  type="number"
                  value={recurrence.bymonthday || ""}
                  onChange={handleByMonthDayChange}
                  className="w-16 input"
                />
              )}
              {monthlyType === "the" && (
                <div className="flex items-center space-x-2">
                  <select
                    value={((recurrence.byday as string) || "").slice(0, -2)}
                    onChange={handleMonthlyNthChange}
                    className="input"
                  >
                    <option value="1">First</option>
                    <option value="2">Second</option>
                    <option value="3">Third</option>
                    <option value="4">Fourth</option>
                    <option value="-1">Last</option>
                  </select>
                  <select
                    value={((recurrence.byday as string) || "").slice(-2)}
                    onChange={handleMonthlyDayChange}
                    className="input"
                  >
                    <option value="SU">Sunday</option>
                    <option value="MO">Monday</option>
                    <option value="TU">Tuesday</option>
                    <option value="WE">Wednesday</option>
                    <option value="TH">Thursday</option>
                    <option value="FR">Friday</option>
                    <option value="SA">Saturday</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span>Ends</span>
            <select value={endsOn} onChange={handleEndsOnChange} className="input">
              <option value="never">Never</option>
              <option value="on">On</option>
            </select>
            {endsOn === "on" && (
              <input
                type="date"
                value={recurrence.until || ""}
                onChange={handleUntilChange}
                className="input"
              />
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <p className="text-sm text-gray-500">{getSummary()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
