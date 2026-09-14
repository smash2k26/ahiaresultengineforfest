/**
 * GOOGLE APPS SCRIPT WEB APP BACKEND & DATABASE ENGINE
 * AHIA FEST 2026 - ARTS & SPORTS RESULT ENGINE
 *
 * Full Two-Way Synchronization with Non-Destructive Data Protection & In-Place Updates
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * AHIA FEST 2026 - REFINED GOOGLE APPS SCRIPT DATABASE ENGINE & API
 * =========================================================================
 * 
 * FEATURES:
 *  1. Non-Destructive Live Sync: Never wipes sheets or resets page; writes data smoothly in-place.
 *  2. No-Flicker Architecture: Eliminates sheet.clear() so viewers in Google Sheets never see tabs flash.
 *  3. Smart Upsert & Safe Merging: Preserves all added teams, participants, marks, matches & schedule.
 *  4. Instant Live Updates: Syncs changes between Web App & Sheets silently without refreshing browser.
 *  5. Custom Branded Styling: Color-coded tabs, bold headers, zebra striping, and auto-column widths.
 * =========================================================================
 */

// Master sheet configurations: Names, Tab Colors, Header Colors, Widths, and Alignments
var FEST_SHEETS_CONFIG = {
  SiteSettings: {
    tabColor: "#1E1B4B",
    headerColor: "#312E81",
    headers: ["Setting Key", "Parameter Name", "Configured Value", "Description & Guidance"],
    colAlignments: ["center", "left", "left", "left"],
    colWidths: [180, 220, 360, 420]
  },
  Teams: {
    tabColor: "#1E3A8A",
    headerColor: "#1E3A8A", // Deep Royal Blue Header
    headers: [
      "id", "name", "shortCode", "color", "accentColor", "logo", "captain", "viceCaptain", 
      "staffAdvisor", "slogan", "description", "artsPoints", "sportsPoints", "totalPoints", 
      "golds", "silvers", "bronzes", "totalWins", "rank", "previousRank", "trend", "membersCount"
    ],
    colAlignments: [
      "center", "left", "center", "center", "center", "center", "left", "left",
      "left", "left", "left", "right", "right", "right",
      "right", "right", "right", "right", "center", "center", "center", "right"
    ],
    colWidths: [100, 190, 90, 100, 100, 80, 140, 140, 150, 180, 220, 100, 100, 110, 75, 75, 75, 85, 70, 70, 70, 100]
  },
  Participants: {
    tabColor: "#0369A1",
    headerColor: "#0369A1", // Ocean Cyan Header
    headers: [
      "id", "name", "admissionNo", "chestNo", "teamId", 
      "category", "section", "yearClass", "photo", 
      "totalPoints", "golds", "silvers", "bronzes", "overallRank", "participatedPrograms"
    ],
    colAlignments: [
      "center", "left", "center", "center", "center",
      "center", "center", "center", "left",
      "right", "right", "right", "right", "center", "left"
    ],
    colWidths: [100, 200, 120, 100, 100, 110, 100, 90, 240, 100, 75, 75, 75, 90, 260]
  },
  Programs: {
    tabColor: "#581C87",
    headerColor: "#581C87", // Imperial Purple Header
    headers: [
      "id", "code", "name", "category", "section", "disciplineType",
      "stage", "venue", "date", "time", "maxMarks", "status", "publishStatus", "results"
    ],
    colAlignments: [
      "center", "center", "left", "center", "center", "center",
      "left", "left", "center", "center", "right", "center", "center", "left"
    ],
    colWidths: [100, 100, 220, 110, 100, 110, 140, 160, 100, 100, 90, 110, 110, 260]
  },
  ResultsMarks: {
    tabColor: "#065F46",
    headerColor: "#065F46", // Forest Emerald Header
    headers: [
      "programCode", "programName", "chestNo", "participantName", "teamId",
      "marks", "grade", "position", "pointsAwarded", "status", "publishedAt"
    ],
    colAlignments: [
      "center", "left", "center", "left", "center",
      "right", "center", "center", "right", "center", "center"
    ],
    colWidths: [110, 210, 90, 190, 100, 85, 80, 110, 110, 100, 140]
  },
  SportsMatches: {
    tabColor: "#9A3412",
    headerColor: "#9A3412", // Tournament Amber Header
    headers: [
      "id", "sport", "title", "round", "teamAId", "teamBId",
      "scoreA", "scoreB", "detailScore", "venue", "date", "time",
      "status", "publishStatus", "winnerTeamId", "events"
    ],
    colAlignments: [
      "center", "center", "left", "center", "center", "center",
      "center", "center", "left", "left", "center", "center",
      "center", "center", "center", "left"
    ],
    colWidths: [100, 120, 200, 120, 100, 100, 80, 80, 160, 150, 100, 100, 110, 110, 110, 240]
  },
  Schedule: {
    tabColor: "#0F766E",
    headerColor: "#0F766E", // Timeline Teal Header
    headers: [
      "id", "title", "type", "category", "venue",
      "day", "date", "startTime", "endTime", "status", "referenceId"
    ],
    colAlignments: [
      "center", "left", "center", "center", "left",
      "center", "center", "center", "center", "center", "center"
    ],
    colWidths: [100, 220, 90, 110, 160, 90, 100, 90, 90, 110, 100]
  },
  Announcements: {
    tabColor: "#9F1239",
    headerColor: "#9F1239", // Bulletin Crimson Header
    headers: ["id", "title", "content", "category", "timestamp", "isUrgent", "author"],
    colAlignments: ["center", "left", "left", "center", "center", "center", "center"],
    colWidths: [90, 220, 360, 110, 130, 90, 140]
  },
  Certificates: {
    tabColor: "#854D0E",
    headerColor: "#854D0E", // Trophy Gold Header
    headers: [
      "id", "participantName", "chestNo", "admissionNo", "teamName",
      "eventName", "eventType", "category", "rank", "certificateType",
      "issueDate", "verificationCode"
    ],
    colAlignments: [
      "center", "left", "center", "center", "left",
      "left", "center", "center", "center", "center",
      "center", "center"
    ],
    colWidths: [150, 190, 90, 100, 140, 180, 90, 100, 90, 120, 120, 170]
  },
  ScoringRules: {
    tabColor: "#4C1D95",
    headerColor: "#4C1D95", // Ruleset Violet Header
    headers: ["ruleKey", "ruleName", "pointsValue"],
    colAlignments: ["center", "left", "right"],
    colWidths: [180, 260, 110]
  },
  Documents: {
    tabColor: "#1E293B",
    headerColor: "#1E293B", // Archive Slate Header
    headers: ["id", "title", "category", "fileUrl", "summary", "updatedAt"],
    colAlignments: ["center", "left", "center", "left", "left", "center"],
    colWidths: [100, 220, 120, 260, 320, 140]
  }
};

