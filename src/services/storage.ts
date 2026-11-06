import { AppSettings, SimulationRecord, UserSession } from '../types/simulator';

const STORAGE_KEYS = {
  SESSION: 'kindergarten_sim_session',
  RECORDS: 'kindergarten_sim_records',
  SETTINGS: 'kindergarten_sim_settings',
};

export const defaultSettings: AppSettings = {
  customApiKey: '',
  soundEffects: true,
  autoScroll: true,
};

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read session from localStorage', e);
    return null;
  }
}

export function saveStoredSession(session: UserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  } catch (e) {
    console.error('Failed to save session to localStorage', e);
  }
}

export function getStoredRecords(studentId?: string): SimulationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    const records: SimulationRecord[] = raw ? JSON.parse(raw) : [];
    if (studentId) {
      return records.filter((r) => r.studentId === studentId);
    }
    return records;
  } catch (e) {
    console.error('Failed to read records from localStorage', e);
    return [];
  }
}

export function saveRecord(record: SimulationRecord): void {
  try {
    const existing = getStoredRecords();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)];
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save record to localStorage', e);
  }
}

export function deleteRecord(recordId: string): void {
  try {
    const existing = getStoredRecords();
    const updated = existing.filter((r) => r.id !== recordId);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete record', e);
  }
}

export function clearAllRecords(): void {
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
}

export function exportRecordsAsJson(): void {
  const records = getStoredRecords();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `幼兒園溝通演練歷程_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importRecordsFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(jsonString);
    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: '檔案格式不符，請上傳有效的紀錄陣列 JSON。' };
    }
    const existing = getStoredRecords();
    const mergedMap = new Map<string, SimulationRecord>();
    // First existing
    existing.forEach((r) => mergedMap.set(r.id, r));
    // Then imported
    imported.forEach((r) => {
      if (r.id && r.evaluation && r.scenario) {
        mergedMap.set(r.id, r);
      }
    });

    const combined = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(combined));
    return { success: true, count: imported.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || '解析 JSON 失敗' };
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
