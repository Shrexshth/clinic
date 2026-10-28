import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { BloodReport, ReportSummary } from '../analyzer/types/biomarker';
import { SAMPLE_REPORTS } from '../analyzer/data/sampleReports';
import { summarizeReport } from '../analyzer/utils/evaluator';

interface ReportsContextType {
  activeReport: BloodReport;
  summary: ReportSummary;
  reportsList: BloodReport[];
  setActiveReport: (report: BloodReport) => void;
  loadSampleReport: (sampleId: string) => void;
  updateBiomarkerValue: (biomarkerId: string, value: number) => void;
  addNewReport: (report: BloodReport) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reportsList, setReportsList] = useState<BloodReport[]>(SAMPLE_REPORTS);
  const [activeReport, setActiveReport] = useState<BloodReport>(SAMPLE_REPORTS[0]);

  const summary = useMemo(() => {
    return summarizeReport(activeReport);
  }, [activeReport]);

  const loadSampleReport = (sampleId: string) => {
    const found = reportsList.find((r) => r.id === sampleId) || SAMPLE_REPORTS.find((r) => r.id === sampleId);
    if (found) {
      setActiveReport(found);
    }
  };

  const updateBiomarkerValue = (biomarkerId: string, value: number) => {
    setActiveReport((prev) => ({
      ...prev,
      biomarkers: {
        ...prev.biomarkers,
        [biomarkerId]: value,
      },
    }));
  };

  const addNewReport = (report: BloodReport) => {
    setReportsList((prev) => [report, ...prev]);
    setActiveReport(report);
  };

  return (
    <ReportsContext.Provider
      value={{
        activeReport,
        summary,
        reportsList,
        setActiveReport,
        loadSampleReport,
        updateBiomarkerValue,
        addNewReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports(): ReportsContextType {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
