/**
 * GOOGLE APPS SCRIPT WEB APP BACKEND & DATABASE ENGINE
 * AHIA FEST 2026 - ARTS & SPORTS RESULT ENGINE
 *
 * Full Two-Way Synchronization with Non-Destructive Data Protection, In-Place Updates & Anti-Duplication
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * AHIA FEST 2026 - REFINED HIGH-SPEED GOOGLE APPS SCRIPT DATABASE ENGINE
 * =========================================================================
 * 
 * FEATURES:
 *  1. High-Speed Data Engine: ScriptCache caching for ultra-fast reads (<150ms).
 *  2. Anti-Duplication Engine: Automatic deduplication of results & marks across all programs.
 *  3. Non-Destructive Live Sync: Never wipes sheets; writes data in-place smoothly.
 *  4. No-Flicker Architecture: Eliminates sheet.clear() so viewers never see tabs flash.
 *  5. Full Collection Coverage: Teams (w/ artsMinusPoints & sportsMinusPoints),
 *     TeamMinuses (w/ scope), Participants, Programs, ResultsMarks, SportsMatches,
 *     Schedule, Announcements, Certificates, Documents, ScoringRules &
 *     SiteSettings (w/ Arts, Sports & Master penalty toggles).
 *  6. Auto Cache Invalidation: Automatically purges cache on any write/update.
 *  7. Cross-Origin Support: Handles GET, POST, and OPTIONS requests seamlessly.
 * =========================================================================
 */

var FEST_SHEETS_CONFIG = {
  SiteSettings: {
    tabColor: "#1E1B4B",
    headerColor: "#1E1B4B", // Midnight Indigo Header
    headers: ["Setting Key", "Setting Label", "Value", "Description"],
    colAlignments: ["center", "left", "left", "left"],
    colWidths: [180, 240, 360, 420]
  },
  Teams: {
    tabColor: "#1E40AF",
    headerColor: "#1E40AF", // Deep Cobalt Header
    headers: [
      "id", "name", "shortCode", "color", "accentColor", "logo", 
      "captain", "viceCaptain", "staffAdvisor", "slogan", "description",
      "artsPoints", "sportsPoints", "artsMinusPoints", "sportsMinusPoints", 
      "minusPoints", "totalPoints", "golds", "silvers", "bronzes", 
      "totalWins", "rank", "membersCount"
    ],
    colAlignments: [
      "center", "left", "center", "center", "center", "center",
      "left", "left", "left", "left", "left",
      "right", "right", "right", "right",
      "right", "right", "right", "right", "right",
      "right", "center", "right"
    ],
    colWidths: [
      100, 180, 90, 90, 90, 100,
      140, 140, 140, 200, 220,
      95, 95, 110, 110,
      95, 100, 75, 75, 75,
      85, 70, 100
    ]
  },
  TeamMinuses: {
    tabColor: "#991B1B",
    headerColor: "#991B1B", // Ruby Crimson Header
    headers: ["id", "teamId", "teamName", "points", "reason", "category", "scope", "addedBy", "date", "notes"],
    colAlignments: ["center", "center", "left", "right", "left", "center", "center", "left", "center", "left"],
    colWidths: [100, 100, 160, 110, 240, 90, 130, 140, 130, 240]
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
    colWidths: [100, 180, 90, 110, 150, 200, 90, 100, 80, 120, 110, 140]
  },
  Documents: {
    tabColor: "#334155",
    headerColor: "#334155", // Slate Charcoal Header
    headers: ["id", "title", "category", "description", "issueDate", "fileUrl", "fileSize", "status", "isPublic"],
    colAlignments: ["center", "left", "center", "left", "center", "left", "center", "center", "center"],
    colWidths: [90, 220, 130, 260, 110, 280, 100, 90, 90]
  },
  ScoringRules: {
    tabColor: "#4338CA",
    headerColor: "#4338CA", // Deep Indigo Header
    headers: ["ruleKey", "ruleLabel", "category", "firstPoints", "secondPoints", "thirdPoints", "description"],
    colAlignments: ["center", "left", "center", "right", "right", "right", "left"],
    colWidths: [140, 220, 120, 90, 90, 90, 300]
  }
};