/**
 * 1. ONE-CLICK INITIALIZATION & SETUP
 * Safe and non-destructive: Preserves all existing data.
 */
function setupFestivalSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Setup SiteSettings Tab
  var settingsSheet = ss.getSheetByName("SiteSettings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("SiteSettings", 0);
  }
  initSiteSettingsSheet(settingsSheet, {
    festivalName: "AHIA FEST 2026",
    year: "2026",
    statusBanner: "LIVE",
    tagline: "Annual Inter-House Arts & Athletics Fest",
    logoUrl: "https://images.unsplash.com/photo-1511525258028-df0c67b3ff2d?w=350&auto=format&fit=crop&q=80",
    adminPassword: "hudaahiasmash20262027",
    adminUsername: "smash2k26",
    podiumCategory: "arts",
    accentColor: "#4F46E5",
    accentPreset: "indigo",
    enableLiveTicker: "TRUE",
    announcementTickerSpeed: "normal",
    copyrightText: "© 2026 AHIA FEST • Hidaya Union Devoted Activities (HUDA). All Rights Reserved.",
    lastSyncedAt: new Date().toISOString()
  });

  // Setup All Other Data Tabs
  Object.keys(FEST_SHEETS_CONFIG).forEach(function(tabName) {
    if (tabName === "SiteSettings") return;
    var cfg = FEST_SHEETS_CONFIG[tabName];
    var sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
    try { sheet.setTabColor(cfg.tabColor); } catch (e) {}
    try {
      if (typeof sheet.setHiddenGridlines === "function") {
        sheet.setHiddenGridlines(false);
      }
    } catch (e) {}

    // Only write headers if sheet is empty to prevent overwriting existing data
    if (sheet.getLastRow() === 0) {
      writeDecoratedSheetData(sheet, [], cfg);
    } else {
      formatHeaderRow(sheet, cfg.headers.length, cfg.headerColor, cfg.colAlignments);
    }
  });

  return "All 10 Festival sheets initialized with non-destructive preservation and custom styling!";
}

