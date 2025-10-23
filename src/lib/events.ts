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
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const eventDate = new Date(`${event.date}T00:00:00Z`);

  if (eventDate >= todayUTC) {
    return event.date;
  }

  if (!event.repeat) {
    return null;
  }

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

  const { frequency, byday, bymonthday, interval, until } = event.repeat;

  const rruleConfig: Partial<RRule.Options> = {
    interval,
    until: until ? new Date(`${until}T23:59:59Z`) : null,
    freq: frequencyMap[frequency],
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
      return weekdayMap[dayStr].nth(nth);
    }
    return null;
  })();

  if (bydayValue) {
    rruleConfig.byday = bydayValue;
  } else if (bymonthday) {
    rruleConfig.bymonthday = bymonthday;
  }

  const rule = new RRule(rruleConfig);
  const allOccurrences = rule.all();
  const nextDate = allOccurrences.find((date) => date >= todayUTC);

  if (nextDate) {
    return nextDate.toISOString().split("T")[0];
  }

  return null;
}
