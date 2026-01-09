import { useQuery } from '@tanstack/react-query';
import clientAxios from '@/utils/clientAxios';

interface DashboardStats {
  properties: number;
  clients: number;
  rentals: number;
  totalRevenue: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await clientAxios.get('/dashboard/stats');
  return data;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });
}