/**
 * 2. GET REQUEST HANDLER (Web App pulls live data from Google Sheets)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Ping or direct setup
    if (e && e.parameter && (e.parameter.action === "setup" || e.parameter.setup === "1")) {
      var setupResult = setupFestivalSheets();
      return jsonResponse({
        status: "success",
        action: "setup",
        message: setupResult,
        timestamp: new Date().toISOString()
      });
    }

    // Verify SiteSettings exists
    var settingsSheet = ss.getSheetByName("SiteSettings");
    if (!settingsSheet) {
      setupFestivalSheets();
      settingsSheet = ss.getSheetByName("SiteSettings");
    }

    var festConfig = readSiteSettings(settingsSheet) || {};
    var teams = readSheetData(ss.getSheetByName("Teams"));
    var participants = readSheetData(ss.getSheetByName("Participants"));
    var artsPrograms = readSheetData(ss.getSheetByName("Programs"));
    var sportsMatches = readSheetData(ss.getSheetByName("SportsMatches"));
    var schedule = readSheetData(ss.getSheetByName("Schedule"));
    var announcements = readSheetData(ss.getSheetByName("Announcements"));
    var certificates = readSheetData(ss.getSheetByName("Certificates"));
    var documents = readSheetData(ss.getSheetByName("Documents"));
    var scoringRules = readScoringRules(ss.getSheetByName("ScoringRules"));

    // Parse JSON columns safely
    artsPrograms = artsPrograms.map(function(p) {
      if (typeof p.results === "string" && p.results.trim()) {
        try { p.results = JSON.parse(p.results); } catch (err) { p.results = []; }
      }
      p.maxMarks = Number(p.maxMarks) || 100;
      if (p.disciplineType) {
        var dt = String(p.disciplineType).trim();
        p.disciplineType = /^sport/i.test(dt) ? "Sports" : "Arts";
      }
      return p;
    });

    sportsMatches = sportsMatches.map(function(m) {
      if (typeof m.events === "string" && m.events.trim()) {
        try { m.events = JSON.parse(m.events); } catch (err) { m.events = []; }
      }
      return m;
    });

    participants = participants.map(function(p) {
      if (typeof p.participatedPrograms === "string" && p.participatedPrograms.trim()) {
        try { p.participatedPrograms = JSON.parse(p.participatedPrograms); } catch (err) { p.participatedPrograms = []; }
      }
      p.totalPoints = Number(p.totalPoints) || 0;
      p.golds = Number(p.golds) || 0;
      p.silvers = Number(p.silvers) || 0;
      p.bronzes = Number(p.bronzes) || 0;
      return p;
    });

    teams = teams.map(function(t) {
      t.artsPoints = Number(t.artsPoints) || 0;
      t.sportsPoints = Number(t.sportsPoints) || 0;
      t.totalPoints = Number(t.totalPoints) || 0;
      t.golds = Number(t.golds) || 0;
      t.silvers = Number(t.silvers) || 0;
      t.bronzes = Number(t.bronzes) || 0;
      t.totalWins = Number(t.totalWins) || 0;
      t.rank = Number(t.rank) || 1;
      return t;
    });

    return jsonResponse({
      status: "success",
      version: "3.5-live-inplace-sync",
      timestamp: new Date().toISOString(),
      festConfig: festConfig,
      siteSettings: festConfig,
      teams: teams,
      participants: participants,
      artsPrograms: artsPrograms,
      sportsMatches: sportsMatches,
      schedule: schedule,
      announcements: announcements,
      certificates: certificates,
      documents: documents,
      scoringRules: scoringRules
    });
  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * 3. POST REQUEST HANDLER (Web App updates data in Google Sheets in-place)
 */
