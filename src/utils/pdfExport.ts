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
  teamId: string;
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
 * Normalize category string into one of the canonical categories:
 * 'Sub Junior' | 'Junior' | 'Senior' | 'General'
 */
function normalizeCategory(rawCategory: string | undefined): 'Sub Junior' | 'Junior' | 'Senior' | 'General' {
  if (!rawCategory) return 'General';
  const clean = rawCategory.trim().toLowerCase();
  if (clean.includes('sub') || clean.includes('sub-junior') || clean.includes('sub junior')) {
    return 'Sub Junior';
  }
  if (clean.includes('junior')) {
    return 'Junior';
  }
  if (clean.includes('senior')) {
    return 'Senior';
  }
  return 'General';
}

/**
 * Generate and download an official Festival Results PDF structured by Category:
 * 1. Sub Junior Results & Sub Junior Team Total
 * 2. Junior Results & Junior Team Total
 * 3. Senior Results & Senior Team Total
 * 4. General Results & General Team Total
 * 5. Grand Total (Overall Cumulative Standings)
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

  // Fast lookup maps for participants
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
  let allRecords: PDFResultRecord[] = [];

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
      const category = normalizeCategory(p.category || part?.category);
      const rankText = formatRank(r.rank, r.position);

      allRecords.push({
        programCode: p.code || 'EV-' + p.id.slice(-3),
        programTitle: p.name,
        category,
        admissionNo,
        participantName,
        chestNo: r.chestNo || part?.chestNo || '-',
        teamId: effectiveTeamId,
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
    allRecords = allRecords.filter((r) => {
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

  // Define category section order requested: Sub Junior -> Junior -> Senior -> General
  const categorySections: Array<{
    key: 'Sub Junior' | 'Junior' | 'Senior' | 'General';
    title: string;
    badgeBg: [number, number, number];
  }> = [
    { key: 'Sub Junior', title: 'SUB JUNIOR DIVISION', badgeBg: [14, 165, 233] }, // Sky-500
    { key: 'Junior', title: 'JUNIOR DIVISION', badgeBg: [16, 185, 129] },       // Emerald-500
    { key: 'Senior', title: 'SENIOR DIVISION', badgeBg: [139, 92, 246] },       // Violet-500
    { key: 'General', title: 'GENERAL / OPEN DIVISION', badgeBg: [245, 158, 11] }, // Amber-500
  ];

  // Initialize jsPDF document (Portrait A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw Header Banner on current page
  const drawHeaderBanner = () => {
    // Header Banner styling
    doc.setFillColor(30, 41, 59); // Slate-900
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Gold accent bar
    doc.setFillColor(245, 158, 11); // Amber-500
    doc.rect(0, 26, pageWidth, 1.8, 'F');

    // Title & Subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(festName.toUpperCase(), 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // Slate-300
    doc.text(`${festTagline} • Official Master Results & Category Points Statement`, 14, 17);

    // Print Date & Summary Badge on top right
    const dateStr = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    doc.setFontSize(7.5);
    doc.setTextColor(245, 158, 11); // Amber
    doc.text(`Generated: ${dateStr}`, pageWidth - 14, 11, { align: 'right' });
    doc.setTextColor(255, 255, 255);
    doc.text(`Total Records: ${allRecords.length} Entries`, pageWidth - 14, 17, { align: 'right' });
  };

  drawHeaderBanner();

  let startY = 32;

  // Filter notes if applicable
  if (options.filterProgramTitle || options.filterHouseName || options.searchTerm) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
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
    doc.text(`Filtered by: ${filterNotes.join(' | ')}`, 14, 31);
    startY = 34;
  }

  // Track category team point totals for building grand total
  // Map: category -> (teamId -> points)
  const categoryTeamPoints: Record<string, Record<string, { points: number; golds: number; silvers: number; bronzes: number }>> = {
    'Sub Junior': {},
    'Junior': {},
    'Senior': {},
    'General': {},
  };

  teams.forEach((t) => {
    ['Sub Junior', 'Junior', 'Senior', 'General'].forEach((cat) => {
      categoryTeamPoints[cat][t.id] = { points: 0, golds: 0, silvers: 0, bronzes: 0 };
    });
  });

  // Accumulate points & podium medals per category per team
  allRecords.forEach((r) => {
    const cat = r.category;
    if (r.teamId && categoryTeamPoints[cat] && categoryTeamPoints[cat][r.teamId]) {
      categoryTeamPoints[cat][r.teamId].points += Number(r.pointsAwarded) || 0;
      if (r.rankNumber === 1) categoryTeamPoints[cat][r.teamId].golds += 1;
      else if (r.rankNumber === 2) categoryTeamPoints[cat][r.teamId].silvers += 1;
      else if (r.rankNumber === 3) categoryTeamPoints[cat][r.teamId].bronzes += 1;
    }
  });

  // Helper function to check page overflow before rendering a new section
  const ensureSpace = (neededHeight: number) => {
    if (startY + neededHeight > pageHeight - 16) {
      doc.addPage();
      drawHeaderBanner();
      startY = 32;
    }
  };

  // =========================================================================
  // ITERATE OVER EACH CATEGORY (Sub Junior -> Junior -> Senior -> General)
  // =========================================================================
  categorySections.forEach((catMeta) => {
    // 1. Filter and sort results for this category
    const catRecords = allRecords.filter((r) => r.category === catMeta.key);
    catRecords.sort((a, b) => {
      const progComp = a.programTitle.localeCompare(b.programTitle);
      if (progComp !== 0) return progComp;
      return a.rankNumber - b.rankNumber;
    });

    ensureSpace(24);

    // Section Category Header Banner
    doc.setFillColor(...catMeta.badgeBg);
    doc.rect(14, startY, 4, 9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59); // Slate-900
    doc.text(catMeta.title, 21, startY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`(${catRecords.length} program results published)`, 92, startY + 6.5);

    startY += 12;

    // A. CATEGORY RESULTS TABLE
    const resultsHeaders = [['#', 'Program', 'Ad No', 'Name', 'Rank', 'Team / House', 'Points']];
    const resultsRows = catRecords.map((r, idx) => [
      idx + 1,
      r.programCode ? `${r.programCode} - ${r.programTitle}` : r.programTitle,
      r.admissionNo,
      r.participantName,
      r.rankText,
      r.teamName,
      r.pointsAwarded > 0 ? `${r.pointsAwarded} pts` : '-',
    ]);

    if (resultsRows.length === 0) {
      resultsRows.push(['-', 'No published results in this category', '-', '-', '-', '-', '-']);
    }

    autoTable(doc, {
      head: resultsHeaders,
      body: resultsRows,
      startY,
      margin: { left: 14, right: 14, bottom: 18 },
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: catMeta.badgeBg,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Slate-50
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // #
        1: { cellWidth: 54 },                  // Program
        2: { cellWidth: 22, fontStyle: 'bold', halign: 'center' }, // Ad No
        3: { cellWidth: 42, fontStyle: 'bold' }, // Name
        4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // Rank
        5: { cellWidth: 24 },                  // Team
        6: { cellWidth: 16, halign: 'center', fontStyle: 'bold' }, // Points
      },
      didParseCell: (data) => {
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
        renderFooter(data.pageNumber);
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 6;

    // B. TOTAL OF CATEGORY POINTS ON BASIS OF TEAM
    ensureSpace(24);

    // Compute sorted team totals for this specific category
    const catTeamScores = teams.map((t) => {
      const stats = categoryTeamPoints[catMeta.key][t.id] || { points: 0, golds: 0, silvers: 0, bronzes: 0 };
      return {
        id: t.id,
        name: t.name,
        color: t.color,
        points: stats.points,
        golds: stats.golds,
        silvers: stats.silvers,
        bronzes: stats.bronzes,
      };
    });

    // Sort descending by category points, then golds
    catTeamScores.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.golds - a.golds;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`TOTAL OF ${catMeta.key.toUpperCase()} POINTS (BY TEAM / HOUSE)`, 14, startY);

    startY += 2.5;

    const catTeamHeaders = [['Rank', 'Team / House', `${catMeta.key} Points`, 'Podium Positions (1st / 2nd / 3rd)']];
    const catTeamRows = catTeamScores.map((t, idx) => {
      const rankStr = idx === 0 ? '1st [Lead]' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : `${idx + 1}th`;
      const podium = `${t.golds} Gold(s) • ${t.silvers} Silver(s) • ${t.bronzes} Bronze(s)`;
      return [
        rankStr,
        t.name,
        `${t.points} PTS`,
        podium,
      ];
    });

    autoTable(doc, {
      head: catTeamHeaders,
      body: catTeamRows,
      startY,
      margin: { left: 14, right: 14, bottom: 18 },
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
        fillColor: [51, 65, 85], // Slate-700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold', halign: 'center' }, // Rank
        1: { cellWidth: 62, fontStyle: 'bold' },                   // Team
        2: { cellWidth: 32, fontStyle: 'bold', halign: 'center' }, // Points
        3: { cellWidth: 68, halign: 'center' },                   // Podium
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [254, 249, 195]; // Amber-50
          }
          if (data.column.index === 2) {
            data.cell.styles.textColor = [79, 70, 229]; // Indigo-600
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      didDrawPage: (data) => {
        renderFooter(data.pageNumber);
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 10;
  });

  // =========================================================================
  // 5. GRAND TOTAL TABLE (Comprehensive Team Leaderboard Across All Categories)
  // =========================================================================
  ensureSpace(36);

  doc.setFillColor(30, 41, 59); // Slate-900
  doc.rect(14, startY, 4, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('GRAND TOTAL • OVERALL TEAM STANDINGS', 21, startY + 7);

  startY += 13;

  // Compute grand total summary per team
  const grandTotalTeams = teams.map((t) => {
    const subPts = categoryTeamPoints['Sub Junior'][t.id]?.points || 0;
    const junPts = categoryTeamPoints['Junior'][t.id]?.points || 0;
    const senPts = categoryTeamPoints['Senior'][t.id]?.points || 0;
    const genPts = categoryTeamPoints['General'][t.id]?.points || 0;

    // Use official team totalPoints if available or sum category points
    const computedTotal = subPts + junPts + senPts + genPts;
    const officialTotal = Number(t.totalPoints ?? (t.artsPoints + t.sportsPoints)) || computedTotal;
    const totalMarks = Math.max(officialTotal, computedTotal);

    return {
      id: t.id,
      name: t.name,
      subPts,
      junPts,
      senPts,
      genPts,
      artsPoints: t.artsPoints || 0,
      sportsPoints: t.sportsPoints || 0,
      totalMarks,
      golds: t.golds || 0,
      silvers: t.silvers || 0,
      bronzes: t.bronzes || 0,
      rank: t.rank || 1,
    };
  });

  // Sort grand totals descending
  grandTotalTeams.sort((a, b) => {
    if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
    if (b.golds !== a.golds) return b.golds - a.golds;
    return b.silvers - a.silvers;
  });

  const grandHeaders = [
    ['Rank', 'Team / House', 'Sub Junior', 'Junior', 'Senior', 'General', 'Grand Total', 'Medals (G/S/B)'],
  ];

  const grandRows = grandTotalTeams.map((t, idx) => {
    const rankBadge = idx === 0 ? '1st [Champion]' : idx === 1 ? '2nd' : idx === 2 ? '3rd' : `${idx + 1}th`;
    const medals = `${t.golds}G • ${t.silvers}S • ${t.bronzes}B`;
    return [
      rankBadge,
      t.name,
      t.subPts.toString(),
      t.junPts.toString(),
      t.senPts.toString(),
      t.genPts.toString(),
      `${t.totalMarks} PTS`,
      medals,
    ];
  });

  autoTable(doc, {
    head: grandHeaders,
    body: grandRows,
    startY,
    margin: { left: 14, right: 14, bottom: 18 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 2.4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 2.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' }, // Rank
      1: { cellWidth: 44, fontStyle: 'bold' },                   // Team
      2: { cellWidth: 18, halign: 'center' },                   // Sub Junior
      3: { cellWidth: 18, halign: 'center' },                   // Junior
      4: { cellWidth: 18, halign: 'center' },                   // Senior
      5: { cellWidth: 18, halign: 'center' },                   // General
      6: { cellWidth: 24, fontStyle: 'bold', halign: 'center' }, // Grand Total
      7: { cellWidth: 20, halign: 'center' },                   // Medals
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.row.index === 0) {
          data.cell.styles.fillColor = [254, 249, 195]; // Amber-50 (Champion gold accent)
        }
        if (data.column.index === 6) {
          data.cell.styles.textColor = [79, 70, 229]; // Indigo-600
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: (data) => {
      renderFooter(data.pageNumber);
    },
  });

  // Footer renderer with total page count calculation
  function renderFooter(pageNumber: number) {
    const totalPages = (doc as any).internal.getNumberOfPages();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate-400

    // Left footer
    doc.text(
      `Confidential • ${festName} Official Results & Marks Statement • Certified Records`,
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
    doc.setLineWidth(0.15);
    doc.line(14, pageHeight - 11, pageWidth - 14, pageHeight - 11);
  }

  // Safe file name with timestamp
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const cleanFestName = festName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filename = `${cleanFestName}_category_results_and_totals_${dateStr.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  doc.save(filename);
}

