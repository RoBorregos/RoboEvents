// Fill the days array with the days specified in the rrule.

import { RouterOutputs } from "./api";

// days[0] = Sunday, days[1] = Monday, etc.
export const getDays = (rrule: string) => {
  const days = [false, false, false, false, false, false, false];

  const pattern = /BYDAY=([^;]*);/;

  const dates = rrule.match(pattern);

  if (dates && dates[1]) {
    dates[1].split(",").forEach((day) => {
      switch (day) {
        case "SU":
          days[0] = true;
          break;
        case "MO":
          days[1] = true;
          break;
        case "TU":
          days[2] = true;
          break;
        case "WE":
          days[3] = true;
          break;
        case "TH":
          days[4] = true;
          break;
        case "FR":
          days[5] = true;
          break;
        case "SA":
          days[6] = true;
          break;
      }
    });
  }

  return days;
};

// Generate the new dates, return only the object to add in nested query.
// RRule format:
// RRULE:FREQ=WEEKLY;BYDAY=MO,WE,TH;UNTIL=20230217T180000Z
// startTime: only differs from endTime in the hour. rrule indicates the end of repetition.
export const generateDates = (
  startTime: Date,
  endTime: Date,
  rrule: string | null | undefined
) => {
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();

  if (rrule) {
    const days = getDays(rrule);

    const individualDates = [];

    const iterateDay = new Date(startTime);
    const repEnd = getEndDate(rrule);

    while (iterateDay <= repEnd) {
        if (days[iterateDay.getDay()]) {
            const newStart = new Date(iterateDay);
            const newEnd = new Date(iterateDay);
            newEnd.setHours(endHour);
            newEnd.setMinutes(endMinutes);
            individualDates.push({
            start: newStart,
            end: newEnd,
            });
        }
    
        iterateDay.setDate(iterateDay.getDate() + 1);
    }

    return individualDates;
  } else {
    return {
      start: startTime,
      end: endTime,
    };
  }
};

export const getEndDate = (rrule: string) => {
    const pattern = /UNTIL=([^;]*);/;
    const endDate = rrule.match(pattern);

    if (endDate && endDate[1]) {
        const year = endDate[1].slice(0, 4);
        const month = endDate[1].slice(4, 6);
        const day = endDate[1].slice(6, 8);
        return new Date(`${year}-${month}-${day}`);
    }

    throw new Error("Invalid day in rrule.");
}

export const getDefaultTime = ({
  startDate,
}: {
  startDate: RouterOutputs["event"]["getEventStart"] | undefined | null;
}) => {
  let baseDate;
  if (!startDate) {
    baseDate = new Date();
  } else {
    baseDate = new Date(startDate.start);
  }

  const maxDay = new Date(
    baseDate.getFullYear() + 2,
    baseDate.getMonth(),
    baseDate.getDate()
  );
  const minDay = new Date(
    baseDate.getFullYear() - 2,
    baseDate.getMonth(),
    baseDate.getDate()
  );

  const defaultDate =
    baseDate.getFullYear().toString() +
    "-" +
    (baseDate.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    baseDate.getDate().toString().padStart(2, "0");
  const defaultMax =
    maxDay.getFullYear().toString() +
    "-" +
    (maxDay.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    maxDay.getDate().toString().padStart(2, "0");
  const defaultMin =
    minDay.getFullYear().toString() +
    "-" +
    (minDay.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    minDay.getDate().toString().padStart(2, "0");

  const hours = String(baseDate.getHours()).padStart(2, "0");
  const minutes = String(baseDate.getMinutes()).padStart(2, "0");
  const defaultStartTime = `${hours}:${minutes}`;

  let defaultEndTime;

  if (startDate) {
    const dateEnd = new Date(startDate.end);
    const hoursEnd = dateEnd.getHours().toString().padStart(2, "0");
    const minutesEnd = dateEnd.getMinutes().toString().padStart(2, "0");
    defaultEndTime = `${hoursEnd}:${minutesEnd}`;
  } else {
    defaultEndTime = defaultStartTime;
  }

  return {
    defaultDate,
    defaultMax,
    defaultMin,
    defaultStartTime,
    defaultEndTime,
  };
};