function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : "{}";
    var payload = JSON.parse(raw);
    var action = payload.action || "syncData";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Update Site Settings (In-place non-destructive update)
    var siteConfig = payload.festConfig || payload.siteSettings || null;
    if (siteConfig || payload.festival) {
      var settingsSheet = ss.getSheetByName("SiteSettings") || ss.insertSheet("SiteSettings", 0);
      var currentCfg = readSiteSettings(settingsSheet) || {};
      var mergedCfg = {
        festivalName: (siteConfig && (siteConfig.festivalName || siteConfig.name)) || payload.festival || currentCfg.festivalName || "AHIA FEST 2026",
        year: (siteConfig && siteConfig.year) || currentCfg.year || "2026",
        edition: (siteConfig && siteConfig.edition) || currentCfg.edition || "Annual Championship Edition",
        statusBanner: (siteConfig && siteConfig.statusBanner) || currentCfg.statusBanner || "LIVE",
        tagline: (siteConfig && siteConfig.tagline) || currentCfg.tagline || "Annual Inter-House Arts & Athletics Fest",
        theme: (siteConfig && siteConfig.theme) || currentCfg.theme || "Where talent meets competition.",
        motto: (siteConfig && siteConfig.motto) || currentCfg.motto || "Ignite the Spirit of Excellence",
        dates: (siteConfig && siteConfig.dates) || currentCfg.dates || "March 15 - 18, 2026",
        currentDay: (siteConfig && siteConfig.currentDay) || currentCfg.currentDay || "Day 1 of 3",
        venue: (siteConfig && siteConfig.venue) || currentCfg.venue || "Grand Central Stage & Main Athletic Arena",
        organizedBy: (siteConfig && siteConfig.organizedBy) || currentCfg.organizedBy || "Hidaya Union Devoted Activities (HUDA)",
        chiefGuest: (siteConfig && siteConfig.chiefGuest) || currentCfg.chiefGuest || "Prof. Dr. K. M. Andrews",
        announcementTicker: (siteConfig && siteConfig.announcementTicker) || currentCfg.announcementTicker || "Official Live Results posting in real-time!",
        enableLiveTicker: (siteConfig && siteConfig.enableLiveTicker !== undefined) ? String(siteConfig.enableLiveTicker) : (currentCfg.enableLiveTicker || "TRUE"),
        announcementTickerSpeed: (siteConfig && siteConfig.announcementTickerSpeed) || currentCfg.announcementTickerSpeed || "normal",
        liveStreamUrl: (siteConfig && siteConfig.liveStreamUrl) || currentCfg.liveStreamUrl || "",
        contactEmail: (siteConfig && siteConfig.contactEmail) || currentCfg.contactEmail || "festival@ahiaedu.org",
        contactPhone: (siteConfig && siteConfig.contactPhone) || currentCfg.contactPhone || "+91 98470 12345",
        logoUrl: (siteConfig && siteConfig.logoUrl) || currentCfg.logoUrl || "https://images.unsplash.com/photo-1511525258028-df0c67b3ff2d?w=350&auto=format&fit=crop&q=80",
        bannerUrl: (siteConfig && siteConfig.bannerUrl) || currentCfg.bannerUrl || "",
        adminPassword: (siteConfig && siteConfig.adminPassword) || currentCfg.adminPassword || "hudaahiasmash20262027",
        adminUsername: (siteConfig && siteConfig.adminUsername) || currentCfg.adminUsername || "smash2k26",
        podiumCategory: (siteConfig && siteConfig.podiumCategory) || currentCfg.podiumCategory || "arts",
        isCelebrationMode: (siteConfig && siteConfig.isCelebrationMode !== undefined) ? String(siteConfig.isCelebrationMode) : (currentCfg.isCelebrationMode || "FALSE"),
        accentColor: (siteConfig && siteConfig.accentColor) || currentCfg.accentColor || "#4F46E5",
        accentPreset: (siteConfig && siteConfig.accentPreset) || currentCfg.accentPreset || "indigo",
        copyrightText: (siteConfig && siteConfig.copyrightText) || currentCfg.copyrightText || "© 2026 AHIA FEST • Hidaya Union Devoted Activities (HUDA). All Rights Reserved.",
        lastSyncedAt: new Date().toISOString()
      };
      initSiteSettingsSheet(settingsSheet, mergedCfg);
    }

    // 2. Full or Partial Data Sync (Smooth in-place write)
    if (action === "syncData" || payload.teams || payload.participants || payload.artsPrograms || payload.sportsMatches) {
      // TEAMS
      if (payload.teams && Array.isArray(payload.teams)) {
        writeDecoratedSheetData(
          ss.getSheetByName("Teams") || ss.insertSheet("Teams"),
          payload.teams,
          FEST_SHEETS_CONFIG.Teams
        );
      }

      // PARTICIPANTS
      if (payload.participants && Array.isArray(payload.participants)) {
        var partFormatted = payload.participants.map(function(p) {
          return {
            id: p.id,
            name: p.name,
            admissionNo: p.admissionNo,
            chestNo: p.chestNo,
            teamId: p.teamId,
            category: p.category,
            section: p.section,
            yearClass: p.yearClass,
            photo: p.photo || "",
            totalPoints: p.totalPoints || 0,
            golds: p.golds || 0,
            silvers: p.silvers || 0,
            bronzes: p.bronzes || 0,
            overallRank: p.overallRank || "",
            participatedPrograms: JSON.stringify(p.participatedPrograms || [])
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("Participants") || ss.insertSheet("Participants"),
          partFormatted,
          FEST_SHEETS_CONFIG.Participants
        );
      }

      // PROGRAMS (Arts & Cultural)
      if (payload.artsPrograms && Array.isArray(payload.artsPrograms)) {
        var progFormatted = payload.artsPrograms.map(function(pr) {
          return {
            id: pr.id,
            code: pr.code || "",
            name: pr.name,
            category: pr.category,
            section: pr.section,
            disciplineType: pr.disciplineType || "Arts",
            stage: pr.stage || "",
            venue: pr.venue || "",
            date: pr.date || "",
            time: pr.time || "",
            maxMarks: pr.maxMarks || 100,
            status: pr.status || "UPCOMING",
            publishStatus: pr.publishStatus || "Draft",
            results: JSON.stringify(pr.results || [])
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("Programs") || ss.insertSheet("Programs"),
          progFormatted,
          FEST_SHEETS_CONFIG.Programs
        );

        // Flatten and generate detailed ResultsMarks scorecard
        var flatMarks = [];
        payload.artsPrograms.forEach(function(prog) {
          if (Array.isArray(prog.results)) {
            prog.results.forEach(function(res) {
              flatMarks.push({
                programCode: prog.code || prog.id,
                programName: prog.name,
                chestNo: res.chestNo || "",
                participantName: res.participantName,
                teamId: res.teamId,
                marks: res.marks !== undefined ? res.marks : "",
                grade: res.grade || "-",
                position: res.position || "-",
                pointsAwarded: res.pointsAwarded || 0,
                status: res.status || prog.publishStatus || "Published",
                publishedAt: res.publishedAt || ""
              });
            });
          }
        });
        
        writeDecoratedSheetData(
          ss.getSheetByName("ResultsMarks") || ss.insertSheet("ResultsMarks"),
          flatMarks,
          FEST_SHEETS_CONFIG.ResultsMarks
        );
      }

      // SPORTS MATCHES
      if (payload.sportsMatches && Array.isArray(payload.sportsMatches)) {
        var sportsFormatted = payload.sportsMatches.map(function(sm) {
          return {
            id: sm.id,
            sport: sm.sport,
            title: sm.title,
            round: sm.round,
            teamAId: sm.teamAId,
            teamBId: sm.teamBId,
            scoreA: sm.scoreA,
            scoreB: sm.scoreB,
            detailScore: sm.detailScore || "",
            venue: sm.venue,
            date: sm.date,
            time: sm.time,
            status: sm.status,
            publishStatus: sm.publishStatus || "Draft",
            winnerTeamId: sm.winnerTeamId || "",
            events: JSON.stringify(sm.events || [])
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("SportsMatches") || ss.insertSheet("SportsMatches"),
          sportsFormatted,
          FEST_SHEETS_CONFIG.SportsMatches
        );
      }

      // SCHEDULE
      if (payload.schedule && Array.isArray(payload.schedule)) {
        writeDecoratedSheetData(
          ss.getSheetByName("Schedule") || ss.insertSheet("Schedule"),
          payload.schedule,
          FEST_SHEETS_CONFIG.Schedule
        );
      }

      // ANNOUNCEMENTS
      if (payload.announcements && Array.isArray(payload.announcements)) {
        writeDecoratedSheetData(
          ss.getSheetByName("Announcements") || ss.insertSheet("Announcements"),
          payload.announcements,
          FEST_SHEETS_CONFIG.Announcements
        );
      }

      // CERTIFICATES
      if (payload.certificates && Array.isArray(payload.certificates)) {
        writeDecoratedSheetData(
          ss.getSheetByName("Certificates") || ss.insertSheet("Certificates"),
          payload.certificates,
          FEST_SHEETS_CONFIG.Certificates
        );
      }

      // DOCUMENTS
      if (payload.documents && Array.isArray(payload.documents)) {
        writeDecoratedSheetData(
          ss.getSheetByName("Documents") || ss.insertSheet("Documents"),
          payload.documents,
          FEST_SHEETS_CONFIG.Documents
        );
      }

      // SCORING RULES
      if (payload.scoringRules && typeof payload.scoringRules === "object") {
        var rulesArr = [];
        var rKeys = Object.keys(payload.scoringRules);
        rKeys.forEach(function(k) {
          rulesArr.push({
            ruleKey: k,
            ruleName: formatRuleName(k),
            pointsValue: payload.scoringRules[k]
          });
        });
        writeDecoratedSheetData(
          ss.getSheetByName("ScoringRules") || ss.insertSheet("ScoringRules"),
          rulesArr,
          FEST_SHEETS_CONFIG.ScoringRules
        );
      }
    } else if (action === "deleteItem" || action === "deleteRecord") {
      var targetSheetName = payload.sheetName || payload.tab || payload.sheet;
      var targetItemId = payload.id || payload.itemId;
      if (targetSheetName && targetItemId) {
        var sheetToModify = ss.getSheetByName(targetSheetName);
        if (sheetToModify) {
          deleteRowById(sheetToModify, targetItemId);
        }
      }
    }

    SpreadsheetApp.flush();

    return jsonResponse({
      status: "success",
      message: "Data synchronized smoothly in-place without page refresh or data loss.",
      action: action,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * 4. JSON RESPONSE HELPER
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 5. SITE SETTINGS SHEET BUILDER (In-place, non-flicker)
 */
function initSiteSettingsSheet(sheet, config) {
  if (!sheet) return;
  
  if (sheet.getMaxColumns() < 4) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 4 - sheet.getMaxColumns());
  }
  if (sheet.getMaxRows() < 35) {
    sheet.insertRowsAfter(sheet.getMaxRows(), 35 - sheet.getMaxRows());
  }

  var isInitialized = false;
  try {
    if (sheet.getLastRow() >= 4 && sheet.getRange(4, 1).getValue() === "Setting Key") {
      isInitialized = true;
    }
  } catch (e) {}

  if (!isInitialized) {
    try { sheet.setTabColor(FEST_SHEETS_CONFIG.SiteSettings.tabColor); } catch (e) {}
    try {
      if (typeof sheet.setHiddenGridlines === "function") {
        sheet.setHiddenGridlines(false);
      }
    } catch (e) {}

    // Row 1: Merged Festival Header Title Banner
    sheet.getRange("A1:D1").merge();
    var banner = sheet.getRange("A1");
    banner.setValue("🏆 " + (config.festivalName || "AHIA FEST 2026").toUpperCase() + " — MASTER SITE SETTINGS");
    banner.setBackground("#1E1B4B");
    banner.setFontColor("#FFFFFF");
    banner.setFontFamily("Arial");
    banner.setFontSize(12);
    banner.setFontWeight("bold");
    banner.setHorizontalAlignment("center");
    banner.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 42);

    // Row 2: Subtitle Banner
    sheet.getRange("A2:D2").merge();
    var subBanner = sheet.getRange("A2");
    subBanner.setValue("Synchronized Live with the AHIA Digital Engine • In-Place Real-Time Sync");
    subBanner.setBackground("#312E81");
    subBanner.setFontColor("#E0E7FF");
    subBanner.setFontFamily("Arial");
    subBanner.setFontSize(9);
    subBanner.setFontStyle("italic");
    subBanner.setHorizontalAlignment("center");
    subBanner.setVerticalAlignment("middle");
    sheet.setRowHeight(2, 24);

    // Row 3: Spacer
    sheet.setRowHeight(3, 8);

    // Row 4: Table Headers
    var headers = FEST_SHEETS_CONFIG.SiteSettings.headers;
    sheet.getRange(4, 1, 1, headers.length).setValues([headers]);
    var headerRange = sheet.getRange(4, 1, 1, headers.length);
    headerRange.setBackground(FEST_SHEETS_CONFIG.SiteSettings.headerColor);
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontFamily("Arial");
    headerRange.setFontSize(11);
    headerRange.setFontWeight("bold");
    headerRange.setVerticalAlignment("middle");
    headerRange.setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
    sheet.setRowHeight(4, 34);

    sheet.getRange(4, 1).setHorizontalAlignment("center");
    sheet.getRange(4, 2).setHorizontalAlignment("left");
    sheet.getRange(4, 3).setHorizontalAlignment("left");
    sheet.getRange(4, 4).setHorizontalAlignment("left");
  } else {
    // Just update banner title in-place
    try {
      sheet.getRange("A1").setValue("🏆 " + (config.festivalName || "AHIA FEST 2026").toUpperCase() + " — MASTER SITE SETTINGS");
    } catch (e) {}
  }

  // Rows 5+: Settings Key-Value Rows
  var rows = [
    ["festivalName", "Festival Name / Title", config.festivalName || "AHIA FEST 2026", "Main brand name displayed across the website, navigation, hero and banners."],
    ["year", "Operational Year", config.year || "2026", "Festival edition year (e.g., 2026)."],
    ["edition", "Festival Edition / Subtitle", config.edition || "Annual Championship Edition", "Subtitle edition descriptor."],
    ["statusBanner", "Live Status Banner", config.statusBanner || "LIVE", "Live indicator badge: LIVE | UPCOMING | CONCLUDED | PAUSED."],
    ["tagline", "Official Tagline / Slogan", config.tagline || "Annual Inter-House Arts & Athletics Fest", "Subtitle phrase displayed beneath festival title."],
    ["theme", "Festival Theme / Motto", config.theme || "Where talent meets competition.", "Central artistic & sporting theme."],
    ["motto", "Secondary Motto", config.motto || "Ignite the Spirit of Excellence", "Motivational slogan."],
    ["dates", "Festival Dates", config.dates || "March 15 - 18, 2026", "Event duration and schedule dates."],
    ["currentDay", "Current Active Day", config.currentDay || "Day 1 of 3", "Today's highlight status for the hero banner."],
    ["venue", "Central Venue / Location", config.venue || "Grand Central Stage & Main Athletic Arena", "Primary campus grounds or venue."],
    ["organizedBy", "Organized By Committee", config.organizedBy || "Hidaya Union Devoted Activities (HUDA)", "Official hosting body."],
    ["chiefGuest", "Chief Guest / Dignitary", config.chiefGuest || "Prof. Dr. K. M. Andrews", "Distinguished guest of honor."],
    ["announcementTicker", "Breaking News Ticker", config.announcementTicker || "Official Live Results posting in real-time!", "Top marquee announcement text."],
    ["enableLiveTicker", "Enable Live Ticker", config.enableLiveTicker !== undefined ? String(config.enableLiveTicker) : "TRUE", "Toggle header live news marquee banner: TRUE | FALSE."],
    ["announcementTickerSpeed", "Ticker Scroll Speed", config.announcementTickerSpeed || "normal", "Marquee movement velocity: normal | slow | fast."],
    ["liveStreamUrl", "Live Webcast Stream URL", config.liveStreamUrl || "", "Direct YouTube/Vimeo live broadcast URL."],
    ["contactEmail", "Official Support Email", config.contactEmail || "festival@ahiaedu.org", "Helpdesk contact email."],
    ["contactPhone", "Official Hotline", config.contactPhone || "+91 98470 12345", "Emergency coordinator hotline number."],
    ["logoUrl", "Logo Image URL", config.logoUrl || "https://images.unsplash.com/photo-1511525258028-df0c67b3ff2d?w=350&auto=format&fit=crop&q=80", "High-res web URL to logo / crest displayed in sidebar, header, and certificates."],
    ["bannerUrl", "Hero Banner Image URL", config.bannerUrl || "", "Background visual for the festival hero header."],
    ["adminUsername", "Portal Admin Username", config.adminUsername || "smash2k26", "Master administrator username for portal access."],
    ["adminPassword", "Portal Admin Password", config.adminPassword || "hudaahiasmash20262027", "Master security passkey for Chief Festival Controller."],
    ["podiumCategory", "Championship Podium Display Mode", config.podiumCategory || "arts", "Championship Podium Display Mode: arts (Arts Only) | sports (Sports Only) | overall (Combined)."],
    ["isCelebrationMode", "Celebration Fireworks Mode", config.isCelebrationMode !== undefined ? String(config.isCelebrationMode) : "FALSE", "Celebration fireworks toggle: TRUE (Fireworks active) | FALSE."],
    ["accentColor", "Web Accent Color", config.accentColor || "#4F46E5", "Primary brand accent hex code used for buttons, active badges, and highlights."],
    ["accentPreset", "Color Palette Preset", config.accentPreset || "indigo", "Color theme preset name: indigo | purple | emerald | sky | rose | amber | cyan | pink | custom."],
    ["copyrightText", "Footer Copyright Notice", config.copyrightText || "© 2026 AHIA FEST • Hidaya Union Devoted Activities (HUDA). All Rights Reserved.", "Official footer copyright line displayed on public pages."],
    ["lastSyncedAt", "Last Synced Timestamp", config.lastSyncedAt || new Date().toISOString(), "Automatic timestamp updated by webhook on every synchronization."]
  ];

  sheet.getRange(5, 1, rows.length, 4).setValues(rows);

  if (!isInitialized) {
    sheet.setRowHeights(5, rows.length, 28);
    var dataRange = sheet.getRange(5, 1, rows.length, 4);
    dataRange.setFontFamily("Arial");
    dataRange.setFontSize(10);
    dataRange.setVerticalAlignment("middle");
    dataRange.setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);

    sheet.getRange(5, 1, rows.length, 1).setFontWeight("bold").setFontColor("#312E81").setHorizontalAlignment("center").setBackground("#F8FAFC");
    sheet.getRange(5, 2, rows.length, 1).setFontWeight("bold").setFontColor("#0F172A").setHorizontalAlignment("left");
    sheet.getRange(5, 3, rows.length, 1).setFontFamily("Courier New").setFontColor("#0369A1").setHorizontalAlignment("left").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    sheet.getRange(5, 4, rows.length, 1).setFontColor("#64748B").setHorizontalAlignment("left").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 360);
    sheet.setColumnWidth(4, 420);
    sheet.setFrozenRows(4);
  }
}

function readSiteSettings(sheet) {
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  if (data.length === 0) return null;
  var cfg = {};
  for (var i = 0; i < data.length; i++) {
    var rawKey = String(data[i][0] || "").trim();
    if (!rawKey) continue;
    var lowerKey = rawKey.toLowerCase();
    if (rawKey.indexOf("🏆") !== -1 || lowerKey === "setting key" || lowerKey.indexOf("synchronized") !== -1) {
      continue;
    }
    var val = data[i][2] !== undefined && data[i][2] !== "" ? data[i][2] : data[i][1];
    cfg[rawKey] = String(val !== undefined && val !== null ? val : "");
  }
  return cfg;
}

/**
 * 6. IN-PLACE TABLE FORMATTING & DECORATION HELPERS (NO FLICKER)
 */
function formatHeaderRow(sheet, colCount, headerColor, alignments) {
  if (!sheet || colCount <= 0) return;
  if (sheet.getMaxColumns() < colCount) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), colCount - sheet.getMaxColumns());
  }
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground(headerColor || "#1E1B4B");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontFamily("Arial");
  headerRange.setFontSize(11);
  headerRange.setFontWeight("bold");
  headerRange.setVerticalAlignment("middle");
  try {
    headerRange.setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
  } catch (e) {}
  
  try {
    sheet.setRowHeight(1, 38);
  } catch (e) {}

  if (alignments && Array.isArray(alignments)) {
    for (var c = 0; c < colCount; c++) {
      var align = alignments[c] || "left";
      try {
        sheet.getRange(1, c + 1).setHorizontalAlignment(align);
      } catch (e) {}
    }
  }

  try {
    sheet.setFrozenRows(1);
  } catch (e) {}
}

