'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';
import { toast } from 'react-toastify';
import {
  Mail,
  Search,
  X,
  Trash2,
  Download,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  active: boolean;
  unsubscribedAt: string | null;
  createdAt: string;
};

export default function SubscribersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['subscribers', page],
    queryFn: async () => {
      const { data } = await clientAxios.get(`/subscribers?page=${page}&limit=20`);
      return data;
    },
  });

  const subscribers: Subscriber[] = response?.data || [];
  const totalPages = response?.totalPages || 1;

  const filteredSubscribers = search
    ? subscribers.filter(
        (s: Subscriber) =>
          s.email.toLowerCase().includes(search.toLowerCase()) ||
          s.name?.toLowerCase().includes(search.toLowerCase())
      )
    : subscribers;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientAxios.delete(`/subscribers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      toast.success('Suscriptor eliminado exitosamente');
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || 'Error al eliminar el suscriptor'
      );
    },
  });

  const handleDelete = (id: string) => {
    setSubscriberToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (subscriberToDelete) {
      deleteMutation.mutate(subscriberToDelete);
    }
  };

  const handleExport = () => {
    const activeSubscribers = subscribers.filter((s: Subscriber) => s.active);
    const csvContent = [
      ['Email', 'Nombre', 'Fecha de Suscripción', 'Estado'].join(','),
      ...activeSubscribers.map((s: Subscriber) =>
        [
          s.email,
          s.name || '',
          new Date(s.createdAt).toLocaleDateString('es-AR'),
          s.active ? 'Activo' : 'Inactivo',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `suscriptores-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Lista exportada exitosamente');
  };

  const activeCount = subscribers.filter((s: Subscriber) => s.active).length;
  const inactiveCount = subscribers.length - activeCount;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            <Mail className="inline-block w-7 h-7 mr-2 text-[#600096]" />
            Suscriptores
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona la lista de emails para notificaciones
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-[#600096] hover:bg-[#500080] text-white shadow-lg hover:shadow-xl transition-all h-11"
          disabled={subscribers.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar Lista
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Suscriptores</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscribers.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suscriptores Activos</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dados de Baja</p>
              <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-gray-300 focus:border-[#600096] focus:ring-[#600096]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Fecha de Suscripción</TableHead>
              <TableHead className="font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#600096] border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Cargando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {search
                    ? 'No se encontraron suscriptores con los filtros aplicados'
                    : 'No hay suscriptores registrados'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        subscriber.active
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {subscriber.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(subscriber.createdAt).toLocaleDateString('es-AR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(subscriber.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            className="h-10 px-4 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50"
          >
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                variant={page === p ? 'default' : 'outline'}
                className={`h-10 w-10 ${
                  page === p
                    ? 'bg-[#600096] hover:bg-[#500080] text-white'
                    : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
                }`}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            className="h-10 px-4 bg-white hover:bg-gray-50 border-gray-300 disabled:opacity-50"
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suscriptor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El suscriptor será eliminado
              permanentemente de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
