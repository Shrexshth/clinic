// ============================================================================
// src/services/pdfExport.ts
//
// Generates and shares a clinical-grade PDF report summary using:
// - expo-print (HTML to PDF converter)
// - expo-sharing (native Android / iOS share dialog)
// ============================================================================

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BloodReportData, Biomarker, FoodItemRecommendation } from '../data/mock';
import { UserProfileEntity } from '../features/profile/repository';

export interface GeneratePdfOptions {
  report: BloodReportData;
  profile?: UserProfileEntity | null;
  foodRecommendations?: FoodItemRecommendation[];
}

/**
 * Builds HTML markup for the report summary.
 */
function buildReportHtml(options: GeneratePdfOptions): string {
  const { report, profile, foodRecommendations = [] } = options;

  const patientName = profile?.name || report.patientName || 'Alex Rivera';
  const age = profile?.age || 30;
  const sex = profile?.sex ? profile.sex.toUpperCase() : 'MALE';
  const diet = profile?.dietType ? profile.dietType.toUpperCase() : 'VEGETARIAN';
  const allergies = profile?.allergies && profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None declared';

  const normalBiomarkers = report.biomarkers.filter((b) => b.status === 'normal');
  const borderlineBiomarkers = report.biomarkers.filter((b) => b.status === 'borderline');
  const abnormalBiomarkers = report.biomarkers.filter((b) => b.status === 'abnormal');
  const flaggedBiomarkers = [...abnormalBiomarkers, ...borderlineBiomarkers];

  // Helper for status badge style
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'normal':
        return 'background-color: #E8F5E9; color: #1F9D61; border: 1px solid #C8E6C9;';
      case 'borderline':
        return 'background-color: #FFF8E1; color: #B27B00; border: 1px solid #FFE082;';
      case 'abnormal':
      default:
        return 'background-color: #FFEBEE; color: #E5533D; border: 1px solid #FFCDD2;';
    }
  };

  const flaggedRowsHtml = flaggedBiomarkers
    .map(
      (b) => `
      <tr>
        <td style="font-weight: 700; color: #1E1416;">${b.name}</td>
        <td style="color: #7A6B6D;">${b.category}</td>
        <td style="font-weight: 700; color: #6E0B14;">${b.value} ${b.unit}</td>
        <td style="color: #1F9D61;">${b.optimalMin} – ${b.optimalMax} ${b.unit}</td>
        <td>
          <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; ${getBadgeStyle(
            b.status
          )}">
            ${b.statusLabel}
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  const allBiomarkersRowsHtml = report.biomarkers
    .map(
      (b) => `
      <tr>
        <td style="font-weight: 600; color: #1E1416;">${b.name}</td>
        <td style="color: #7A6B6D; font-size: 12px;">${b.category}</td>
        <td style="font-weight: 700;">${b.value} <span style="font-size: 11px; color: #7A6B6D;">${b.unit}</span></td>
        <td style="color: #555; font-size: 12px;">${b.optimalMin} – ${b.optimalMax}</td>
        <td>
          <span style="display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 700; ${getBadgeStyle(
            b.status
          )}">
            ${b.statusLabel}
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  const nutritionHtml = foodRecommendations
    .slice(0, 6)
    .map(
      (f) => `
      <div style="margin-bottom: 12px; padding: 10px 14px; background-color: #FBF4F4; border-left: 4px solid #B3141F; border-radius: 6px;">
        <div style="font-weight: 700; color: #1E1416; font-size: 14px;">${f.food} <span style="font-weight: 400; color: #7A6B6D; font-size: 12px;">(${f.category})</span></div>
        <div style="font-size: 12px; color: #444; margin-top: 3px;">${f.reason}</div>
        <div style="font-size: 11px; color: #6E0B14; margin-top: 2px; font-style: italic;">Serving: ${f.servingAdvice}</div>
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>ClinixBridge Blood Report Summary - ${patientName}</title>
        <style>
          @page {
            margin: 20mm 15mm;
            size: A4 portrait;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1E1416;
            margin: 0;
            padding: 0;
            line-height: 1.45;
            background-color: #FFFFFF;
          }
          .header-box {
            border-bottom: 3px solid #B3141F;
            padding-bottom: 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand-title {
            font-size: 26px;
            font-weight: 800;
            color: #6E0B14;
            letter-spacing: -0.5px;
          }
          .brand-title span {
            color: #B3141F;
          }
          .brand-tagline {
            font-size: 12px;
            color: #7A6B6D;
            margin-top: 2px;
          }
          .report-meta {
            text-align: right;
            font-size: 12px;
            color: #555;
          }
          .patient-card {
            background-color: #FDF7F7;
            border: 1px solid #F0D7D9;
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
          .patient-field-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #7A6B6D;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .patient-field-value {
            font-size: 14px;
            font-weight: 700;
            color: #1E1416;
            margin-top: 2px;
          }
          .summary-strip {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
          }
          .metric-card {
            flex: 1;
            padding: 12px 14px;
            border-radius: 8px;
            text-align: center;
          }
          .metric-card.normal { background-color: #E8F5E9; border: 1px solid #C8E6C9; }
          .metric-card.borderline { background-color: #FFF8E1; border: 1px solid #FFE082; }
          .metric-card.abnormal { background-color: #FFEBEE; border: 1px solid #FFCDD2; }
          .metric-num {
            font-size: 22px;
            font-weight: 800;
          }
          .metric-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            margin-top: 2px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 800;
            color: #6E0B14;
            border-bottom: 2px solid #FCE8E9;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 20px;
          }
          th {
            background-color: #F8EDED;
            color: #6E0B14;
            text-align: left;
            padding: 8px 10px;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #E0C7C9;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #F0E5E5;
          }
          tr:nth-child(even) td {
            background-color: #FCF9F9;
          }
          .disclaimer-box {
            margin-top: 30px;
            padding: 12px 16px;
            background-color: #FCE8E9;
            border: 1px solid #F7B8BB;
            border-radius: 8px;
            font-size: 11px;
            color: #6E0B14;
            line-height: 1.5;
          }
          .disclaimer-title {
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header-box">
          <div>
            <div class="brand-title">Clinix<span>Bridge</span></div>
            <div class="brand-tagline">Clinical Blood Marker Intelligence & Targeted Nutrition</div>
          </div>
          <div class="report-meta">
            <div><strong>Report Date:</strong> ${report.date}</div>
            <div><strong>Laboratory:</strong> ${report.labName}</div>
          </div>
        </div>

        <!-- Patient Demographics -->
        <div class="patient-card">
          <div>
            <div class="patient-field-label">Patient Name</div>
            <div class="patient-field-value">${patientName}</div>
          </div>
          <div>
            <div class="patient-field-label">Age / Sex</div>
            <div class="patient-field-value">${age} Yrs • ${sex}</div>
          </div>
          <div>
            <div class="patient-field-label">Dietary Mode</div>
            <div class="patient-field-value">${diet}</div>
          </div>
          <div>
            <div class="patient-field-label">Allergies</div>
            <div class="patient-field-value" style="font-size: 12px;">${allergies}</div>
          </div>
        </div>

        <!-- Metric Summary Strip -->
        <div class="summary-strip">
          <div class="metric-card normal">
            <div class="metric-num" style="color: #1F9D61;">${normalBiomarkers.length}</div>
            <div class="metric-label" style="color: #1F9D61;">Normal Parameters</div>
          </div>
          <div class="metric-card borderline">
            <div class="metric-num" style="color: #B27B00;">${borderlineBiomarkers.length}</div>
            <div class="metric-label" style="color: #B27B00;">Borderline Parameters</div>
          </div>
          <div class="metric-card abnormal">
            <div class="metric-num" style="color: #E5533D;">${abnormalBiomarkers.length}</div>
            <div class="metric-label" style="color: #E5533D;">Abnormal (Actionable)</div>
          </div>
        </div>

        <!-- Flagged Parameters Table -->
        ${
          flaggedBiomarkers.length > 0
            ? `
          <div class="section-title">Priority Flagged Parameters (${flaggedBiomarkers.length} Actionable)</div>
          <table>
            <thead>
              <tr>
                <th>Biomarker</th>
                <th>Category</th>
                <th>Result</th>
                <th>Optimal Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${flaggedRowsHtml}
            </tbody>
          </table>
        `
            : ''
        }

        <!-- Nutrition Recommendations -->
        ${
          nutritionHtml
            ? `
          <div class="section-title">Personalized Indian Whole-Food Co-Factors</div>
          <div>
            ${nutritionHtml}
          </div>
        `
            : ''
        }

        <!-- Complete Laboratory Biomarkers -->
        <div class="section-title" style="page-break-before: always;">Complete Laboratory Panel (${report.biomarkers.length} Parameters)</div>
        <table>
          <thead>
            <tr>
              <th>Biomarker</th>
              <th>Category</th>
              <th>Measured Value</th>
              <th>Optimal Range</th>
              <th>Evaluation</th>
            </tr>
          </thead>
          <tbody>
            ${allBiomarkersRowsHtml}
          </tbody>
        </table>

        <!-- Medical Disclaimer -->
        <div class="disclaimer-box">
          <div class="disclaimer-title">Medical & Legal Advisory</div>
          ClinixBridge is a clinical education and wellness tool. This report summary and all associated dietary cofactors are generated for personal tracking and educational purposes only. They do NOT constitute medical diagnosis, clinical prognosis, or prescription. Always consult a board-certified physician or qualified healthcare provider before altering medications or initiating intensive nutritional changes.
        </div>
      </body>
    </html>
  `;
}

/**
 * Generates and shares a PDF report summary.
 */
export async function exportReportSummaryAsPdf(
  options: GeneratePdfOptions
): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    const html = buildReportHtml(options);

    // 1. Generate PDF file via expo-print
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // 2. Check if native sharing is supported on this platform
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `Share Blood Report Summary - ${options.report.date}`,
      });
    }

    return { success: true, uri };
  } catch (err: any) {
    console.warn('Error exporting report summary as PDF:', err);
    return { success: false, error: err?.message || 'Failed to generate PDF' };
  }
}
