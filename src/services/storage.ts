import type {
  Patient,
  Appointment,
  Session,
  Payment,
  AppointmentRequest,
  Settings,
  WorkingHours,
} from '../types';

// LocalStorage key'leri
const KEYS = {
  PATIENTS: 'physio_patients',
  APPOINTMENTS: 'physio_appointments',
  SESSIONS: 'physio_sessions',
  PAYMENTS: 'physio_payments',
  REQUESTS: 'physio_requests',
  SETTINGS: 'physio_settings',
};

// Generic LocalStorage helper
class LocalStorageService<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find((item: any) => item.id === id);
  }

  save(item: T): T {
    const items = this.getAll();
    items.push(item);
    localStorage.setItem(this.key, JSON.stringify(items));
    return item;
  }

  update(id: string, updatedItem: Partial<T>): T | undefined {
    const items = this.getAll();
    const index = items.findIndex((item: any) => item.id === id);

    if (index === -1) return undefined;

    items[index] = { ...items[index], ...updatedItem, updatedAt: new Date().toISOString() };
    localStorage.setItem(this.key, JSON.stringify(items));
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter((item: any) => item.id !== id);

    if (filteredItems.length === items.length) return false;

    localStorage.setItem(this.key, JSON.stringify(filteredItems));
    return true;
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}

// Servisler
export const patientService = new LocalStorageService<Patient>(KEYS.PATIENTS);
export const appointmentService = new LocalStorageService<Appointment>(KEYS.APPOINTMENTS);
export const sessionService = new LocalStorageService<Session>(KEYS.SESSIONS);
export const paymentService = new LocalStorageService<Payment>(KEYS.PAYMENTS);
export const requestService = new LocalStorageService<AppointmentRequest>(KEYS.REQUESTS);

// Settings servisi (tek bir nesne)
export const settingsService = {
  get(): Settings {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }

    // Varsayılan ayarlar
    return getDefaultSettings();
  },

  save(settings: Settings): Settings {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  update(updates: Partial<Settings>): Settings {
    const current = this.get();
    const updated = { ...current, ...updates };
    return this.save(updated);
  },
};

// Varsayılan çalışma saatleri
function getDefaultSettings(): Settings {
  const defaultWorkingHours: WorkingHours[] = [
    { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isWorkingDay: false }, // Pazar
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isWorkingDay: true },  // Pazartesi
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isWorkingDay: true },  // Salı
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isWorkingDay: true },  // Çarşamba
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isWorkingDay: true },  // Perşembe
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isWorkingDay: true },  // Cuma
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isWorkingDay: false }, // Cumartesi
  ];

  return {
    workingHours: defaultWorkingHours,
    sessionDuration: 45,
    currency: 'TRY',
    sessionPrice: 500,
    breakDuration: 15,
  };
}

// Utility fonksiyonları
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createTimestamp = (): string => {
  return new Date().toISOString();
};

// Demo veri oluşturma
export const initializeDemoData = () => {
  // Eğer zaten veri varsa demo veri ekleme
  if (patientService.getAll().length > 0) return;

  const now = new Date();

  // Demo hastalar
  const patient1: Patient = {
    id: generateId(),
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    phone: '0555 123 4567',
    email: 'ayse.yilmaz@email.com',
    birthDate: '1985-05-15',
    diagnosis: 'Bel fıtığı tedavisi',
    notes: 'Egzersizlere düzenli devam ediyor',
    totalSessions: 12,
    completedSessions: 5,
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  };

  const patient2: Patient = {
    id: generateId(),
    firstName: 'Mehmet',
    lastName: 'Demir',
    phone: '0532 987 6543',
    email: 'mehmet.demir@email.com',
    birthDate: '1990-08-22',
    diagnosis: 'Omuz ağrısı rehabilitasyonu',
    notes: 'Spor yaralanması sonrası tedavi',
    totalSessions: 8,
    completedSessions: 3,
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  };

  patientService.save(patient1);
  patientService.save(patient2);

  // Demo randevular
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointment1: Appointment = {
    id: generateId(),
    patientId: patient1.id,
    date: tomorrow.toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:45',
    status: 'scheduled',
    sessionNumber: 6,
    notes: 'Egzersiz kontrolü yapılacak',
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  };

  appointmentService.save(appointment1);

  // Demo ödeme
  const payment1: Payment = {
    id: generateId(),
    patientId: patient1.id,
    amount: 500,
    currency: 'TRY',
    status: 'pending',
    dueDate: tomorrow.toISOString().split('T')[0],
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  };

  paymentService.save(payment1);
};
