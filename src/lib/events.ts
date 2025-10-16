import { RRule } from "rrule";
import type { Event } from "./content";

/**
 * Calculates the next occurrence of an event based on its recurrence rule.
 * If the event's date is in the future, it returns the original date.
 * If the event is recurring and its date is in the past, it finds the next
 * valid date.
 *
 * @param event The event object.
 * @returns The date string for the next occurrence, or null if there are no more occurrences.
 */
export function getNextOccurrence(event: Event): string | null {
  const now = new Date();
  // Create a UTC date for the beginning of today to ensure consistent comparisons
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const eventDate = new Date(`${event.date}T00:00:00Z`); // Treat the date string as UTC

  // If the event date is in the future, no need to reschedule.
  if (eventDate >= todayUTC) {
    return event.date;
  }

  // If it's a non-recurring event in the past, it's over.
  if (!event.repeat) {
    return null;
  }

  // Map string frequency to RRule frequency constant.
  const frequencyMap = {
    daily: RRule.DAILY,
    weekly: RRule.WEEKLY,
    monthly: RRule.MONTHLY,
    yearly: RRule.YEARLY,
  };

  const weekdayMap: { [key: string]: any } = {
    SU: RRule.SU,
    MO: RRule.MO,
    TU: RRule.TU,
    WE: RRule.WE,
    TH: RRule.TH,
    FR: RRule.FR,
    SA: RRule.SA,
  };

  const { frequency, byday, bymonthday, ...rruleOptions } = event.repeat;

  const rruleConfig: Partial<RRule.Options> = {
    ...rruleOptions,
    // RRule expects the 'until' property to be a Date object, not a string.
    // We also convert it to UTC to match our other date objects.
    until: rruleOptions.until ? new Date(`${rruleOptions.until}T23:59:59Z`) : null,
    freq: frequencyMap[event.repeat.frequency],
    dtstart: eventDate,
  };

  const bydayValue = (() => {
    if (!byday) return null;
    if (Array.isArray(byday)) {
      return byday.map((d) => weekdayMap[d]);
    }
    if (typeof byday === "string") {
      const dayStr = byday.slice(-2);
      const nth = parseInt(byday.slice(0, -2), 10);
      return weekdayMap[dayStr]?.nth(nth);
    }
    return null;
  })();

  if (bydayValue) {
    rruleConfig.byday = bydayValue;
  } else if (bymonthday) {
    rruleConfig.bymonthday = bymonthday;
  }

  // It's a recurring event in the past, so calculate the next occurrence.
  // --- DEVELOPER LOG ---
  // Log the configuration object to see what's causing the 'byday' error.
  console.log("rruleConfig for event:", event.slug, rruleConfig);

  const rule = new RRule(rruleConfig);

  // Get all occurrences from the start date until the end of the recurrence.
  const allOccurrences = rule.all();
  // Find the first occurrence that is on or after today.
  const nextDate = allOccurrences.find((date) => date >= todayUTC);

  // If a next date exists and it's before the 'until' date, return it.
  if (nextDate) {
    return nextDate.toISOString().split("T")[0];
  }

  // No more occurrences.
  return null;
}