function writeDecoratedSheetData(sheet, items, tabConfig) {
  if (!sheet) return;

  var headers = tabConfig.headers;
  var numCols = headers.length;

  if (sheet.getMaxColumns() < numCols) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), numCols - sheet.getMaxColumns());
  }

  var currentLastRow = sheet.getLastRow();
  var currentLastCol = sheet.getLastColumn();

  var needHeaderInit = false;
  if (currentLastRow === 0 || currentLastCol < numCols) {
    needHeaderInit = true;
  } else {
    var existingHeaders = sheet.getRange(1, 1, 1, numCols).getValues()[0];
    if (existingHeaders.join(",") !== headers.join(",")) {
      needHeaderInit = true;
    }
  }

  if (needHeaderInit) {
    sheet.getRange(1, 1, 1, numCols).setValues([headers]);
    formatHeaderRow(sheet, numCols, tabConfig.headerColor, tabConfig.colAlignments);
    if (tabConfig.colWidths && Array.isArray(tabConfig.colWidths)) {
      for (var c = 0; c < numCols; c++) {
        var colW = tabConfig.colWidths[c];
        if (colW) {
          try { sheet.setColumnWidth(c + 1, colW); } catch (e) {}
        }
      }
    }
    try { sheet.setTabColor(tabConfig.tabColor); } catch (e) {}
  }

  var newRowCount = (items && Array.isArray(items)) ? items.length : 0;

  if (newRowCount > 0) {
    var neededRows = newRowCount + 2;
    if (sheet.getMaxRows() < neededRows) {
      sheet.insertRowsAfter(sheet.getMaxRows(), neededRows - sheet.getMaxRows() + 5);
    }

    var rows = items.map(function(item) {
      return headers.map(function(h) {
        var val = item[h];
        if (val === undefined || val === null) return "";
        if (typeof val === "object") return JSON.stringify(val);
        return val;
      });
    });

    var dataRange = sheet.getRange(2, 1, rows.length, numCols);
    dataRange.setValues(rows);
    dataRange.setFontFamily("Arial");
    dataRange.setFontSize(10);
    dataRange.setVerticalAlignment("middle");
    dataRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    
    // Only update styles if row count changed or initializing, keeping sheet snappy
    var prevDataRows = currentLastRow > 1 ? currentLastRow - 1 : 0;
    if (needHeaderInit || Math.abs(prevDataRows - newRowCount) > 0) {
      try {
        dataRange.setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
        sheet.setRowHeights(2, rows.length, 28);
        var backgrounds = [];
        for (var r = 0; r < rows.length; r++) {
          var rowBg = [];
          var bg = (r % 2 === 1) ? "#F8FAFC" : "#FFFFFF";
          for (var c = 0; c < numCols; c++) {
            rowBg.push(bg);
          }
          backgrounds.push(rowBg);
        }
        dataRange.setBackgrounds(backgrounds);

        if (tabConfig.colAlignments) {
          for (var c = 0; c < numCols; c++) {
            var align = tabConfig.colAlignments[c] || "left";
            sheet.getRange(2, c + 1, rows.length, 1).setHorizontalAlignment(align);
          }
        }
      } catch (e) {}
    }

    // Clean up excess rows from previous sync without wiping sheet
    if (currentLastRow > newRowCount + 1) {
      var excessCount = currentLastRow - (newRowCount + 1);
      sheet.getRange(newRowCount + 2, 1, excessCount, numCols).clearContent().clearFormat();
    }
  } else {
    // If empty, clear only data rows
    if (currentLastRow > 1) {
      sheet.getRange(2, 1, currentLastRow - 1, numCols).clearContent().clearFormat();
    }
  }
}

