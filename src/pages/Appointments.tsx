import React, { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  appointmentService,
  patientService,
  generateId,
  createTimestamp,
} from '../services/storage';
import type { Appointment, Patient } from '../types';
import { getWeekDates } from '../utils/dateHelpers';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    patientId: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'scheduled',
    notes: '',
    sessionNumber: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAppointments(appointmentService.getAll());
    setPatients(patientService.getAll());
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Bilinmeyen';
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments
      .filter((a) => a.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAppointment) {
      appointmentService.update(selectedAppointment.id, formData);
    } else {
      const newAppointment: Appointment = {
        ...formData as Appointment,
        id: generateId(),
        createdAt: createTimestamp(),
        updatedAt: createTimestamp(),
      };
      appointmentService.save(newAppointment);
    }

    loadData();
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      appointmentService.delete(id);
      loadData();
    }
  };

  const openNewAppointmentModal = (date?: Date) => {
    setSelectedAppointment(null);
    setFormData({
      patientId: '',
      date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      status: 'scheduled',
      notes: '',
      sessionNumber: undefined,
    });
    setShowModal(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const weekDates = getWeekDates(selectedDate);

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getStatusBadgeClass = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Planlandı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal';
      case 'no-show':
        return 'Gelmedi';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Randevular</h1>
          <p className="mt-1 text-sm text-gray-600">
            Randevularınızı görüntüleyin ve yönetin
          </p>
        </div>
        <button
          onClick={() => openNewAppointmentModal()}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Randevu
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium">
              {format(weekDates[0], 'd MMMM', { locale: tr })} -{' '}
              {format(weekDates[6], 'd MMMM yyyy', { locale: tr })}
            </h2>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            Bugün
          </button>
        </div>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const dayAppointments = getAppointmentsForDate(date);

          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow overflow-hidden ${
                isToday ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className={`p-3 ${isToday ? 'bg-primary-500 text-white' : 'bg-gray-50'}`}>
                <div className="text-center">
                  <div className="text-xs font-medium uppercase">
                    {format(date, 'EEE', { locale: tr })}
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {format(date, 'd')}
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-2 min-h-[200px]">
                {dayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <CalendarIcon className="h-6 w-6 mx-auto mb-1" />
                    Boş
                  </div>
                ) : (
                  dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-2 bg-gray-50 rounded border-l-4 border-primary-500 hover:bg-gray-100 cursor-pointer text-xs"
                      onClick={() => openEditModal(appointment)}
                    >
                      <div className="font-medium text-gray-900">
                        {appointment.startTime}
                      </div>
                      <div className="text-gray-600 truncate">
                        {getPatientName(appointment.patientId)}
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeClass(
                          appointment.status
                        )}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  ))
                )}

                <button
                  onClick={() => openNewAppointmentModal(date)}
                  className="w-full py-2 text-xs text-primary-600 hover:bg-primary-50 rounded border border-dashed border-primary-300"
                >
                  + Ekle
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedAppointment ? 'Randevu Düzenle' : 'Yeni Randevu'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Hasta *
                      </label>
                      <select
                        required
                        value={formData.patientId}
                        onChange={(e) =>
                          setFormData({ ...formData, patientId: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      >
                        <option value="">Hasta seçin</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tarih *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Başlangıç *
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({ ...formData, startTime: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Bitiş *
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({ ...formData, endTime: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Durum
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as Appointment['status'],
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      >
                        <option value="scheduled">Planlandı</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">İptal</option>
                        <option value="no-show">Gelmedi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Seans Numarası
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.sessionNumber || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sessionNumber: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notlar
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {selectedAppointment ? 'Güncelle' : 'Ekle'}
                  </button>
                  {selectedAppointment && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(selectedAppointment.id);
                        closeModal();
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none sm:w-auto sm:text-sm"
                    >
                      Sil
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
