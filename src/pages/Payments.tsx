import React, { useEffect, useState } from 'react';
import { Plus, DollarSign, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import {
  paymentService,
  patientService,
  generateId,
  createTimestamp,
} from '../services/storage';
import type { Payment, Patient } from '../types';
import { formatDate } from '../utils/dateHelpers';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Partial<Payment>>({
    patientId: '',
    amount: 0,
    currency: 'TRY',
    status: 'pending',
    dueDate: '',
    paidDate: '',
    paymentMethod: undefined,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPayments(paymentService.getAll());
    setPatients(patientService.getAll());
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Bilinmeyen';
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const stats = {
    total: payments.reduce((sum, p) => (p.status === 'paid' ? sum + p.amount : sum), 0),
    pending: payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPayment) {
      paymentService.update(selectedPayment.id, formData);
    } else {
      const newPayment: Payment = {
        ...formData as Payment,
        id: generateId(),
        createdAt: createTimestamp(),
        updatedAt: createTimestamp(),
      };
      paymentService.save(newPayment);
    }

    loadData();
    closeModal();
  };

  const handleMarkAsPaid = (id: string) => {
    paymentService.update(id, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
    });
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu ödeme kaydını silmek istediğinizden emin misiniz?')) {
      paymentService.delete(id);
      loadData();
    }
  };

  const openNewPaymentModal = () => {
    setSelectedPayment(null);
    setFormData({
      patientId: '',
      amount: 0,
      currency: 'TRY',
      status: 'pending',
      dueDate: '',
      paidDate: '',
      paymentMethod: undefined,
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormData(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'Ödendi';
      case 'pending':
        return 'Bekliyor';
      case 'overdue':
        return 'Gecikmiş';
      case 'cancelled':
        return 'İptal';
    }
  };

  const getStatusBadgeClass = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ödemeler</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ödeme durumlarını takip edin ve yönetin
          </p>
        </div>
        <button
          onClick={openNewPaymentModal}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Ödeme
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Bekleyen Ödemeler</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Gecikmiş Ödemeler</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overdue.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Bekliyor
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'paid'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Ödendi
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'overdue'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Gecikmiş
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hasta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vade Tarihi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ödeme Tarihi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Ödeme kaydı bulunamadı
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(
                          payment.status
                        )}`}
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getPatientName(payment.patientId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.amount.toLocaleString('tr-TR')} {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(payment.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.paidDate ? formatDate(payment.paidDate) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {payment.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkAsPaid(payment.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Ödendi
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(payment)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                    {selectedPayment ? 'Ödeme Düzenle' : 'Yeni Ödeme'}
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
                          Tutar *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Para Birimi
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) =>
                            setFormData({ ...formData, currency: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        >
                          <option value="TRY">TRY</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
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
                            status: e.target.value as Payment['status'],
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      >
                        <option value="pending">Bekliyor</option>
                        <option value="paid">Ödendi</option>
                        <option value="overdue">Gecikmiş</option>
                        <option value="cancelled">İptal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Vade Tarihi *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dueDate: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                      />
                    </div>

                    {formData.status === 'paid' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Ödeme Tarihi
                          </label>
                          <input
                            type="date"
                            value={formData.paidDate}
                            onChange={(e) =>
                              setFormData({ ...formData, paidDate: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Ödeme Yöntemi
                          </label>
                          <select
                            value={formData.paymentMethod}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paymentMethod: e.target.value as Payment['paymentMethod'],
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                          >
                            <option value="">Seçin</option>
                            <option value="cash">Nakit</option>
                            <option value="credit-card">Kredi Kartı</option>
                            <option value="bank-transfer">Banka Transferi</option>
                            <option value="other">Diğer</option>
                          </select>
                        </div>
                      </>
                    )}

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
                    {selectedPayment ? 'Güncelle' : 'Ekle'}
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

export default Payments;
