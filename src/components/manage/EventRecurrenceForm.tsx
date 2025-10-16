"use client";

import { Event } from "@/lib/content";
import { useMemo } from "react";

type RepeatRule = Event["repeat"];

interface EventRecurrenceFormProps {
  value: RepeatRule | undefined;
  onChange: (value: RepeatRule | undefined) => void;
}

const weekDays = [
  { label: "Sun", value: "SU" },
  { label: "Mon", value: "MO" },
  { label: "Tue", value: "TU" },
  { label: "Wed", value: "WE" },
  { label: "Thu", value: "TH" },
  { label: "Fri", value: "FR" },
  { label: "Sat", value: "SA" },
];

const monthlyPositions = [
  { label: "first", value: 1 },
  { label: "second", value: 2 },
  { label: "third", value: 3 },
  { label: "fourth", value: 4 },
  { label: "last", value: -1 },
];

export function EventRecurrenceForm({ value, onChange }: EventRecurrenceFormProps) {
  // Derived state is often simpler than syncing with useEffect
  const frequency = useMemo(() => value?.frequency ?? "none", [value]);

  // Helper to update a specific field in the recurrence rule.
  // Using a function for the new value allows for clearing fields.
  const updateRule = (field: keyof RepeatRule, fieldValue: any) => {
    let newRule = {
      ...(value || { frequency: "weekly", interval: 1 }), // Provide a default base
      [field]: fieldValue,
    };
    // Clean up undefined fields
    if (fieldValue === undefined) {
      delete newRule[field];
    }
    onChange(newRule);
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFrequency = e.target.value as RepeatRule["frequency"] | "none";

    if (newFrequency === "none") {
      onChange(undefined);
    } else {
      // Reset to a sensible default when frequency changes
      onChange({
        frequency: newFrequency,
        interval: 1,
      });
    }
  };

  const handleWeekdayToggle = (dayValue: string) => {
    const currentByDay = Array.isArray(value?.byday) ? value.byday : [];
    const newByDay = currentByDay.includes(dayValue)
      ? currentByDay.filter((d) => d !== dayValue)
      : [...currentByDay, dayValue];

    // Sort the days to maintain a consistent order
    newByDay.sort(
      (a, b) => weekDays.findIndex((d) => d.value === a) - weekDays.findIndex((d) => d.value === b)
    );

    updateRule("byday", newByDay.length > 0 ? newByDay : undefined);
  };

  const handleMonthlyRuleChange = (ruleType: "day" | "weekday", pos?: number, day?: string) => {
    if (ruleType === "day") {
      onChange({
        ...value,
        bymonthday: 15, // Default to the 15th
        byday: undefined,
      });
    } else {
      // Default to the first Sunday if not specified
      const newPos = pos || 1;
      const newDay = day || "SU";
      onChange({
        ...value,
        bymonthday: undefined,
        byday: `${newPos}${newDay}`,
      });
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="frequency" className="font-medium text-gray-700">
          Repeats
        </label>
        <select
          id="frequency"
          name="frequency"
          value={frequency}
          onChange={handleFrequencyChange}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="none">One Time</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {frequency !== "none" && value && (
        <>
          {/* --- Interval --- */}
          <div className="flex items-center gap-2">
            <label htmlFor="interval" className="text-sm text-gray-600">
              Every
            </label>
            <input
              type="number"
              id="interval"
              name="interval"
              min="1"
              value={value.interval || 1}
              onChange={(e) => updateRule("interval", parseInt(e.target.value, 10) || 1)}
              className="w-16 p-1 border border-gray-300 rounded-md"
            />
            <span className="text-sm text-gray-600">{value.frequency}(s)</span>
          </div>

          {/* --- Weekly Options --- */}
          {value.frequency === "weekly" && (
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-600 mb-2">On days:</p>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleWeekdayToggle(day.value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      value.byday?.includes(day.value)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-100 border-gray-300"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- Monthly Options --- */}
          {value.frequency === "monthly" && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="monthly-on-day"
                  name="monthly-rule"
                  checked={!!value.bymonthday || !value.byday}
                  onChange={() => handleMonthlyRuleChange("day")}
                />
                <label htmlFor="monthly-on-day" className="text-sm text-gray-600">
                  On day
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={value.bymonthday || 15}
                  disabled={!value.bymonthday && !!value.byday}
                  onChange={(e) => updateRule("bymonthday", parseInt(e.target.value, 10))}
                  className="w-16 p-1 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>
              <p className="text-center text-xs text-gray-500">OR</p>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="monthly-on-weekday"
                  name="monthly-rule"
                  checked={typeof value.byday === "string"}
                  onChange={() => handleMonthlyRuleChange("weekday")}
                />
                <label htmlFor="monthly-on-weekday" className="text-sm text-gray-600">
                  On the
                </label>
                <select
                  disabled={typeof value.byday !== "string"}
                  className="p-1 border border-gray-300 rounded-md disabled:bg-gray-100"
                  value={parseInt(String(value.byday).match(/-?\d+/)?.[0] || "1", 10)}
                  onChange={(e) =>
                    handleMonthlyRuleChange(
                      "weekday",
                      parseInt(e.target.value, 10),
                      String(value.byday).slice(-2)
                    )
                  }
                >
                  {monthlyPositions.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
                <select
                  disabled={typeof value.byday !== "string"}
                  className="p-1 border border-gray-300 rounded-md disabled:bg-gray-100"
                  value={String(value.byday).slice(-2)}
                  onChange={(e) =>
                    handleMonthlyRuleChange(
                      "weekday",
                      parseInt(String(value.byday).match(/-?\d+/)?.[0] || "1", 10),
                      e.target.value
                    )
                  }
                >
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* --- End Date --- */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <label htmlFor="until" className="text-sm font-medium text-gray-700">
                Ends on
              </label>
              <input
                type="date"
                id="until"
                name="until"
                value={value.until || ""}
                onChange={(e) => updateRule("until", e.target.value || undefined)}
                className="p-1 border border-gray-300 rounded-md"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 pl-2">
              Leave blank for the event to repeat forever.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