/**
 * Deduplicate program results to prevent repeated or duplicate winner rows
 */
function deduplicateResults(results) {
  if (!Array.isArray(results)) return [];
  var seenParticipants = {};
  var seenRanks = {};
  var clean = [];

  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    if (!r) continue;

    var partKey = String(r.participantId || r.chestNo || r.admissionNo || r.id || "").trim().toLowerCase();
    var rankNum = Number(r.rank) || 999;

    // Skip if participant is already recorded in this program
    if (partKey && seenParticipants[partKey]) continue;
    
    // Skip if podium rank 1, 2, or 3 is already taken
    if (rankNum <= 3 && seenRanks[rankNum]) continue;

    if (partKey) seenParticipants[partKey] = true;
    if (rankNum <= 3) seenRanks[rankNum] = true;

    clean.push(r);
  }

  // Sort results by rank ascending, then marks descending
  clean.sort(function(a, b) {
    var rA = Number(a.rank) || 999;
    var rB = Number(b.rank) || 999;
    if (rA !== rB) return rA - rB;
    var mA = Number(a.marks) || 0;
    var mB = Number(b.marks) || 0;
    return mB - mA;
  });

  return clean;
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function setupFestivalSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var settingsSheet = ss.getSheetByName("SiteSettings") || ss.insertSheet("SiteSettings", 0);
  initSiteSettingsSheet(settingsSheet, {
    festivalName: "smash 2026",
    year: "2026",
    edition: "Annual Championship Edition",
    statusBanner: "LIVE",
    tagline: "Annual Inter-House Arts & Athletics Fest",
    theme: "Where talent meets competition.",
    motto: "Ignite the Spirit of Excellence",
    venue: "Grand Central Stage & Main Athletic Arena",
    organizedBy: "Student Union & Fest Council",
    chiefGuest: "Eminent Dignitaries & Academic Directors",
    applyPenaltiesToPodium: "true",
    applyArtsPenalties: "true",
    applySportsPenalties: "true"
  });

  var tabNames = Object.keys(FEST_SHEETS_CONFIG);
  tabNames.forEach(function(tabName) {
    if (tabName === "SiteSettings") return;
    var cfg = FEST_SHEETS_CONFIG[tabName];
    var sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
    try { sheet.setTabColor(cfg.tabColor); } catch (e) {}
    try {
      if (typeof sheet.setHiddenGridlines === "function") {
        sheet.setHiddenGridlines(false);
      }
    } catch (e) {}

    if (sheet.getLastRow() === 0) {
      writeDecoratedSheetData(sheet, [], cfg);
    } else {
      formatHeaderRow(sheet, cfg.headers.length, cfg.headerColor, cfg.colAlignments);
    }
  });

  return "All " + tabNames.length + " Festival sheets initialized with non-destructive preservation and custom styling!";
}

