import { format, parseISO, addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'dd MMMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: tr });
};

export const formatTime = (time: string): string => {
  return time;
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getWeekDates = (date: Date = new Date()): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Pazartesi başlangıç
  const dates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(start, i));
  }

  return dates;
};

export const isDateInCurrentWeek = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  return isWithinInterval(dateObj, { start: weekStart, end: weekEnd });
};

export const getDayName = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEEE', { locale: tr });
};

export const getMonthName = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM', { locale: tr });
};
