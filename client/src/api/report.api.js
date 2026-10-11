import api from './axios';
import { getStoredToken } from './token';

export const getPlacementReportApi = async ({ month, year }) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  const res = await api.get(`/reports/placements?${params.toString()}`);
  return res.data;
};

export const downloadPlacementReportCsv = async ({ month, year }) => {
  const token = getStoredToken();
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  params.append('format', 'csv');

  const response = await fetch(`/api/reports/placements?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to download report CSV');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ojterm_placement_report_${year || 'all'}_${month || 'all'}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const getReportHistoryApi = async () => {
  const res = await api.get('/reports/history');
  return res.data;
};