function doGet(e) {
  try {
    var forceFresh = e && e.parameter && (e.parameter.fresh === "1" || e.parameter.action === "fresh" || e.parameter.nocache === "1");
    var cache = CacheService.getScriptCache();
    
    if (!forceFresh) {
      var cachedJson = cache.get("ahia_fest_live_data_v4");
      if (cachedJson) {
        return ContentService.createTextOutput(cachedJson).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (e && e.parameter && (e.parameter.action === "setup" || e.parameter.setup === "1")) {
      var setupResult = setupFestivalSheets();
      return jsonResponse({
        status: "success",
        action: "setup",
        message: setupResult,
        timestamp: new Date().toISOString()
      });
    }

    var settingsSheet = ss.getSheetByName("SiteSettings");
    if (!settingsSheet) {
      setupFestivalSheets();
      settingsSheet = ss.getSheetByName("SiteSettings");
    }

    var festConfig = readSiteSettings(settingsSheet) || {};
    var teams = readSheetData(ss.getSheetByName("Teams"));
    var teamMinuses = readSheetData(ss.getSheetByName("TeamMinuses"));
    var participants = readSheetData(ss.getSheetByName("Participants"));
    var artsPrograms = readSheetData(ss.getSheetByName("Programs"));
    var sportsMatches = readSheetData(ss.getSheetByName("SportsMatches"));
    var schedule = readSheetData(ss.getSheetByName("Schedule"));
    var announcements = readSheetData(ss.getSheetByName("Announcements"));
    var certificates = readSheetData(ss.getSheetByName("Certificates"));
    var documents = readSheetData(ss.getSheetByName("Documents"));
    var resultsMarks = readSheetData(ss.getSheetByName("ResultsMarks"));
    var scoringRules = readScoringRules(ss.getSheetByName("ScoringRules"));

    var marksByProgCode = {};
    if (Array.isArray(resultsMarks)) {
      resultsMarks.forEach(function(rm) {
        if (!rm) return;
        var pCode = String(rm.programCode || "").trim().toLowerCase();
        if (!pCode) return;

        if (!marksByProgCode[pCode]) marksByProgCode[pCode] = [];
        // Avoid duplicate marks entry
        var alreadyExists = marksByProgCode[pCode].some(function(existing) {
          return String(existing.chestNo || "").trim().toLowerCase() === String(rm.chestNo || "").trim().toLowerCase() &&
                 String(existing.participantName || "").trim().toLowerCase() === String(rm.participantName || "").trim().toLowerCase();
        });
        if (!alreadyExists) {
          marksByProgCode[pCode].push(rm);
        }
      });
    }

    artsPrograms = artsPrograms.map(function(p) {
      if (typeof p.results === "string" && p.results.trim()) {
        try { p.results = JSON.parse(p.results); } catch (err) { p.results = []; }
      } else if (!p.results) {
        p.results = [];
      }

      if ((!p.results || p.results.length === 0) && marksByProgCode) {
        var pCodeKey = String(p.code || p.id || "").trim().toLowerCase();
        var extra = marksByProgCode[pCodeKey] || [];
        if (extra.length > 0) {
          p.results = extra.map(function(rm, idx) {
            return {
              id: "res-" + (p.id || p.code || "p") + "-" + (rm.chestNo || idx) + "-" + (rm.rank || idx + 1),
              programId: String(p.id || p.code),
              programCode: p.code || "",
              programName: p.name || "",
              participantName: rm.participantName || "",
              chestNo: rm.chestNo || "",
              teamId: rm.teamId || "",
              marks: Number(rm.marks) || 0,
              grade: rm.grade || "-",
              rank: rm.rank ? Number(rm.rank) : (rm.position && String(rm.position).indexOf("1") !== -1 ? 1 : rm.position && String(rm.position).indexOf("2") !== -1 ? 2 : rm.position && String(rm.position).indexOf("3") !== -1 ? 3 : 999),
              position: rm.position || "-",
              pointsAwarded: Number(rm.pointsAwarded) || 0,
              status: rm.status || "Published",
              publishedAt: rm.publishedAt || ""
            };
          });
          p.publishStatus = "Published";
          p.status = "COMPLETED";
        }
      }

      p.results = deduplicateResults(p.results || []);
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

    var responsePayload = {
      status: "success",
      timestamp: new Date().toISOString(),
      festConfig: festConfig,
      siteSettings: festConfig,
      teams: teams,
      teamMinuses: teamMinuses,
      participants: participants,
      artsPrograms: artsPrograms,
      programs: artsPrograms,
      sportsMatches: sportsMatches,
      schedule: schedule,
      announcements: announcements,
      certificates: certificates,
      documents: documents,
      resultsMarks: resultsMarks,
      scoringRules: scoringRules
    };

    var outputJson = JSON.stringify(responsePayload);
    // Google Apps Script CacheService has a 100KB per item limit
    if (outputJson.length < 95000) {
      try {
        cache.put("ahia_fest_live_data_v4", outputJson, 20);
      } catch (cacheErr) {}
    }

    return ContentService.createTextOutput(outputJson).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

function doPost(e) {
  try {
    try {
      CacheService.getScriptCache().remove("ahia_fest_live_data_v4");
    } catch (cErr) {}

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = e.postData.contents;
    var payload = JSON.parse(postData);

    var action = payload.action || "sync_all";

    if (action === "delete_item" && payload.targetSheet && payload.targetId) {
      var targetSheet = ss.getSheetByName(payload.targetSheet);
      if (targetSheet) {
        deleteRowById(targetSheet, payload.targetId);
      }
    } else {
      if (payload.festConfig || payload.siteSettings) {
        var config = payload.festConfig || payload.siteSettings;
        var settingsSheet = ss.getSheetByName("SiteSettings") || ss.insertSheet("SiteSettings", 0);
        initSiteSettingsSheet(settingsSheet, config);
      }

      if (payload.teams && Array.isArray(payload.teams)) {
        var teamsFormatted = payload.teams.map(function(t) {
          return {
            id: t.id,
            name: t.name,
            shortCode: t.shortCode || "",
            color: t.color || "#1E40AF",
            accentColor: t.accentColor || t.color || "#3B82F6",
            logo: t.logo || "🏆",
            captain: t.captain || "",
            viceCaptain: t.viceCaptain || "",
            staffAdvisor: t.staffAdvisor || "",
            slogan: t.slogan || "",
            description: t.description || "",
            artsPoints: t.artsPoints || 0,
            sportsPoints: t.sportsPoints || 0,
            artsMinusPoints: t.artsMinusPoints !== undefined ? t.artsMinusPoints : 0,
            sportsMinusPoints: t.sportsMinusPoints !== undefined ? t.sportsMinusPoints : 0,
            minusPoints: t.minusPoints || 0,
            totalPoints: t.totalPoints || 0,
            golds: t.golds || 0,
            silvers: t.silvers || 0,
            bronzes: t.bronzes || 0,
            totalWins: t.totalWins || 0,
            rank: t.rank || 1,
            membersCount: t.membersCount || 0
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("Teams") || ss.insertSheet("Teams"),
          teamsFormatted,
          FEST_SHEETS_CONFIG.Teams
        );
      }

      if (payload.teamMinuses && Array.isArray(payload.teamMinuses)) {
        var minusesFormatted = payload.teamMinuses.map(function(m) {
          return {
            id: m.id,
            teamId: m.teamId,
            teamName: m.teamName || "",
            points: m.points !== undefined ? m.points : (m.pointsDeducted || 0),
            reason: m.reason || "",
            category: m.category || "General",
            scope: m.scope || "both",
            addedBy: m.addedBy || m.registeredBy || "Admin",
            date: m.date || m.timestamp || new Date().toISOString().split("T")[0],
            notes: m.notes || ""
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("TeamMinuses") || ss.insertSheet("TeamMinuses"),
          minusesFormatted,
          FEST_SHEETS_CONFIG.TeamMinuses
        );
      }

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

      if (payload.artsPrograms && Array.isArray(payload.artsPrograms)) {
        var progFormatted = payload.artsPrograms.map(function(pr) {
          var cleanProgResults = deduplicateResults(pr.results || []);
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
            results: JSON.stringify(cleanProgResults)
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("Programs") || ss.insertSheet("Programs"),
          progFormatted,
          FEST_SHEETS_CONFIG.Programs
        );

        var flatMarks = [];
        var seenMarkKeys = {};

        payload.artsPrograms.forEach(function(prog) {
          if (Array.isArray(prog.results)) {
            var cleanResults = deduplicateResults(prog.results);
            cleanResults.forEach(function(res) {
              var progCode = prog.code || prog.id;
              var markKey = String(progCode).toLowerCase() + "_" + String(res.chestNo || res.participantName || res.participantId || "").toLowerCase();
              if (seenMarkKeys[markKey]) return;
              seenMarkKeys[markKey] = true;

              flatMarks.push({
                programCode: progCode,
                programName: prog.name,
                chestNo: res.chestNo || "",
                participantName: res.participantName,
                teamId: res.teamId,
                marks: res.marks !== undefined ? res.marks : "",
                grade: res.grade || "-",
                position: res.position || (res.rank === 1 ? "1st" : res.rank === 2 ? "2nd" : res.rank === 3 ? "3rd" : "-"),
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

      if (payload.schedule && Array.isArray(payload.schedule)) {
        var schedFormatted = payload.schedule.map(function(sc) {
          return {
            id: sc.id,
            title: sc.title,
            type: sc.type,
            category: sc.category,
            venue: sc.venue,
            day: sc.day,
            date: sc.date,
            startTime: sc.startTime,
            endTime: sc.endTime,
            status: sc.status,
            referenceId: sc.referenceId || ""
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("Schedule") || ss.insertSheet("Schedule"),
          schedFormatted,
          FEST_SHEETS_CONFIG.Schedule
        );
      }

      if (payload.announcements && Array.isArray(payload.announcements)) {
        var annFormatted = payload.announcements.map(function(a) {
          return {
            id: a.id,
            title: a.title,
            content: a.content,
            category: a.category || "General",
            timestamp: a.timestamp,
            isUrgent: a.isUrgent ? "TRUE" : "FALSE",
            author: a.author || "Festival Admin"
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("Announcements") || ss.insertSheet("Announcements"),
          annFormatted,
          FEST_SHEETS_CONFIG.Announcements
        );
      }

      if (payload.certificates && Array.isArray(payload.certificates)) {
        var certFormatted = payload.certificates.map(function(c) {
          return {
            id: c.id,
            participantName: c.participantName,
            chestNo: c.chestNo,
            admissionNo: c.admissionNo,
            teamName: c.teamName,
            eventName: c.eventName,
            eventType: c.eventType,
            category: c.category,
            rank: c.rank,
            certificateType: c.certificateType,
            issueDate: c.issueDate,
            verificationCode: c.verificationCode
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("Certificates") || ss.insertSheet("Certificates"),
          certFormatted,
          FEST_SHEETS_CONFIG.Certificates
        );
      }

      if (payload.documents && Array.isArray(payload.documents)) {
        var docFormatted = payload.documents.map(function(d) {
          return {
            id: d.id,
            title: d.title,
            category: d.category || "General",
            description: d.description || "",
            issueDate: d.issueDate || "",
            fileUrl: d.fileUrl || "",
            fileSize: d.fileSize || "Online",
            status: d.status || "Active",
            isPublic: d.isPublic ? "TRUE" : "FALSE"
          };
        });
        writeDecoratedSheetData(
          ss.getSheetByName("Documents") || ss.insertSheet("Documents"),
          docFormatted,
          FEST_SHEETS_CONFIG.Documents
        );
      }

      if (payload.scoringRules && Array.isArray(payload.scoringRules)) {
        writeDecoratedSheetData(
          ss.getSheetByName("ScoringRules") || ss.insertSheet("ScoringRules"),
          payload.scoringRules,
          FEST_SHEETS_CONFIG.ScoringRules
        );
      }

      if (payload.deletedItems && Array.isArray(payload.deletedItems)) {
        payload.deletedItems.forEach(function(del) {
          var targetSheet = ss.getSheetByName(del.itemType || del.type);
          if (targetSheet) {
            deleteRowById(targetSheet, del.id || del.code);
          }
        });
      }
    }

    SpreadsheetApp.flush();
    try {
      CacheService.getScriptCache().remove("ahia_fest_live_data_v4");
    } catch (cErr) {}

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

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

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

    sheet.setRowHeight(3, 8);

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
    try {
      sheet.getRange("A1").setValue("🏆 " + (config.festivalName || "AHIA FEST 2026").toUpperCase() + " — MASTER SITE SETTINGS");
    } catch (e) {}
  }

  var rows = [
    ["festivalName", "Festival Name / Title", config.festivalName !== undefined ? config.festivalName : "smash 2026", "Main brand name displayed across the website, navigation, hero and banners."],
    ["year", "Operational Year", config.year !== undefined ? config.year : "2026", "Festival edition year (e.g., 2026)."],
    ["edition", "Festival Edition / Subtitle", config.edition !== undefined ? config.edition : "Annual Championship Edition", "Subtitle edition descriptor."],
    ["statusBanner", "Live Status Banner", config.statusBanner || "LIVE", "Live indicator badge: LIVE | UPCOMING | CONCLUDED | PAUSED."],
    ["tagline", "Official Tagline / Slogan", config.tagline !== undefined ? config.tagline : "Annual Inter-House Arts & Athletics Fest", "Subtitle phrase displayed beneath festival title."],
    ["theme", "Festival Theme / Motto", config.theme !== undefined ? config.theme : "Where talent meets competition.", "Central artistic & sporting theme."],
    ["motto", "Secondary Motto", config.motto !== undefined ? config.motto : "Ignite the Spirit of Excellence", "Motivational slogan."],
    ["dates", "Festival Date Range", config.dates !== undefined ? config.dates : "October 24 - 28, 2026", "Official festival schedule duration."],
    ["currentDay", "Active Competition Day", config.currentDay !== undefined ? config.currentDay : "Day 1", "Currently active festival day."],
    ["venue", "Central Campus / Stage Venue", config.venue !== undefined ? config.venue : "Grand Central Stage & Main Athletic Arena", "Primary venue of events."],
    ["organizedBy", "Organizing Committee", config.organizedBy !== undefined ? config.organizedBy : "Student Union & Fest Council", "Host association authority."],
    ["chiefGuest", "Chief Guest / Dignitary", config.chiefGuest !== undefined ? config.chiefGuest : "Eminent Dignitaries & Academic Directors", "Invited guest of honor."],
    ["applyPenaltiesToPodium", "Deduct House Penalties from Overall Grand Total", config.applyPenaltiesToPodium !== undefined ? String(config.applyPenaltiesToPodium) : "true", "Global master toggle for penalty deduction across all overall leaderboards."],
    ["applyArtsPenalties", "Deduct House Penalties from Arts Championship", config.applyArtsPenalties !== undefined ? String(config.applyArtsPenalties) : "true", "Controls whether penalties deduct from Arts leaderboards."],
    ["applySportsPenalties", "Deduct House Penalties from Sports Championship", config.applySportsPenalties !== undefined ? String(config.applySportsPenalties) : "true", "Controls whether penalties deduct from Sports leaderboards."],
    ["announcementTicker", "Live Announcement Ticker", config.announcementTicker !== undefined ? config.announcementTicker : "Welcome to the Annual Championship!", "Top scrolling ticker banner broadcast."],
    ["enableLiveTicker", "Enable Ticker Banner", config.enableLiveTicker !== undefined ? String(config.enableLiveTicker) : "true", "Toggle display of the top announcement ticker."],
    ["announcementTickerSpeed", "Ticker Animation Speed", config.announcementTickerSpeed || "normal", "Speed of the banner ticker."],
    ["accentPreset", "Color Palette Preset", config.accentPreset || "indigo", "UI accent theme preset."],
    ["accentColor", "Custom Accent Hex Color", config.accentColor || "#4F46E5", "Primary brand color."],
    ["liveStreamUrl", "Live Stream / YouTube Broadcast", config.liveStreamUrl || "", "Live stream video URL."],
    ["contactEmail", "Support Email Address", config.contactEmail || "fest.desk@ahiafest.org", "Official contact email."],
    ["contactPhone", "Helpdesk Phone Number", config.contactPhone || "+91 98765 43210", "Official contact phone."],
    ["copyrightText", "Footer Copyright Notice", config.copyrightText || "© 2026 AHIA FEST. All rights reserved.", "Bottom footer copyright."],
    ["logoUrl", "Festival Official Emblem / Logo", config.logoUrl || "", "Public URL of fest crest or logo."],
    ["bannerUrl", "Hero Background Banner URL", config.bannerUrl || "", "Public URL for background image banner."],
    ["adminUsername", "Admin Portal Login ID", config.adminUsername || "smash2k26", "Administrator username."],
    ["adminPassword", "Admin Portal Password", config.adminPassword || "smash2k26", "Administrator security password."],
    ["podiumCategory", "Default Podium Category", config.podiumCategory || "arts", "arts or sports."]
  ];

  sheet.getRange(5, 1, rows.length, 4).setValues(rows);

  var dataRange = sheet.getRange(5, 1, rows.length, 4);
  dataRange.setFontFamily("Arial");
  dataRange.setFontSize(10);
  dataRange.setVerticalAlignment("middle");
  dataRange.setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeights(5, rows.length, 28);

  var backgrounds = [];
  for (var r = 0; r < rows.length; r++) {
    var bg = (r % 2 === 1) ? "#F8FAFC" : "#FFFFFF";
    backgrounds.push([bg, bg, bg, bg]);
  }
  dataRange.setBackgrounds(backgrounds);

  sheet.getRange(5, 1, rows.length, 1).setHorizontalAlignment("center").setFontWeight("bold").setFontColor("#312E81");
  sheet.getRange(5, 2, rows.length, 1).setHorizontalAlignment("left").setFontWeight("bold").setFontColor("#1E293B");
  sheet.getRange(5, 3, rows.length, 1).setHorizontalAlignment("left").setFontColor("#0F172A");
  sheet.getRange(5, 4, rows.length, 1).setHorizontalAlignment("left").setFontColor("#64748B");
}

function readSiteSettings(sheet) {
  if (!sheet) return {};
  var data = sheet.getDataRange().getValues();
  if (data.length <= 4) return {};

  var config = {};
  for (var i = 4; i < data.length; i++) {
    var row = data[i];
    var key = row[0];
    var val = row[2];
    if (key) {
      config[String(key).trim()] = val;
    }
  }
  return config;
}

function readScoringRules(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rules = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row || !row[0]) continue;
    var rule = {};
    for (var h = 0; h < headers.length; h++) {
      rule[headers[h]] = row[h];
    }
    rules.push(rule);
  }
  return rules;
}

function readSheetData(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var items = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var hasContent = false;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== "" && row[c] !== null && row[c] !== undefined) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) continue;

    var item = {};
    for (var h = 0; h < headers.length; h++) {
      var header = headers[h];
      if (header) {
        item[header] = row[h];
      }
    }
    items.push(item);
  }
  return items;
}

function formatHeaderRow(sheet, colCount, headerColor, alignments) {
  if (!sheet || colCount < 1) return;
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground(headerColor || "#1E1B4B");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontFamily("Arial");
  headerRange.setFontSize(10);
  headerRange.setFontWeight("bold");
  headerRange.setVerticalAlignment("middle");
  headerRange.setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(1, 32);

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

    if (currentLastRow > newRowCount + 1) {
      var excessCount = currentLastRow - (newRowCount + 1);
      sheet.getRange(newRowCount + 2, 1, excessCount, numCols).clearContent().clearFormat();
    }
  } else {
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
    for (var k = 0; k < checkColIndices.length; k++) {
      var cellVal = String(data[i][checkColIndices[k]] || "").trim().toLowerCase();
      if (cellVal === targetStr || cellVal === targetStr.replace(/[^a-z0-9]/g, "")) {
        matchFound = true;
        break;
      }
    }
    if (!matchFound && targetStr.indexOf("_") !== -1) {
      var progCol = headers.indexOf("programCode");
      var chestCol = headers.indexOf("chestNo");
      var partCol = headers.indexOf("participantName");
      if (progCol !== -1) {
        var rowProg = String(data[i][progCol] || "").trim().toLowerCase();
        var rowChest = chestCol !== -1 ? String(data[i][chestCol] || "").trim().toLowerCase() : "";
        var rowPart = partCol !== -1 ? String(data[i][partCol] || "").trim().toLowerCase() : "";
        if (
          (rowChest && targetStr === rowProg + "_" + rowChest) ||
          (rowPart && targetStr === rowProg + "_" + rowPart)
        ) {
          matchFound = true;
        }
      }
    }

    if (matchFound) {
      sheet.deleteRow(i + 1);
    }
  }
}
`;
