import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArtsProgram, Team, Participant, FestConfig } from '../types/festival';

export interface PDFResultRecord {
  programCode: string;
  programTitle: string;
  category: string;
  admissionNo: string;
  participantName: string;
  chestNo: string;
  teamName: string;
  rankText: string;
  rankNumber: number;
  grade: string;
  pointsAwarded: number;
  status?: string;
}

export interface ExportPDFOptions {
  festConfig?: FestConfig;
  filterProgramId?: string;
  filterProgramTitle?: string;
  filterHouseId?: string;
  filterHouseName?: string;
  searchTerm?: string;
  onlyPublished?: boolean;
}

/**
 * Format rank for clean, clear display (e.g., "1st", "2nd", "3rd", or numeric)
 */
function formatRank(rank: number | undefined, position: string | undefined): string {
  if (position && position !== '-' && position.trim() !== '') {
    return position.trim();
  }
  if (!rank) return '-';
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

/**
 * Generate and download an official Festival Results PDF.
 * Columns: Sl No, Program, Ad No, Name, Ranks in Program, Team, Category
 */
export function generateResultsPDF(
  artsPrograms: ArtsProgram[],
  teams: Team[],
  participants: Participant[],
  options: ExportPDFOptions = {}
): void {
  const festName = options.festConfig?.festivalName || options.festConfig?.name || 'AHIA FEST 2026';
  const festTagline = options.festConfig?.tagline || 'Annual Arts & Athletics Festival';
  const festYear = options.festConfig?.year || '2026';

  // Build a fast lookup map for participants by id, admissionNo, chestNo
  const participantMapById = new Map<string, Participant>();
  const participantMapByChest = new Map<string, Participant>();
  const participantMapByAdm = new Map<string, Participant>();

  participants.forEach((p) => {
    if (p.id) participantMapById.set(p.id, p);
    if (p.chestNo) participantMapByChest.set(String(p.chestNo).trim().toLowerCase(), p);
    if (p.admissionNo) participantMapByAdm.set(String(p.admissionNo).trim().toLowerCase(), p);
  });

  const teamMap = new Map<string, Team>();
  teams.forEach((t) => {
    teamMap.set(t.id, t);
  });

  // Flatten and extract all results across programs
  let records: PDFResultRecord[] = [];

  artsPrograms.forEach((p) => {
    // If program filter is active and doesn't match, skip
    if (
      options.filterProgramId &&
      options.filterProgramId !== 'All' &&
      p.id !== options.filterProgramId &&
      p.code !== options.filterProgramId
    ) {
      return;
    }

    const progResults = p.results || [];
    progResults.forEach((r) => {
      // Find matching participant to guarantee accurate Admission No & Category
      const part =
        (r.participantId ? participantMapById.get(r.participantId) : undefined) ||
        (r.chestNo ? participantMapByChest.get(String(r.chestNo).trim().toLowerCase()) : undefined) ||
        (r.admissionNo ? participantMapByAdm.get(String(r.admissionNo).trim().toLowerCase()) : undefined);

      const effectiveTeamId = r.teamId || part?.teamId || '';
      // If team/house filter is active and doesn't match, skip
      if (
        options.filterHouseId &&
        options.filterHouseId !== 'All' &&
        effectiveTeamId !== options.filterHouseId
      ) {
        return;
      }

      const team = teamMap.get(effectiveTeamId);
      const admissionNo = r.admissionNo || part?.admissionNo || '-';
      const participantName = r.participantName || part?.name || 'Participant';
      const category = p.category || part?.category || 'General';
      const rankText = formatRank(r.rank, r.position);

      records.push({
        programCode: p.code || 'EV-' + p.id.slice(-3),
        programTitle: p.name,
        category,
        admissionNo,
        participantName,
        chestNo: r.chestNo || part?.chestNo || '-',
        teamName: team?.name || 'Independent',
        rankText,
        rankNumber: r.rank || 99,
        grade: r.grade || '-',
        pointsAwarded: r.pointsAwarded || 0,
        status: r.status || p.publishStatus || 'Published',
      });
    });
  });

  // Apply search filter if provided
  if (options.searchTerm && options.searchTerm.trim() !== '') {
    const q = options.searchTerm.toLowerCase().trim();
    const cleanQ = q.replace(/[\s-_]/g, '');
    records = records.filter((r) => {
      const cleanAdm = String(r.admissionNo || '').toLowerCase().replace(/[\s-_]/g, '');
      return (
        cleanAdm.includes(cleanQ) ||
        r.programTitle.toLowerCase().includes(q) ||
        r.programCode.toLowerCase().includes(q) ||
        r.participantName.toLowerCase().includes(q) ||
        r.teamName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.rankText.toLowerCase().includes(q)
      );
    });
  }

  // Sort by Program Code/Title then by Rank ascending (1st, 2nd, 3rd)
  records.sort((a, b) => {
    const progComp = a.programTitle.localeCompare(b.programTitle);
    if (progComp !== 0) return progComp;
    return a.rankNumber - b.rankNumber;
  });

  // Initialize jsPDF document (Portrait A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Banner styling
  doc.setFillColor(30, 41, 59); // Slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bar
  doc.setFillColor(245, 158, 11); // Amber-500
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(festName.toUpperCase(), 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text(`${festTagline} • Official Master Results Statement (${festYear})`, 14, 18);

  // Print Date & Summary Badge on top right
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text(`Generated: ${dateStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.text(`Total Records: ${records.length} Entries`, pageWidth - 14, 18, { align: 'right' });

  // Sub-header filter note if applicable
  let startY = 36;
  if (options.filterProgramTitle || options.filterHouseName || options.searchTerm) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const filterNotes: string[] = [];
    if (options.filterProgramTitle && options.filterProgramTitle !== 'All') {
      filterNotes.push(`Program: ${options.filterProgramTitle}`);
    }
    if (options.filterHouseName && options.filterHouseName !== 'All') {
      filterNotes.push(`House: ${options.filterHouseName}`);
    }
    if (options.searchTerm) {
      filterNotes.push(`Search: "${options.searchTerm}"`);
    }
    doc.text(`Filtered by: ${filterNotes.join(' | ')}`, 14, 33);
    startY = 36;
  }

  // =========================================================================
  // PRESENT TOTAL MARKS OF TEAMS / HOUSES (Leaderboard Summary Card)
  // =========================================================================
  if (teams && teams.length > 0) {
    // Sort teams by totalPoints (descending), then golds, then artsPoints
    const sortedTeams = [...teams].sort((a, b) => {
      const totB = Number(b.totalPoints ?? (b.artsPoints + b.sportsPoints)) || 0;
      const totA = Number(a.totalPoints ?? (a.artsPoints + a.sportsPoints)) || 0;
      if (totB !== totA) return totB - totA;
      if ((b.golds || 0) !== (a.golds || 0)) return (b.golds || 0) - (a.golds || 0);
      return (b.artsPoints || 0) - (a.artsPoints || 0);
    });

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // Slate-900
    doc.text('PRESENT TOTAL MARKS OF TEAMS / HOUSES', 14, startY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('(Live Standings Across Arts & Sports Events)', 95, startY);

    startY += 3;

    // Team summary table
    const teamHeaders = [['Rank', 'Team / House', 'Arts Marks', 'Sports Marks', 'Total Marks', 'Medals (G/S/B)']];
    const teamRows = sortedTeams.map((t, idx) => {
      const currentRank = t.rank || idx + 1;
      const rankBadge = currentRank === 1 ? '1st [Lead]' : currentRank === 2 ? '2nd' : currentRank === 3 ? '3rd' : `${currentRank}th`;
      const artsPts = Number(t.artsPoints || 0);
      const sportsPts = Number(t.sportsPoints || 0);
      const totalPts = Number(t.totalPoints ?? (artsPts + sportsPts)) || 0;
      const medals = `${t.golds || 0}G • ${t.silvers || 0}S • ${t.bronzes || 0}B`;

      return [
        rankBadge,
        t.name,
        artsPts.toString(),
        sportsPts.toString(),
        totalPts.toString(),
        medals,
      ];
    });

    autoTable(doc, {
      head: teamHeaders,
      body: teamRows,
      startY,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 1.8,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 41, 59], // Slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold', halign: 'center' }, // Rank
        1: { cellWidth: 50, fontStyle: 'bold' },                   // Team
        2: { cellWidth: 26, halign: 'center' },                   // Arts Marks
        3: { cellWidth: 26, halign: 'center' },                   // Sports Marks
        4: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }, // Total Marks
        5: { cellWidth: 30, halign: 'center' },                   // Medals
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Highlight 1st place row with light gold background
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [254, 249, 195]; // Amber-50
          }
          // Highlight Total Marks column in bold
          if (data.column.index === 4) {
            data.cell.styles.textColor = [79, 70, 229]; // Indigo-600
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 8;
  }

  // =========================================================================
  // PROGRAM-WISE PUBLISHED RESULTS TABLE
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('PROGRAM-WISE RESULTS BREAKDOWN', 14, startY);

  startY += 3;

  // Prepare table data
  // Requirements: program, ad no, name, ranks in program, team, category
  const headers = [
    ['#', 'Program', 'Ad No', 'Name', 'Rank', 'Team / House', 'Category'],
  ];

  const bodyData = records.map((r, index) => [
    index + 1,
    r.programCode ? `${r.programCode} - ${r.programTitle}` : r.programTitle,
    r.admissionNo,
    r.participantName,
    r.rankText,
    r.teamName,
    r.category,
  ]);

  if (bodyData.length === 0) {
    bodyData.push(['-', 'No published results available', '-', '-', '-', '-', '-']);
  }

  // Generate Table with AutoTable
  autoTable(doc, {
    head: headers,
    body: bodyData,
    startY,
    margin: { left: 14, right: 14, bottom: 18 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // #
      1: { cellWidth: 50 },                  // Program
      2: { cellWidth: 22, fontStyle: 'bold', halign: 'center' }, // Ad No
      3: { cellWidth: 38, fontStyle: 'bold' }, // Name
      4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }, // Rank
      5: { cellWidth: 26 },                  // Team
      6: { cellWidth: 20, halign: 'center' }, // Category
    },
    didParseCell: (data) => {
      // Highlight ranks in program
      if (data.section === 'body' && data.column.index === 4) {
        const val = String(data.cell.raw || '');
        if (val.includes('1st') || val === '1') {
          data.cell.styles.textColor = [180, 83, 9]; // Amber-700
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('2nd') || val === '2') {
          data.cell.styles.textColor = [71, 85, 105]; // Slate-600
          data.cell.styles.fontStyle = 'bold';
        } else if (val.includes('3rd') || val === '3') {
          data.cell.styles.textColor = [194, 65, 12]; // Orange-700
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: (data) => {
      // Footer with page numbering and verification statement
      const pageNumber = data.pageNumber;
      const totalPages = (doc as any).internal.getNumberOfPages();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate-400

      // Left footer
      doc.text(
        `Confidential • ${festName} Administration Portal • Official Results Sheet`,
        14,
        pageHeight - 8
      );

      // Right footer
      doc.text(
        `Page ${pageNumber} of ${totalPages}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: 'right' }
      );

      // Bottom subtle rule
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
    },
  });

  // Safe file name with timestamp
  const cleanFestName = festName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filename = `${cleanFestName}_official_results_${dateStr.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  doc.save(filename);
}
