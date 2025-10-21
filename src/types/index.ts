// Hasta bilgileri
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  address?: string;
  diagnosis: string; // Tanı
  notes?: string; // Genel notlar
  totalSessions: number; // Toplam planlanan seans sayısı
  completedSessions: number; // Tamamlanan seans sayısı
  createdAt: string;
  updatedAt: string;
}

// Randevu bilgileri
export interface Appointment {
  id: string;
  patientId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  sessionNumber?: number; // Kaçıncı seans
  createdAt: string;
  updatedAt: string;
}

// Seans detayları
export interface Session {
  id: string;
  patientId: string;
  appointmentId: string;
  sessionNumber: number;
  date: string;
  duration: number; // dakika cinsinden
  treatmentNotes: string; // Yapılan tedavi notları
  exercises?: string[]; // Verilen egzersizler
  nextSteps?: string; // Sonraki adımlar
  painLevel?: number; // 1-10 arası ağrı seviyesi
  progress?: string; // İlerleme durumu
  createdAt: string;
  updatedAt: string;
}

// Ödeme bilgileri
export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;
  sessionId?: string;
  amount: number;
  currency: string; // 'TRY', 'USD', etc.
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string; // Ödeme tarihi
  paidDate?: string; // Ödendiği tarih
  paymentMethod?: 'cash' | 'credit-card' | 'bank-transfer' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Randevu talebi (hastalardan gelen)
export interface AppointmentRequest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Dashboard için istatistikler
export interface Statistics {
  totalPatients: number;
  activePatients: number;
  todayAppointments: number;
  weekAppointments: number;
  monthAppointments: number;
  pendingPayments: number;
  totalRevenue: number;
  monthRevenue: number;
  availableSlots: number; // Bu hafta için boş slot sayısı
}

// Çalışma saatleri
export interface WorkingHours {
  dayOfWeek: number; // 0-6 (0 = Pazar)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isWorkingDay: boolean;
}

// Uygulama ayarları
export interface Settings {
  workingHours: WorkingHours[];
  sessionDuration: number; // varsayılan seans süresi (dakika)
  currency: string; // varsayılan para birimi
  sessionPrice: number; // varsayılan seans ücreti
  breakDuration: number; // seanslar arası mola süresi (dakika)
}
