import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  patientService,
  appointmentService,
  paymentService,
  requestService,
} from '../services/storage';
import type { Appointment, Patient } from '../types';
import { formatDate } from '../utils/dateHelpers';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPayments: 0,
    pendingRequests: 0,
    totalRevenue: 0,
  });

  const [upcomingAppointments, setUpcomingAppointments] = useState<
    (Appointment & { patient?: Patient })[]
  >([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const patients = patientService.getAll();
    const appointments = appointmentService.getAll();
    const payments = paymentService.getAll();
    const requests = requestService.getAll();

    const today = new Date().toISOString().split('T')[0];

    // İstatistikler
    const todayAppointments = appointments.filter(
      (a) => a.date === today && a.status === 'scheduled'
    );

    const pendingPayments = payments.filter(
      (p) => p.status === 'pending' || p.status === 'overdue'
    );

    const paidPayments = payments.filter((p) => p.status === 'paid');
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    const pendingRequests = requests.filter((r) => r.status === 'pending');

    setStats({
      totalPatients: patients.length,
      todayAppointments: todayAppointments.length,
      pendingPayments: pendingPayments.length,
      pendingRequests: pendingRequests.length,
      totalRevenue,
    });

    // Yaklaşan randevular (sonraki 7 gün)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcoming = appointments
      .filter((a) => {
        const appointmentDate = new Date(a.date);
        return (
          appointmentDate >= new Date(today) &&
          appointmentDate <= nextWeek &&
          a.status === 'scheduled'
        );
      })
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5)
      .map((appointment) => ({
        ...appointment,
        patient: patients.find((p) => p.id === appointment.patientId),
      }));

    setUpcomingAppointments(upcoming);
  };

  const statCards = [
    {
      name: 'Toplam Hasta',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      link: '/patients',
    },
    {
      name: 'Bugünkü Randevular',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-green-500',
      link: '/appointments',
    },
    {
      name: 'Bekleyen Ödemeler',
      value: stats.pendingPayments,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/payments',
    },
    {
      name: 'Randevu Talepleri',
      value: stats.pendingRequests,
      icon: AlertCircle,
      color: 'bg-red-500',
      link: '/requests',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Hoş geldiniz! İşte bugünkü özet bilgiler.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-md transition-shadow sm:px-6"
            >
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Revenue Card */}
      <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 text-white shadow">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8" />
          <div className="ml-5">
            <p className="text-sm font-medium text-primary-100">Toplam Gelir</p>
            <p className="text-3xl font-bold">
              {stats.totalRevenue.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Yaklaşan Randevular
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingAppointments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">Yaklaşan randevu bulunmuyor</p>
            </div>
          ) : (
            upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patient?.firstName}{' '}
                      {appointment.patient?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(appointment.date)} • {appointment.startTime} -{' '}
                      {appointment.endTime}
                    </p>
                    {appointment.notes && (
                      <p className="text-xs text-gray-400 mt-1">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/appointments`}
                    className="ml-4 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Detay →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
        {upcomingAppointments.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 text-center">
            <Link
              to="/appointments"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Tüm randevuları görüntüle →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
