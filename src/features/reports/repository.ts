import { Biomarker, BloodReportData, MOCK_BIOMARKERS, MOCK_REPORT_DATA } from '../../data/mock';
import { getDatabase, seedDemoData } from '../../db/database';

export interface IReportRepository {
  getLatestReport(): Promise<BloodReportData>;
  getAllBiomarkers(): Promise<Biomarker[]>;
  getFlaggedBiomarkers(): Promise<Biomarker[]>;
  getBiomarkersByCategory(category: string): Promise<Biomarker[]>;
  getBiomarkerById(id: string): Promise<Biomarker | undefined>;
  saveNewReport(report: BloodReportData): Promise<void>;
}

interface ReportRow {
  id: string;
  date: string;
  lab_name: string;
  patient_name: string;
  normal_count: number;
  borderline_count: number;
  abnormal_count: number;
  total_count: number;
  flagged_count_message: string;
}

interface BiomarkerRow {
  id: string;
  report_id: string;
  biomarker_key: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  min_range: number;
  max_range: number;
  optimal_min: number;
  optimal_max: number;
  status: string;
  status_label: string;
  flagged_reason: string | null;
  what_it_is: string;
  why_low_or_high: string;
  foods_that_help: string;
  when_to_see_doctor: string;
  previous_timeline: string;
  progress_chart_data: string;
}

function parseBiomarkerRow(row: BiomarkerRow): Biomarker {
  let foodsThatHelp: string[] = [];
  let previousTimeline: { date: string; value: number }[] = [];
  let progressChartData: { value: number; label: string; date: string }[] = [];

  try {
    foodsThatHelp = JSON.parse(row.foods_that_help);
  } catch {}
  try {
    previousTimeline = JSON.parse(row.previous_timeline);
  } catch {}
  try {
    progressChartData = JSON.parse(row.progress_chart_data);
  } catch {}

  return {
    id: row.biomarker_key,
    name: row.name,
    category: row.category as any,
    value: row.value,
    unit: row.unit,
    minRange: row.min_range,
    maxRange: row.max_range,
    optimalMin: row.optimal_min,
    optimalMax: row.optimal_max,
    status: row.status as any,
    statusLabel: row.status_label,
    flaggedReason: row.flagged_reason || undefined,
    whatItIs: row.what_it_is,
    whyLowOrHigh: row.why_low_or_high,
    foodsThatHelp,
    whenToSeeDoctor: row.when_to_see_doctor,
    previousTimeline,
    progressChartData,
  };
}

export class SQLiteReportRepository implements IReportRepository {
  async getLatestReport(): Promise<BloodReportData> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ReportRow>('SELECT * FROM reports ORDER BY rowid DESC LIMIT 1');

    if (!row) {
      // Auto-seed if empty
      await seedDemoData();
      return MOCK_REPORT_DATA;
    }

    const biomarkerRows = await db.getAllAsync<BiomarkerRow>(
      'SELECT * FROM biomarker_results WHERE report_id = ?',
      [row.id]
    );

    const biomarkers = biomarkerRows.map(parseBiomarkerRow);

    return {
      id: row.id,
      date: row.date,
      labName: row.lab_name,
      patientName: row.patient_name,
      normalCount: row.normal_count,
      borderlineCount: row.borderline_count,
      abnormalCount: row.abnormal_count,
      totalCount: row.total_count,
      flaggedCountMessage: row.flagged_count_message,
      biomarkers,
    };
  }

  async getAllBiomarkers(): Promise<Biomarker[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BiomarkerRow>('SELECT * FROM biomarker_results');

    if (rows.length === 0) {
      await seedDemoData();
      return MOCK_BIOMARKERS;
    }

    return rows.map(parseBiomarkerRow);
  }

  async getFlaggedBiomarkers(): Promise<Biomarker[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BiomarkerRow>(
      "SELECT * FROM biomarker_results WHERE status != 'normal'"
    );

    if (rows.length === 0) {
      await seedDemoData();
      return MOCK_BIOMARKERS.filter((b) => b.status !== 'normal');
    }

    return rows.map(parseBiomarkerRow);
  }

  async getBiomarkersByCategory(category: string): Promise<Biomarker[]> {
    const db = await getDatabase();
    if (category === 'All') {
      return this.getAllBiomarkers();
    }
    const rows = await db.getAllAsync<BiomarkerRow>(
      'SELECT * FROM biomarker_results WHERE category = ?',
      [category]
    );
    return rows.map(parseBiomarkerRow);
  }

  async getBiomarkerById(id: string): Promise<Biomarker | undefined> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BiomarkerRow>(
      'SELECT * FROM biomarker_results WHERE biomarker_key = ? LIMIT 1',
      [id]
    );
    if (!row) return undefined;
    return parseBiomarkerRow(row);
  }

  async saveNewReport(report: BloodReportData): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `INSERT OR REPLACE INTO reports (
        id, date, lab_name, patient_name, normal_count, borderline_count, abnormal_count, total_count, flagged_count_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.id,
        report.date,
        report.labName,
        report.patientName,
        report.normalCount,
        report.borderlineCount,
        report.abnormalCount,
        report.totalCount,
        report.flaggedCountMessage,
      ]
    );

    for (const b of report.biomarkers) {
      await db.runAsync(
        `INSERT OR REPLACE INTO biomarker_results (
          id, report_id, biomarker_key, name, category, value, unit,
          min_range, max_range, optimal_min, optimal_max, status,
          status_label, flagged_reason, what_it_is, why_low_or_high,
          foods_that_help, when_to_see_doctor, previous_timeline, progress_chart_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${report.id}_${b.id}`,
          report.id,
          b.id,
          b.name,
          b.category,
          b.value,
          b.unit,
          b.minRange,
          b.maxRange,
          b.optimalMin,
          b.optimalMax,
          b.status,
          b.statusLabel,
          b.flaggedReason || '',
          b.whatItIs,
          b.whyLowOrHigh,
          JSON.stringify(b.foodsThatHelp || []),
          b.whenToSeeDoctor,
          JSON.stringify(b.previousTimeline || []),
          JSON.stringify(b.progressChartData || []),
        ]
      );
    }
  }
}

export const reportRepository: IReportRepository = new SQLiteReportRepository();
