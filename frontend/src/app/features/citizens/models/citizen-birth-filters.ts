const calendarFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' });
export const currentCitizenCalendarDate = (): string => calendarFormatter.format(new Date());

function birthdayCombinationIsValid(day: string, month: string): boolean {
  const maximum = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][Number(month) - 1];
  return Number.isInteger(Number(day)) && Number(day) >= 1 && Number(day) <= maximum;
}

export function birthdayFiltersAreCompatible(
  days: readonly string[],
  months: readonly string[],
): boolean {
  return (
    !days.length ||
    !months.length ||
    days.some((day) => months.some((month) => birthdayCombinationIsValid(day, month)))
  );
}
