const calendarFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' });
export const currentCitizenCalendarDate = (): string => calendarFormatter.format(new Date());

export function birthdayCombinationIsValid(day: string, month: string): boolean {
  if (!day || !month) return true;
  const maximum = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][Number(month) - 1];
  return Number.isInteger(Number(day)) && Number(day) >= 1 && Number(day) <= maximum;
}