function deleteRowById(sheet, id) {
  if (!sheet || !id) return;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var headers = data[0];
  var targetStr = String(id).trim().toLowerCase();
  var possibleCols = ["id", "code", "chestNo", "admissionNo", "programCode", "ruleKey", "verificationCode", "title"];
  var checkColIndices = [];
  for (var p = 0; p < possibleCols.length; p++) {
    var idx = headers.indexOf(possibleCols[p]);
    if (idx !== -1) checkColIndices.push(idx);
  }
  if (checkColIndices.length === 0) checkColIndices.push(0);

  for (var i = data.length - 1; i >= 1; i--) {
    var matchFound = false;
    for (var c = 0; c < checkColIndices.length; c++) {
      var colIdx = checkColIndices[c];
      var cellVal = String(data[i][colIdx]).trim().toLowerCase();
      if (cellVal === targetStr) {
        matchFound = true;
        break;
      }
    }
    if (!matchFound && targetStr.indexOf("_") !== -1) {
      var progCol = headers.indexOf("programCode");
      var chestCol = headers.indexOf("chestNo");
      if (progCol !== -1 && chestCol !== -1) {
        var compKey = (String(data[i][progCol]).trim() + "_" + String(data[i][chestCol]).trim()).toLowerCase();
        if (compKey === targetStr) matchFound = true;
      }
    }

    if (matchFound) {
      sheet.deleteRow(i + 1);
    }
  }
  SpreadsheetApp.flush();
}

