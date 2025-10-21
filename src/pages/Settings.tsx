import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { settingsService } from '../services/storage';
import type { Settings as SettingsType } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>(settingsService.get());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    settingsService.save(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateWorkingHours = (dayOfWeek: number, field: string, value: any) => {
    const updatedHours = settings.workingHours.map((wh) =>
      wh.dayOfWeek === dayOfWeek ? { ...wh, [field]: value } : wh
    );
    setSettings({ ...settings, workingHours: updatedHours });
  };

  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="mt-1 text-sm text-gray-600">
          Uygulama ayarlarını ve çalışma saatlerinizi yapılandırın
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Genel Ayarlar</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Varsayılan Seans Süresi (dakika)
              </label>
              <input
                type="number"
                min="1"
                value={settings.sessionDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sessionDuration: parseInt(e.target.value) || 45,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mola Süresi (dakika)
              </label>
              <input
                type="number"
                min="0"
                value={settings.breakDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    breakDuration: parseInt(e.target.value) || 15,
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
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              >
                <option value="TRY">TRY (₺)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Varsayılan Seans Ücreti
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.sessionPrice}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sessionPrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Çalışma Saatleri</h2>

          <div className="space-y-4">
            {settings.workingHours.map((wh) => (
              <div
                key={wh.dayOfWeek}
                className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0"
              >
                <div className="w-32">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={wh.isWorkingDay}
                      onChange={(e) =>
                        updateWorkingHours(
                          wh.dayOfWeek,
                          'isWorkingDay',
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {dayNames[wh.dayOfWeek]}
                    </span>
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Başlangıç
                    </label>
                    <input
                      type="time"
                      disabled={!wh.isWorkingDay}
                      value={wh.startTime}
                      onChange={(e) =>
                        updateWorkingHours(wh.dayOfWeek, 'startTime', e.target.value)
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
                    <input
                      type="time"
                      disabled={!wh.isWorkingDay}
                      value={wh.endTime}
                      onChange={(e) =>
                        updateWorkingHours(wh.dayOfWeek, 'endTime', e.target.value)
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saved && (
              <p className="text-sm text-green-600 font-medium">
                Ayarlar başarıyla kaydedildi!
              </p>
            )}
          </div>
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Save className="h-5 w-5 mr-2" />
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
