import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

type AuditLog = {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: unknown;
  createdAt: string;
};

export function useAdminAuditLogs() {
  return useQuery<{ logs: AuditLog[] }>({
    queryKey: [QUERY_KEYS.AUDIT_LOGS],
    queryFn: async () => {
      const r = await apiClient.get<{ logs: AuditLog[] }>(
        '/api/admin/audit-logs',
      );
      return r.data;
    },
  });
}