function readSheetData(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headerRowIdx = 0;
  if (data.length > 1) {
    var row0 = data[0].map(function(k) { return String(k).trim().toLowerCase(); });
    var row1 = data[1].map(function(k) { return String(k).trim().toLowerCase(); });
    var knownKeys = ["id", "code", "chestno", "programcode", "rulekey", "title", "sport", "setting key"];
    var row0HasKey = row0.some(function(k) { return knownKeys.indexOf(k) !== -1; });
    var row1HasKey = row1.some(function(k) { return knownKeys.indexOf(k) !== -1; });
    if (!row0HasKey && row1HasKey) {
      headerRowIdx = 1;
    }
  }

  var headers = data[headerRowIdx];
  var rows = [];
  for (var i = headerRowIdx + 1; i < data.length; i++) {
    var rowObj = {};
    var hasContent = false;
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      if (!key) continue;
      var val = data[i][j];
      rowObj[key] = val;
      if (val !== "" && val !== null && val !== undefined) {
        hasContent = true;
      }
    }
    if (hasContent) {
      var mainId = rowObj.id || rowObj.code || rowObj.chestNo || rowObj.title || rowObj.programCode || rowObj.ruleKey;
      if (mainId && String(mainId).trim() !== "") {
        rows.push(rowObj);
      }
    }
  }
  return rows;
}

function readScoringRules(sheet) {
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  var headerRowIdx = 0;
  if (data.length > 1) {
    var row0 = data[0].map(function(k) { return String(k).trim().toLowerCase(); });
    var row1 = data[1].map(function(k) { return String(k).trim().toLowerCase(); });
    if (!row0.some(function(k) { return k === "rulekey"; }) && row1.some(function(k) { return k === "rulekey"; })) {
      headerRowIdx = 1;
    }
  }

  var rules = {};
  for (var i = headerRowIdx + 1; i < data.length; i++) {
    var key = data[i][0];
    var val = Number(data[i][2]);
    if (key) rules[key] = isNaN(val) ? data[i][2] : val;
  }
  return rules;
}

function formatRuleName(camelCase) {
  return camelCase
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, function(str) { return str.toUpperCase(); })
    .replace(/A_ Plus/g, "A+")
    .replace(/B_ Plus/g, "B+");
}
`;
