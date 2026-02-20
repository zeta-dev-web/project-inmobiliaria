'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const priceUpdates = notifications.filter((n) => n.type === 'PRICE_UPDATE');
  const expiringContracts = notifications.filter(
    (n) => n.type === 'CONTRACT_EXPIRING'
  );

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {user?.name || 'Administrador'}
        </h1>
        <p className="text-gray-600">
          Gestiona tu negocio inmobiliario desde este panel de control
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#600096]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actualizaciones de Precio */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <TrendingUp className="w-5 h-5" />
                  Actualizaciones de Precio ({priceUpdates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {priceUpdates.length === 0 ? (
                  <p className="text-purple-700 text-sm">
                    No hay actualizaciones de precio pendientes
                  </p>
                ) : (
                  <div className="space-y-3">
                    {priceUpdates.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-white p-4 rounded-lg border border-purple-200"
                      >
                        <p className="font-medium text-gray-900">
                          {notif.rental.property.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Inquilino: {notif.rental.tenant.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contratos por Vencer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <AlertCircle className="w-5 h-5" />
                  Contratos por Vencer ({expiringContracts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expiringContracts.length === 0 ? (
                  <p className="text-orange-700 text-sm">
                    No hay contratos próximos a vencer
                  </p>
                ) : (
                  <div className="space-y-3">
                    {expiringContracts.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-white p-4 rounded-lg border border-orange-200"
                      >
                        <p className="font-medium text-gray-900">
                          {notif.rental.property.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Inquilino: {notif.rental.tenant.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
