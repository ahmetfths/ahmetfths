import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { requestService } from '../services/storage';
import type { AppointmentRequest } from '../types';
import { formatDate } from '../utils/dateHelpers';

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const data = requestService.getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRequests(data);
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const handleApprove = (id: string) => {
    requestService.update(id, { status: 'approved' });
    loadRequests();
  };

  const handleReject = (id: string) => {
    requestService.update(id, { status: 'rejected' });
    loadRequests();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      requestService.delete(id);
      loadRequests();
    }
  };

  const getStatusIcon = (status: AppointmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: AppointmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
    }
  };

  const getStatusBadgeClass = (status: AppointmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Randevu Talepleri</h1>
        <p className="mt-1 text-sm text-gray-600">
          Hastalardan gelen randevu taleplerini yönetin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Toplam Talep</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-700">Bekliyor</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-700">Onaylandı</p>
          <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-700">Reddedildi</p>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
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
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Onaylandı
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Reddedildi
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">
              {filter === 'all'
                ? 'Henüz randevu talebi yok'
                : `${getStatusText(filter as AppointmentRequest['status'])} talep bulunamadı`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    {getStatusIcon(request.status)}
                    <span
                      className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
                        request.status
                      )}`}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.firstName} {request.lastName}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Telefon:</span> {request.phone}
                      </p>
                      {request.email && (
                        <p>
                          <span className="font-medium">E-posta:</span> {request.email}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Tercih Edilen Tarih:</span>{' '}
                        {formatDate(request.preferredDate)} - {request.preferredTime}
                      </p>
                      {request.message && (
                        <p className="mt-2">
                          <span className="font-medium">Mesaj:</span>
                          <br />
                          {request.message}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Talep Tarihi: {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        Reddet
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Requests;
