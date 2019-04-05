import { format, parse } from '@/utils/fecha';
import { isDate, isNumber, isString, isObject } from '@/utils/_';

const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default class Locale {
  constructor({ id, firstDayOfWeek, masks }) {
    this.id = id;
    this.firstDayOfWeek = firstDayOfWeek || 1;
    this.masks = masks;
    this.dayNames = this.getDayNames('long');
    this.dayNamesShort = this.getDayNames('short');
    this.dayNamesShorter = this.dayNamesShort.map(s => s.substring(0, 2));
    this.dayNamesNarrow = this.getDayNames('narrow');
    this.monthNames = this.getMonthNames('long');
    this.monthNamesShort = this.getMonthNames('short');
    this.monthData = {};
    // Bind methods
    this.parse = this.parse.bind(this);
    this.format = this.format.bind(this);
    this.toDate = this.toDate.bind(this);
  }

  parse(dateStr, mask) {
    return parse(dateStr, mask || this.masks.L, this);
  }

  format(date, mask) {
    return format(date, mask || this.masks.L, this);
  }

  toDate(d, mask) {
    if (isDate(d)) {
      return new Date(d.getTime());
    }
    if (isNumber(d)) {
      return new Date(d);
    }
    if (isString(d)) {
      return this.parse(d, mask);
    }
    if (isObject(d)) {
      const date = new Date();
      return new Date(
        d.year || date.getFullYear(),
        d.month || date.getMonth(),
        d.day || date.getDate(),
      );
    }
    return d;
  }

  getMonthDates(year = 2000) {
    const dates = [];
    for (let i = 0; i < 12; i++) {
      dates.push(new Date(year, i, 15));
    }
    return dates;
  }

  getMonthNames(length) {
    const dtf = new Intl.DateTimeFormat(this.id, {
      month: length,
      timezome: 'UTC',
    });
    return this.getMonthDates().map(d => dtf.format(d));
  }

  getWeekdayDates({
    year = 2000,
    utc = false,
    firstDayOfWeek = this.firstDayOfWeek,
  } = {}) {
    const dates = [];
    for (let i = 1, j = 0; j < 7; i++) {
      const d = utc ? new Date(Date.UTC(year, 0, i)) : new Date(year, 0, i);
      const day = utc ? d.getUTCDay() : d.getDay();
      if (day === firstDayOfWeek - 1 || j > 0) {
        dates.push(d);
        j++;
      }
    }
    return dates;
  }

  getDayNames(length) {
    const dtf = new Intl.DateTimeFormat(this.id, {
      weekday: length,
      timeZone: 'UTC',
    });
    return this.getWeekdayDates({ firstDayOfWeek: 1, utc: true }).map(d =>
      dtf.format(d),
    );
  }

  // Days/month/year components for a given month and year
  getMonthComps(month, year) {
    const key = `${month}.${year}`;
    let comps = this.monthData[key];
    if (!comps) {
      const inLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const firstWeekday = new Date(year, month - 1, 1).getDay() + 1;
      const days = month === 2 && inLeapYear ? 29 : daysInMonths[month - 1];
      const weeks = Math.ceil(
        (days + Math.abs(firstWeekday - this.firstDayOfWeek)) / 7,
      );
      comps = {
        firstDayOfWeek: this.firstDayOfWeek,
        inLeapYear,
        firstWeekday,
        days,
        weeks,
        month,
        year,
      };
      this.monthData[key] = comps;
    }
    return comps;
  }

  // Days/month/year components for today's month
  getThisMonthComps() {
    const date = new Date();
    return this.getMonthComps(date.getMonth() + 1, date.getFullYear());
  }

  // Day/month/year components for previous month
  getPrevMonthComps(month, year) {
    if (month === 1) return this.getMonthComps(12, year - 1);
    return this.getMonthComps(month - 1, year);
  }

  // Day/month/year components for next month
  getNextMonthComps(month, year) {
    if (month === 12) return this.getMonthComps(1, year + 1);
    return this.getMonthComps(month + 1, year);
  }

  // Buils day components for a given page
  getCalendarDays(page, trimMaxWeek) {
    const days = [];
    const { monthComps, prevMonthComps, nextMonthComps } = page;
    const { firstDayOfWeek, firstWeekday } = monthComps;
    const prevMonthDaysToShow =
      firstWeekday + (firstWeekday < firstDayOfWeek ? 7 : 0) - firstDayOfWeek;
    let prevMonth = true;
    let thisMonth = false;
    let nextMonth = false;
    // Init counters with previous month's data
    let day = prevMonthComps.days - prevMonthDaysToShow + 1;
    let dayFromEnd = prevMonthComps.days - day + 1;
    let weekdayOrdinal = Math.floor((day - 1) / 7 + 1);
    let weekdayOrdinalFromEnd = 1;
    let week = prevMonthComps.weeks;
    let weekFromEnd = 1;
    let month = prevMonthComps.month;
    let year = prevMonthComps.year;
    // Store todays comps
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const todayYear = today.getFullYear();
    // Cycle through 6 weeks (max in month)
    for (let w = 1; w <= 6 && (!nextMonth || !trimMaxWeek); w++) {
      // Cycle through 7 days
      for (
        let i = 1, weekday = firstDayOfWeek;
        i <= 7;
        i++, weekday += weekday === 7 ? -6 : 1
      ) {
        // We need to know when to start counting actual month days
        if (prevMonth && weekday === firstWeekday) {
          // Reset counters for current month
          day = 1;
          dayFromEnd = monthComps.days;
          weekdayOrdinal = Math.floor((day - 1) / 7 + 1);
          weekdayOrdinalFromEnd = Math.floor((monthComps.days - day) / 7 + 1);
          week = 1;
          weekFromEnd = monthComps.weeks;
          month = monthComps.month;
          year = monthComps.year;
          // ...and flag we're tracking actual month days
          prevMonth = false;
          thisMonth = true;
        }
        // Append day info for the current week
        // Note: this might or might not be an actual month day
        //  We don't know how the UI wants to display various days,
        //  so we'll supply all the data we can
        const date = new Date(year, month - 1, day);
        const weekdayPosition = i;
        const isToday =
          day === todayDay && month === todayMonth && year === todayYear;
        const isFirstDay = thisMonth && day === 1;
        const isLastDay = thisMonth && day === monthComps.days;
        const onTop = w === 1;
        const onBottom = w === 6;
        const onLeft = i === 1;
        const onRight = i === 7;
        days.push({
          id: `${month}.${day}`,
          label: day.toString(),
          day,
          dayFromEnd,
          weekday,
          weekdayPosition,
          weekdayOrdinal,
          weekdayOrdinalFromEnd,
          week,
          weekFromEnd,
          month,
          year,
          date,
          dateTime: date.getTime(),
          isToday,
          isFirstDay,
          isLastDay,
          inMonth: thisMonth,
          inPrevMonth: prevMonth,
          inNextMonth: nextMonth,
          onTop,
          onBottom,
          onLeft,
          onRight,
          classes: [
            `day-${day}`,
            `day-from-end-${dayFromEnd}`,
            `weekday-${weekday}`,
            `weekday-position-${weekdayPosition}`,
            `weekday-ordinal-${weekdayOrdinal}`,
            `weekday-ordinal-from-end-${weekdayOrdinalFromEnd}`,
            `week-${week}`,
            `week-from-end-${weekFromEnd}`,
            {
              'is-today': isToday,
              'is-first-day': isFirstDay,
              'is-last-day': isLastDay,
              'in-month': thisMonth,
              'in-prev-month': prevMonth,
              'in-next-month': nextMonth,
              'on-top': onTop,
              'on-bottom': onBottom,
              'on-left': onLeft,
              'on-right': onRight,
            },
          ],
        });
        // See if we've hit the last day of the month
        if (thisMonth && isLastDay) {
          thisMonth = false;
          nextMonth = true;
          // Reset counters to next month's data
          day = 1;
          dayFromEnd = nextMonthComps.days;
          weekdayOrdinal = 1;
          weekdayOrdinalFromEnd = Math.floor(
            (nextMonthComps.days - day) / 7 + 1,
          );
          week = 1;
          weekFromEnd = nextMonthComps.weeks;
          month = nextMonthComps.month;
          year = nextMonthComps.year;
          // Still in the middle of the month (hasn't ended yet)
        } else {
          day++;
          dayFromEnd--;
          weekdayOrdinal = Math.floor((day - 1) / 7 + 1);
          weekdayOrdinalFromEnd = Math.floor((monthComps.days - day) / 7 + 1);
        }
      }
      // Append week days
      week++;
      weekFromEnd--;
    }
    return days;
  }
}
