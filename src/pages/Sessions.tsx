import React, { useEffect, useState } from 'react';
import { Plus, FileText, Activity } from 'lucide-react';
import {
  sessionService,
  patientService,
  generateId,
  createTimestamp,
} from '../services/storage';
import type { Session, Patient } from '../types';
import { formatDate } from '../utils/dateHelpers';

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<Partial<Session>>({
    patientId: '',
    appointmentId: '',
    sessionNumber: 1,
    date: '',
    duration: 45,
    treatmentNotes: '',
    exercises: [],
    nextSteps: '',
    painLevel: undefined,
    progress: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSessions(sessionService.getAll());
    setPatients(patientService.getAll());
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Bilinmeyen';
  };

  const filteredSessions = selectedPatientId
    ? sessions.filter((s) => s.patientId === selectedPatientId)
    : sessions;

  const sortedSessions = filteredSessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSession) {
      sessionService.update(selectedSession.id, formData);
    } else {
      const newSession: Session = {
        ...formData as Session,
        id: generateId(),
        createdAt: createTimestamp(),
        updatedAt: createTimestamp(),
      };
      sessionService.save(newSession);

      // Hasta'nın tamamlanan seans sayısını güncelle
      if (formData.patientId) {
        const patient = patients.find((p) => p.id === formData.patientId);
        if (patient) {
          patientService.update(patient.id, {
            completedSessions: patient.completedSessions + 1,
          });
        }
      }
    }

    loadData();
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu seans kaydını silmek istediğinizden emin misiniz?')) {
      sessionService.delete(id);
      loadData();
    }
  };

  const openNewSessionModal = () => {
    setSelectedSession(null);
    setFormData({
      patientId: selectedPatientId || '',
      appointmentId: '',
      sessionNumber: 1,
      date: new Date().toISOString().split('T')[0],
      duration: 45,
      treatmentNotes: '',
      exercises: [],
      nextSteps: '',
      painLevel: undefined,
      progress: '',
    });
    setShowModal(true);
  };

  const openEditModal = (session: Session) => {
    setSelectedSession(session);
    setFormData(session);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
  };

  const getPainLevelColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seans Kayıtları</h1>
          <p className="mt-1 text-sm text-gray-600">
            Hasta seanslarını detaylı şekilde takip edin
          </p>
        </div>
        <button
          onClick={openNewSessionModal}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Seans
        </button>
      </div>

      {/* Patient Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hasta Filtrele
        </label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
        >
          <option value="">Tüm Hastalar</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sortedSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">
              {selectedPatientId
                ? 'Bu hasta için seans kaydı bulunamadı'
                : 'Henüz seans kaydı eklenmedi'}
            </p>
          </div>
        ) : (
          sortedSessions.map((session) => {
            const patient = patients.find((p) => p.id === session.patientId);
            return (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {getPatientName(session.patientId)}
                        </h3>
                        <span className="ml-3 px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
                          Seans {session.sessionNumber}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>{formatDate(session.date)}</span>
                        <span className="mx-2">•</span>
                        <span>{session.duration} dakika</span>
                        {session.painLevel && (
                          <>
                            <span className="mx-2">•</span>
                            <Activity
                              className={`h-4 w-4 mr-1 ${getPainLevelColor(
                                session.painLevel
                              )}`}
                            />
                            <span className={getPainLevelColor(session.painLevel)}>
                              Ağrı: {session.painLevel}/10
                            </span>
                          </>
                        )}
                      </div>

                      {patient && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Tanı:</span> {patient.diagnosis}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(session)}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Tedavi Notları
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {session.treatmentNotes || 'Not eklenmedi'}
                      </p>
                    </div>

                    {session.exercises && session.exercises.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Verilen Egzersizler
                        </h4>
                        <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                          {session.exercises.map((exercise, index) => (
                            <li key={index}>{exercise}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {session.progress && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          İlerleme Durumu
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">{session.progress}</p>
                      </div>
                    )}

                    {session.nextSteps && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Sonraki Adımlar
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">{session.nextSteps}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedSession ? 'Seans Düzenle' : 'Yeni Seans Kaydı'}
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Seans Numarası *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.sessionNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sessionNumber: parseInt(e.target.value) || 1,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        />
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Süre (dakika) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: parseInt(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ağrı Seviyesi (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.painLevel || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              painLevel: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tedavi Notları *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.treatmentNotes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            treatmentNotes: e.target.value,
                          })
                        }
                        placeholder="Uygulanan tedavi, manuel terapi teknikleri, kullanılan modaliteler vb."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Verilen Egzersizler
                      </label>
                      <textarea
                        rows={3}
                        value={formData.exercises?.join('\n')}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            exercises: e.target.value
                              .split('\n')
                              .filter((e) => e.trim()),
                          })
                        }
                        placeholder="Her satıra bir egzersiz yazın"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        İlerleme Durumu
                      </label>
                      <textarea
                        rows={3}
                        value={formData.progress}
                        onChange={(e) =>
                          setFormData({ ...formData, progress: e.target.value })
                        }
                        placeholder="Hastanın gelişimi, iyileşme durumu vb."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sonraki Adımlar
                      </label>
                      <textarea
                        rows={3}
                        value={formData.nextSteps}
                        onChange={(e) =>
                          setFormData({ ...formData, nextSteps: e.target.value })
                        }
                        placeholder="Gelecek seansta planlanacaklar, ev programı vb."
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
                    {selectedSession ? 'Güncelle' : 'Kaydet'}
                  </button>
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

export default Sessions;
