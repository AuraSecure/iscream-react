import { getNextOccurrence } from "./events";
import type { Event } from "./content";

describe("getNextOccurrence", () => {
  // We'll set a fixed "today" for all tests to make them deterministic.
  // Let's pretend today is July 15, 2024.
  const today = new Date("2024-07-15T12:00:00.000Z");

  beforeAll(() => {
    // Tell Jest to use fake timers
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterAll(() => {
    // Restore real timers
    jest.useRealTimers();
  });

  it("should return the original date for a non-recurring event in the future", () => {
    const futureEvent: Event = {
      slug: "future-event",
      title: "Future Event",
      description: "",
      date: "2024-08-01",
    };
    expect(getNextOccurrence(futureEvent)).toBe("2024-08-01");
  });

  it("should return null for a non-recurring event in the past", () => {
    const pastEvent: Event = {
      slug: "past-event",
      title: "Past Event",
      description: "",
      date: "2024-07-01",
    };
    expect(getNextOccurrence(pastEvent)).toBeNull();
  });

  it("should return the original date for an event happening today", () => {
    const todayEvent: Event = {
      slug: "today-event",
      title: "Today's Event",
      description: "",
      date: "2024-07-15",
    };
    expect(getNextOccurrence(todayEvent)).toBe("2024-07-15");
  });

  it("should fast-forward a past yearly recurring event to the next valid occurrence", () => {
    const pastRecurringEvent: Event = {
      slug: "past-recurring",
      title: "Past Recurring Event",
      description: "",
      date: "2020-10-31", // Original start date is in the past
      repeat: {
        frequency: "yearly",
        interval: 1,
        until: "2028-10-31",
      },
    };

    // Since "today" is July 15, 2024, the next occurrence in 2024 has not happened yet.
    // But the logic should find the next valid date from the start.
    // The rule.all() will generate [2020, 2021, 2022, 2023, 2024, 2025, ...].
    // The first one >= today (2024-07-15) is 2024-10-31.
    // Let's assume today is Nov 1, 2024 to test the jump to the next year.
    jest.setSystemTime(new Date("2024-11-01T12:00:00.000Z"));
    expect(getNextOccurrence(pastRecurringEvent)).toBe("2025-10-31");

    // Reset time for other tests
    jest.setSystemTime(today);
  });

  it("should return null if a recurring event's end date has passed", () => {
    const expiredRecurringEvent: Event = {
      slug: "expired-recurring",
      title: "Expired Recurring Event",
      description: "",
      date: "2020-07-01",
      repeat: {
        frequency: "yearly",
        interval: 1,
        until: "2023-07-01", // The recurrence ended in the past
      },
    };
    expect(getNextOccurrence(expiredRecurringEvent)).toBeNull();
  });

  it("should calculate the next date for a weekly recurring event", () => {
    const weeklyEvent: Event = {
      slug: "weekly-event",
      title: "Weekly Event",
      description: "",
      date: "2024-07-01", // A Monday
      repeat: {
        frequency: "weekly",
        interval: 1,
        byday: ["WE"], // Repeats on Wednesdays
      },
    };
    // "today" is Monday July 15, 2024. The next Wednesday is July 17.
    expect(getNextOccurrence(weeklyEvent)).toBe("2024-07-17");
  });

  it("should calculate the next date for a monthly recurring event by weekday", () => {
    const monthlyEvent: Event = {
      slug: "monthly-event",
      title: "Monthly Event",
      description: "",
      date: "2024-01-01",
      repeat: {
        frequency: "monthly",
        interval: 1,
        byday: "3FR", // Repeats on the third Friday of the month
      },
    };
    // "today" is Monday July 15, 2024. The third Friday of July is July 19.
    expect(getNextOccurrence(monthlyEvent)).toBe("2024-07-19");
  });

  it("should calculate the next date for a monthly recurring event by day of the month", () => {
    const monthlyEvent: Event = {
      slug: "monthly-day-event",
      title: "Monthly Day Event",
      description: "",
      date: "2024-01-10",
      repeat: {
        frequency: "monthly",
        interval: 1,
        bymonthday: 10, // Repeats on the 10th of the month
      },
    };
    // "today" is Monday July 15, 2024. The 10th has passed, so the next one is August 10.
    expect(getNextOccurrence(monthlyEvent)).toBe("2024-08-10");
  });
});
