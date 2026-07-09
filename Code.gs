/**
 * WD&CW Peddapalli — Government Recruitment Web Application
 * Server-side Google Apps Script backend.
 *
 * Deploy as a Web App (Execute as: Me, Access: Anyone).
 * See README.md for full setup instructions.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

var SPREADSHEET_ID = '1q0-fKfad1CgrNBe6rUDkHvniYfJJDqnHl8srM00VFCg';
var SHEET_NAME = 'Applications';
var ROOT_FOLDER_NAME = 'WDCW Peddapalli Recruitment - Uploads';
var ADMIN_PASSWORD_PROPERTY = 'ADMIN_PASSWORD';
var DEFAULT_ADMIN_PASSWORD = 'Peddapalli@2026'; // CHANGE THIS in Script Properties immediately after deployment
var ADMIN_TOKEN_CACHE_SECONDS = 6 * 60 * 60; // 6 hours
var APP_NAME_SHORT = 'WDCW-PDP';
var DEPARTMENT_EMAIL_NAME = 'Women Development & Child Welfare Department, Peddapalli';

// Positions available for recruitment. Edit this list as vacancies change.
var POSITION_LIST = [
  'Anganwadi Worker',
  'Anganwadi Helper',
  'Supervisor (Mahila Samakhya)',
  'Child Development Project Officer (CDPO)',
  'Protection Officer (Child Welfare Committee)',
  'Case Worker',
  'Counsellor - One Stop Centre',
  'Data Entry Operator',
  'Office Subordinate',
  'Other'
];

// Ordered list of every column stored in the spreadsheet. The order here
// determines the physical column order in the sheet. `key` must match the
// property name sent from the client in script.js.
var SHEET_HEADERS = [
  { key: 'submissionDate', label: 'Submission Date' },
  { key: 'submissionTime', label: 'Submission Time' },
  { key: 'applicationNumber', label: 'Application Number' },
  { key: 'status', label: 'Status' },
  { key: 'positionAppliedFor', label: 'Position Applied For' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'fathersName', label: "Father's Name" },
  { key: 'husbandsName', label: "Husband's Name" },
  { key: 'mothersName', label: "Mother's Name" },
  { key: 'gender', label: 'Gender' },
  { key: 'maritalStatus', label: 'Marital Status' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'age', label: 'Age' },
  { key: 'aadhaar', label: 'Aadhaar Number' },
  { key: 'mobile', label: 'Mobile Number' },
  { key: 'altMobile', label: 'Alternate Mobile Number' },
  { key: 'email', label: 'Email' },
  { key: 'category', label: 'Category' },
  { key: 'community', label: 'Community' },
  { key: 'religion', label: 'Religion' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'district', label: 'District' },
  { key: 'mandal', label: 'Mandal' },
  { key: 'village', label: 'Village' },
  { key: 'pincode', label: 'Pincode' },
  { key: 'permanentAddress', label: 'Permanent Address' },
  { key: 'correspondenceAddress', label: 'Correspondence Address' },
  { key: 'localCandidate', label: 'Local Candidate' },
  { key: 'idMark1', label: 'Identification Mark 1' },
  { key: 'idMark2', label: 'Identification Mark 2' },
  { key: 'photoUrl', label: 'Photo URL' },
  { key: 'signatureUrl', label: 'Signature URL' },
  { key: 'widow', label: 'Widow' },
  { key: 'orphan', label: 'Orphan' },
  { key: 'pwbd', label: 'PwBD' },
  { key: 'disabilityPercent', label: 'Disability Percentage' },
  { key: 'disabilityNature', label: 'Nature of Disability' },
  { key: 'exServiceman', label: 'Ex-serviceman' },
  { key: 'sportsCategory', label: 'Sports Category' },
  { key: 'ews', label: 'EWS' },
  { key: 'educationDetails', label: 'Education Details (JSON)' },
  { key: 'trainingDetails', label: 'Training Details (JSON)' },
  { key: 'employmentHistory', label: 'Employment History (JSON)' },
  { key: 'presentEmploymentStatus', label: 'Present Employment Status' },
  { key: 'reasonForLeaving', label: 'Reason for Leaving' },
  { key: 'computerSkills', label: 'Computer Skills' },
  { key: 'computerSkillLevel', label: 'Computer Skill Level' },
  { key: 'languageSkills', label: 'Language Skills (JSON)' },
  { key: 'chargeSheeted', label: 'Charge Sheeted' },
  { key: 'convicted', label: 'Convicted' },
  { key: 'dismissed', label: 'Dismissed' },
  { key: 'criminalRemarks', label: 'Criminal Remarks' },
  { key: 'docAadhaarUrl', label: 'Aadhaar Document URL' },
  { key: 'docSscUrl', label: 'SSC Document URL' },
  { key: 'docInterUrl', label: 'Intermediate Document URL' },
  { key: 'docDegreeUrl', label: 'Degree Document URL' },
  { key: 'docPgUrl', label: 'PG Document URL' },
  { key: 'docMarksMemoUrl', label: 'Marks Memo Document URL' },
  { key: 'docExperienceUrl', label: 'Experience Certificate URL' },
  { key: 'docCasteUrl', label: 'Caste Certificate URL' },
  { key: 'docResidenceUrl', label: 'Residence Certificate URL' },
  { key: 'docWidowUrl', label: 'Widow Certificate URL' },
  { key: 'docDisabilityUrl', label: 'Disability Certificate URL' },
  { key: 'docComputerUrl', label: 'Computer Certificate URL' },
  { key: 'docOtherUrl', label: 'Other Certificate URL' },
  { key: 'declaration', label: 'Declaration Accepted' },
  { key: 'place', label: 'Place' },
  { key: 'declarationDate', label: 'Declaration Date' }
];

// Document upload fields. Keep this in sync with the upload rows rendered
// in Index.html (Section 9) and the validation in script.js.
var DOCUMENT_FIELDS = [
  { key: 'photo', label: 'Passport Photo', maxKB: 500, folder: 'Photos', required: true, sheetKey: 'photoUrl' },
  { key: 'signature', label: 'Signature', maxKB: 200, folder: 'Signatures', required: true, sheetKey: 'signatureUrl' },
  { key: 'docAadhaar', label: 'Aadhaar', maxKB: 2048, folder: 'Certificates', required: true, sheetKey: 'docAadhaarUrl' },
  { key: 'docSsc', label: 'SSC', maxKB: 2048, folder: 'Certificates', required: true, sheetKey: 'docSscUrl' },
  { key: 'docInter', label: 'Intermediate', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docInterUrl' },
  { key: 'docDegree', label: 'Degree', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docDegreeUrl' },
  { key: 'docPg', label: 'PG', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docPgUrl' },
  { key: 'docMarksMemo', label: 'Marks Memo', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docMarksMemoUrl' },
  { key: 'docExperience', label: 'Experience Certificate', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docExperienceUrl' },
  { key: 'docCaste', label: 'Caste Certificate', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docCasteUrl' },
  { key: 'docResidence', label: 'Residence Certificate', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docResidenceUrl' },
  { key: 'docWidow', label: 'Widow Certificate', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docWidowUrl' },
  { key: 'docDisability', label: 'Disability Certificate', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docDisabilityUrl' },
  { key: 'docComputer', label: 'Computer Certificate', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docComputerUrl' },
  { key: 'docOther', label: 'Other Certificate', maxKB: 2048, folder: 'Certificates', required: false, sheetKey: 'docOtherUrl' }
];

// ============================================================================
// WEB APP ENTRY POINTS
// ============================================================================

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('WD&CW Peddapalli - Online Recruitment Application')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setFaviconUrl('https://www.telangana.gov.in/wp-content/uploads/2016/02/cropped-favicon-32x32.png');
}

/** Used by index.html templates to inline Stylesheet.html / JavaScript.html */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================================================
// INITIAL DATA FOR THE FORM
// ============================================================================

function getInitialFormData() {
  return {
    positions: POSITION_LIST,
    nextApplicationNumberPreview: previewNextApplicationNumber(),
    documentFields: DOCUMENT_FIELDS
  };
}

// ============================================================================
// APPLICATION NUMBER GENERATION
// ============================================================================

/** Non-reserving preview shown on the form before submission. */
function previewNextApplicationNumber() {
  var year = new Date().getFullYear();
  var props = PropertiesService.getScriptProperties();
  var counterKey = 'APPNO_COUNTER_' + year;
  var current = parseInt(props.getProperty(counterKey) || '0', 10);
  return formatApplicationNumber(year, current + 1);
}

/** Lock-protected, sequential, authoritative application number generator. */
function generateApplicationNumber() {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var year = new Date().getFullYear();
    var props = PropertiesService.getScriptProperties();
    var counterKey = 'APPNO_COUNTER_' + year;
    var current = parseInt(props.getProperty(counterKey) || '0', 10);
    var next = current + 1;
    props.setProperty(counterKey, String(next));
    return formatApplicationNumber(year, next);
  } finally {
    lock.releaseLock();
  }
}

function formatApplicationNumber(year, seq) {
  var padded = ('000000' + seq).slice(-6);
  return APP_NAME_SHORT + '-' + year + '-' + padded;
}

// ============================================================================
// SPREADSHEET HELPERS
// ============================================================================

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  var headerRow = SHEET_HEADERS.map(function (h) { return h.label; });
  var firstRow = sheet.getRange(1, 1, 1, headerRow.length).getValues()[0];
  var needsHeader = firstRow.join('') === '';
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    sheet.getRange(1, 1, 1, headerRow.length).setFontWeight('bold').setBackground('#0b3d91').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headerRow.length);
  }
  return sheet;
}

function findColumnValues_(columnKey) {
  var sheet = getSheet_();
  var colIndex = SHEET_HEADERS.map(function (h) { return h.key; }).indexOf(columnKey);
  if (colIndex === -1) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, colIndex + 1, lastRow - 1, 1).getValues().map(function (r) { return String(r[0]); });
}

// ============================================================================
// DUPLICATE VALIDATION
// ============================================================================

function checkDuplicate(fieldKey, value) {
  if (!value) return { duplicate: false };
  var normalized = String(value).trim().toLowerCase();
  var values = findColumnValues_(fieldKey).map(function (v) { return v.trim().toLowerCase(); });
  return { duplicate: values.indexOf(normalized) !== -1 };
}

// ============================================================================
// DRIVE FILE HANDLING
// ============================================================================

function getOrCreateFolder_(name, parent) {
  var parentFolder = parent || DriveApp.getRootFolder();
  var folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(name);
}

function getRootUploadFolder_() {
  var cache = CacheService.getScriptCache();
  var cachedId = cache.get('ROOT_FOLDER_ID');
  if (cachedId) {
    try { return DriveApp.getFolderById(cachedId); } catch (e) { /* fall through and recreate */ }
  }
  var folder = getOrCreateFolder_(ROOT_FOLDER_NAME, DriveApp.getRootFolder());
  getOrCreateFolder_('Photos', folder);
  getOrCreateFolder_('Signatures', folder);
  getOrCreateFolder_('Certificates', folder);
  cache.put('ROOT_FOLDER_ID', folder.getId(), 21600);
  return folder;
}

function getSubFolder_(name) {
  return getOrCreateFolder_(name, getRootUploadFolder_());
}

/**
 * Saves a base64-encoded file to the correct Drive subfolder.
 * @param {string} base64Data Raw base64 (no data: prefix).
 * @param {string} mimeType e.g. image/jpeg
 * @param {string} fileName Desired file name (without extension conflicts handled by Drive).
 * @param {string} folderName Photos | Signatures | Certificates
 * @return {string} Web-viewable Drive URL
 */
function saveBase64File_(base64Data, mimeType, fileName, folderName) {
  var bytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(bytes, mimeType, fileName);
  var folder = getSubFolder_(folderName);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

// ============================================================================
// APPLICATION SUBMISSION
// ============================================================================

function submitApplication(formData) {
  try {
    if (!formData || !formData.fullName || !formData.aadhaar || !formData.mobile || !formData.email) {
      return { success: false, message: 'Required fields are missing. Please complete the form.' };
    }
    if (!/^\d{12}$/.test(formData.aadhaar)) {
      return { success: false, message: 'Aadhaar number must be exactly 12 digits.' };
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      return { success: false, message: 'Mobile number must be exactly 10 digits.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (checkDuplicate('aadhaar', formData.aadhaar).duplicate) {
      return { success: false, message: 'An application already exists with this Aadhaar number.' };
    }
    if (checkDuplicate('mobile', formData.mobile).duplicate) {
      return { success: false, message: 'An application already exists with this Mobile number.' };
    }
    if (checkDuplicate('email', formData.email).duplicate) {
      return { success: false, message: 'An application already exists with this Email address.' };
    }
    if (!formData.declaration) {
      return { success: false, message: 'You must accept the declaration before submitting.' };
    }

    // Validate + upload required documents
    var files = formData.files || {};
    var uploadedUrls = {};
    for (var i = 0; i < DOCUMENT_FIELDS.length; i++) {
      var docField = DOCUMENT_FIELDS[i];
      var fileEntry = files[docField.key];
      if (docField.required && !fileEntry) {
        return { success: false, message: docField.label + ' is a required upload.' };
      }
      if (fileEntry) {
        var approxKB = (fileEntry.base64.length * 0.75) / 1024;
        if (approxKB > docField.maxKB * 1.05) {
          return { success: false, message: docField.label + ' exceeds the maximum size of ' + docField.maxKB + ' KB.' };
        }
      }
    }

    var applicationNumber = generateApplicationNumber();

    for (var j = 0; j < DOCUMENT_FIELDS.length; j++) {
      var df = DOCUMENT_FIELDS[j];
      var entry = files[df.key];
      if (entry) {
        var safeName = applicationNumber + '_' + df.label.replace(/[^a-zA-Z0-9]+/g, '_') + '_' + entry.name;
        uploadedUrls[df.sheetKey] = saveBase64File_(entry.base64, entry.mimeType, safeName, df.folder);
      } else {
        uploadedUrls[df.sheetKey] = '';
      }
    }

    var now = new Date();
    var tz = Session.getScriptTimeZone();
    var row = SHEET_HEADERS.map(function (h) {
      switch (h.key) {
        case 'submissionDate': return Utilities.formatDate(now, tz, 'dd-MM-yyyy');
        case 'submissionTime': return Utilities.formatDate(now, tz, 'HH:mm:ss');
        case 'applicationNumber': return applicationNumber;
        case 'status': return 'Received';
        case 'photoUrl': return uploadedUrls.photoUrl || '';
        case 'signatureUrl': return uploadedUrls.signatureUrl || '';
        case 'docAadhaarUrl': return uploadedUrls.docAadhaarUrl || '';
        case 'docSscUrl': return uploadedUrls.docSscUrl || '';
        case 'docInterUrl': return uploadedUrls.docInterUrl || '';
        case 'docDegreeUrl': return uploadedUrls.docDegreeUrl || '';
        case 'docPgUrl': return uploadedUrls.docPgUrl || '';
        case 'docMarksMemoUrl': return uploadedUrls.docMarksMemoUrl || '';
        case 'docExperienceUrl': return uploadedUrls.docExperienceUrl || '';
        case 'docCasteUrl': return uploadedUrls.docCasteUrl || '';
        case 'docResidenceUrl': return uploadedUrls.docResidenceUrl || '';
        case 'docWidowUrl': return uploadedUrls.docWidowUrl || '';
        case 'docDisabilityUrl': return uploadedUrls.docDisabilityUrl || '';
        case 'docComputerUrl': return uploadedUrls.docComputerUrl || '';
        case 'docOtherUrl': return uploadedUrls.docOtherUrl || '';
        case 'declaration': return formData.declaration ? 'Yes' : 'No';
        default: return formData[h.key] !== undefined && formData[h.key] !== null ? formData[h.key] : '';
      }
    });

    var sheet = getSheet_();
    sheet.appendRow(row);

    var pdfUrl = '';
    try {
      pdfUrl = generateApplicationPdf_(buildRecordFromFormData_(formData, applicationNumber, uploadedUrls, now, tz));
    } catch (pdfErr) {
      pdfUrl = ''; // Non-fatal: submission already saved.
    }

    try {
      sendConfirmationEmail_(formData.email, formData.fullName, formData.positionAppliedFor, applicationNumber,
        Utilities.formatDate(now, tz, 'dd-MM-yyyy'));
    } catch (mailErr) {
      // Non-fatal: submission already saved even if email fails.
    }

    return { success: true, applicationNumber: applicationNumber, pdfUrl: pdfUrl };
  } catch (err) {
    return { success: false, message: 'Server error: ' + err.message };
  }
}

function buildRecordFromFormData_(formData, applicationNumber, uploadedUrls, now, tz) {
  var record = {};
  SHEET_HEADERS.forEach(function (h) { record[h.key] = formData[h.key] || ''; });
  record.applicationNumber = applicationNumber;
  record.status = 'Received';
  record.submissionDate = Utilities.formatDate(now, tz, 'dd-MM-yyyy');
  record.submissionTime = Utilities.formatDate(now, tz, 'HH:mm:ss');
  record.declaration = formData.declaration ? 'Yes' : 'No';
  Object.keys(uploadedUrls).forEach(function (k) { record[k] = uploadedUrls[k]; });
  return record;
}

// ============================================================================
// EMAIL
// ============================================================================

function sendConfirmationEmail_(email, name, post, applicationNumber, dateStr) {
  var subject = 'Application Submitted Successfully';
  var htmlBody =
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #d9e2f3;border-radius:8px;overflow:hidden;">' +
    '<div style="background:#0b3d91;color:#fff;padding:16px 24px;"><h2 style="margin:0;">Government of Telangana</h2>' +
    '<p style="margin:4px 0 0;">Women Development and Child Welfare Department, Peddapalli District</p></div>' +
    '<div style="padding:24px;color:#1a1a1a;">' +
    '<p>Dear ' + escapeHtml_(name) + ',</p>' +
    '<p>Your application has been <strong>submitted successfully</strong>. Details are below:</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;">' +
    '<tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Application Number</td><td style="padding:8px;border:1px solid #e0e0e0;">' + escapeHtml_(applicationNumber) + '</td></tr>' +
    '<tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Applicant Name</td><td style="padding:8px;border:1px solid #e0e0e0;">' + escapeHtml_(name) + '</td></tr>' +
    '<tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Applied Post</td><td style="padding:8px;border:1px solid #e0e0e0;">' + escapeHtml_(post) + '</td></tr>' +
    '<tr><td style="padding:8px;border:1px solid #e0e0e0;font-weight:bold;">Submission Date</td><td style="padding:8px;border:1px solid #e0e0e0;">' + escapeHtml_(dateStr) + '</td></tr>' +
    '</table>' +
    '<p>Please retain your Application Number for future reference. You may track your application status anytime using the "My Application" section of the portal along with your registered mobile number.</p>' +
    '<p style="margin-top:24px;">Regards,<br/>' + DEPARTMENT_EMAIL_NAME + '</p>' +
    '</div></div>';
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

function escapeHtml_(str) {
  return String(str || '').replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

// ============================================================================
// PDF GENERATION (HTML -> Google Doc -> PDF, pure Apps Script, no external services)
// ============================================================================

function generateApplicationPdf_(record) {
  var html = buildApplicationHtml_(record);
  var htmlBlob = Utilities.newBlob(html, MimeType.HTML, record.applicationNumber + '.html');
  var resource = { title: record.applicationNumber, mimeType: MimeType.GOOGLE_DOCS };
  // `convert: true` is required for Drive API v2 to convert the HTML blob into a Google Doc.
  var tempDocFile = Drive.Files.insert(resource, htmlBlob, { convert: true });
  var tempDoc = DriveApp.getFileById(tempDocFile.id);
  var pdfBlob = tempDoc.getAs(MimeType.PDF).setName(record.applicationNumber + '.pdf');
  var pdfSaveFolder = getOrCreateFolder_('Generated Applications (PDF)', getRootUploadFolder_());
  var pdfFile = pdfSaveFolder.createFile(pdfBlob);
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  tempDoc.setTrashed(true);
  return pdfFile.getUrl();
}

function buildApplicationHtml_(r) {
  var edu = safeParseArray_(r.educationDetails);
  var training = safeParseArray_(r.trainingDetails);
  var employment = safeParseArray_(r.employmentHistory);
  var languages = safeParseArray_(r.languageSkills);

  function row(label, value) {
    return '<tr><td style="font-weight:bold;width:35%;padding:4px 8px;border:1px solid #ccc;background:#f5f7fb;">' + escapeHtml_(label) +
      '</td><td style="padding:4px 8px;border:1px solid #ccc;">' + escapeHtml_(value) + '</td></tr>';
  }

  function tableFromRows(headers, rows) {
    var out = '<table style="width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:12px;">';
    out += '<tr>' + headers.map(function (h) { return '<th style="border:1px solid #ccc;padding:4px;background:#0b3d91;color:#fff;">' + escapeHtml_(h) + '</th>'; }).join('') + '</tr>';
    rows.forEach(function (rw) {
      out += '<tr>' + rw.map(function (c) { return '<td style="border:1px solid #ccc;padding:4px;">' + escapeHtml_(c) + '</td>'; }).join('') + '</tr>';
    });
    out += '</table>';
    return out;
  }

  var html = '<html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;}' +
    'h2{color:#0b3d91;margin-bottom:0;}h3{color:#0b3d91;border-bottom:2px solid #0b3d91;padding-bottom:4px;margin-top:20px;}' +
    'table{width:100%;} </style></head><body>';
  html += '<div style="text-align:center;">' +
    '<h2>Government of Telangana</h2>' +
    '<p style="margin:2px;">Women Development and Child Welfare Department, Peddapalli District</p>' +
    '<h3 style="border:none;">ONLINE APPLICATION FORM</h3></div>';

  html += '<h3>Application Summary</h3><table style="border-collapse:collapse;">' +
    row('Application Number', r.applicationNumber) +
    row('Status', r.status) +
    row('Submission Date', r.submissionDate + ' ' + r.submissionTime) +
    '</table>';

  html += '<h3>Personal Information</h3><table style="border-collapse:collapse;">' +
    row('Position Applied For', r.positionAppliedFor) +
    row('Full Name', r.fullName) +
    row("Father's Name", r.fathersName) +
    row("Husband's Name", r.husbandsName) +
    row("Mother's Name", r.mothersName) +
    row('Gender', r.gender) +
    row('Marital Status', r.maritalStatus) +
    row('Date of Birth', r.dob) +
    row('Age', r.age) +
    row('Aadhaar Number', r.aadhaar) +
    row('Mobile Number', r.mobile) +
    row('Alternate Mobile', r.altMobile) +
    row('Email', r.email) +
    row('Category', r.category) +
    row('Community', r.community) +
    row('Religion', r.religion) +
    row('Nationality', r.nationality) +
    row('District', r.district) +
    row('Mandal', r.mandal) +
    row('Village', r.village) +
    row('Pincode', r.pincode) +
    row('Permanent Address', r.permanentAddress) +
    row('Correspondence Address', r.correspondenceAddress) +
    row('Local Candidate', r.localCandidate) +
    row('Identification Mark 1', r.idMark1) +
    row('Identification Mark 2', r.idMark2) +
    '</table>';

  html += '<h3>Reservation Details</h3><table style="border-collapse:collapse;">' +
    row('Widow', r.widow) + row('Orphan', r.orphan) + row('PwBD', r.pwbd) +
    row('Disability Percentage', r.disabilityPercent) + row('Nature of Disability', r.disabilityNature) +
    row('Ex-serviceman', r.exServiceman) + row('Sports Category', r.sportsCategory) + row('EWS', r.ews) +
    '</table>';

  html += '<h3>Educational Qualifications</h3>' + tableFromRows(
    ['Qualification', 'Board', 'Institution', 'Year', 'Hall Ticket No', 'Max Marks', 'Marks Obtained', '%'],
    edu.map(function (e) { return [e.qualification, e.board, e.institution, e.year, e.hallTicket, e.maxMarks, e.marksObtained, e.percentage]; })
  );

  html += '<h3>Training Details</h3>' + tableFromRows(
    ['Training', 'Institution', 'Duration', 'Year', 'Certificate No'],
    training.map(function (t) { return [t.training, t.institution, t.duration, t.year, t.certificateNumber]; })
  );

  html += '<h3>Employment History</h3>' + tableFromRows(
    ['Organization', 'Designation', 'Nature', 'From', 'To', 'Salary', 'Responsibilities'],
    employment.map(function (e) { return [e.organization, e.designation, e.nature, e.from, e.to, e.salary, e.responsibilities]; })
  );
  html += '<table style="border-collapse:collapse;">' +
    row('Present Employment Status', r.presentEmploymentStatus) + row('Reason for Leaving', r.reasonForLeaving) + '</table>';

  html += '<h3>Computer Skills</h3><table style="border-collapse:collapse;">' +
    row('Skills', r.computerSkills) + row('Skill Level', r.computerSkillLevel) + '</table>';

  html += '<h3>Language Skills</h3>' + tableFromRows(
    ['Language', 'Read', 'Write', 'Speak'],
    languages.map(function (l) { return [l.language, l.read ? 'Yes' : 'No', l.write ? 'Yes' : 'No', l.speak ? 'Yes' : 'No']; })
  );

  html += '<h3>Criminal History</h3><table style="border-collapse:collapse;">' +
    row('Charge Sheeted', r.chargeSheeted) + row('Convicted', r.convicted) + row('Dismissed', r.dismissed) +
    row('Remarks', r.criminalRemarks) + '</table>';

  html += '<h3>Declaration</h3><p>I hereby declare that all the information furnished above is true and correct.</p>' +
    '<table style="border-collapse:collapse;">' + row('Place', r.place) + row('Date', r.declarationDate) + '</table>';

  html += '</body></html>';
  return html;
}

function safeParseArray_(jsonStr) {
  try {
    var parsed = JSON.parse(jsonStr || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// ============================================================================
// APPLICANT SELF-SERVICE (search own application)
// ============================================================================

/** Requires BOTH application number and mobile number to match, to prevent enumeration. */
function searchApplication(applicationNumber, mobileNumber) {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { found: false };
  var data = sheet.getRange(2, 1, lastRow - 1, SHEET_HEADERS.length).getValues();
  var appIdx = SHEET_HEADERS.map(function (h) { return h.key; }).indexOf('applicationNumber');
  var mobileIdx = SHEET_HEADERS.map(function (h) { return h.key; }).indexOf('mobile');
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][appIdx]).trim() === String(applicationNumber).trim() &&
      String(data[i][mobileIdx]).trim() === String(mobileNumber).trim()) {
      return { found: true, record: rowToRecord_(data[i]) };
    }
  }
  return { found: false };
}

function rowToRecord_(rowArray) {
  var record = {};
  SHEET_HEADERS.forEach(function (h, idx) { record[h.key] = rowArray[idx]; });
  return record;
}

function downloadApplicationPdf(applicationNumber, mobileNumber) {
  var result = searchApplication(applicationNumber, mobileNumber);
  if (!result.found) return { success: false, message: 'No matching application found.' };
  try {
    var pdfUrl = generateApplicationPdf_(result.record);
    return { success: true, pdfUrl: pdfUrl };
  } catch (e) {
    return { success: false, message: 'Could not generate PDF: ' + e.message };
  }
}

// ============================================================================
// ADMIN PANEL
// ============================================================================

function adminLogin(password) {
  var props = PropertiesService.getScriptProperties();
  var storedPassword = props.getProperty(ADMIN_PASSWORD_PROPERTY);
  if (!storedPassword) {
    storedPassword = DEFAULT_ADMIN_PASSWORD;
    props.setProperty(ADMIN_PASSWORD_PROPERTY, storedPassword);
  }
  if (password !== storedPassword) {
    return { success: false, message: 'Incorrect password.' };
  }
  var token = Utilities.getUuid();
  CacheService.getScriptCache().put('ADMIN_TOKEN_' + token, 'valid', ADMIN_TOKEN_CACHE_SECONDS);
  return { success: true, token: token };
}

function verifyAdminToken_(token) {
  if (!token) return false;
  return CacheService.getScriptCache().get('ADMIN_TOKEN_' + token) === 'valid';
}

function getAllApplications(token) {
  if (!verifyAdminToken_(token)) return { success: false, message: 'Session expired. Please log in again.' };
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: true, records: [] };
  var data = sheet.getRange(2, 1, lastRow - 1, SHEET_HEADERS.length).getValues();
  var records = data.map(function (rowArray, idx) {
    var rec = rowToRecord_(rowArray);
    rec._rowNumber = idx + 2;
    return rec;
  });
  return { success: true, records: records };
}

function updateApplicationStatus(token, applicationNumber, newStatus) {
  if (!verifyAdminToken_(token)) return { success: false, message: 'Session expired. Please log in again.' };
  var validStatuses = ['Pending', 'Verified', 'Rejected', 'Selected', 'Received'];
  if (validStatuses.indexOf(newStatus) === -1) return { success: false, message: 'Invalid status.' };
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: false, message: 'No applications found.' };
  var appColIdx = SHEET_HEADERS.map(function (h) { return h.key; }).indexOf('applicationNumber') + 1;
  var statusColIdx = SHEET_HEADERS.map(function (h) { return h.key; }).indexOf('status') + 1;
  var appNumbers = sheet.getRange(2, appColIdx, lastRow - 1, 1).getValues();
  for (var i = 0; i < appNumbers.length; i++) {
    if (String(appNumbers[i][0]).trim() === String(applicationNumber).trim()) {
      sheet.getRange(i + 2, statusColIdx).setValue(newStatus);
      return { success: true };
    }
  }
  return { success: false, message: 'Application not found.' };
}

function adminGetApplicationPdf(token, applicationNumber) {
  if (!verifyAdminToken_(token)) return { success: false, message: 'Session expired. Please log in again.' };
  var all = getAllApplications(token);
  if (!all.success) return all;
  var record = all.records.filter(function (r) { return r.applicationNumber === applicationNumber; })[0];
  if (!record) return { success: false, message: 'Application not found.' };
  try {
    var pdfUrl = generateApplicationPdf_(record);
    return { success: true, pdfUrl: pdfUrl };
  } catch (e) {
    return { success: false, message: 'Could not generate PDF: ' + e.message };
  }
}

/** Exports the entire Applications sheet as an .xlsx file (base64) for client-side download. */
function exportApplicationsExcel(token) {
  if (!verifyAdminToken_(token)) return { success: false, message: 'Session expired. Please log in again.' };
  try {
    var url = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/export?format=xlsx&gid=' + getSheet_().getSheetId();
    var response = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() !== 200) {
      return { success: false, message: 'Export failed with status ' + response.getResponseCode() };
    }
    var blob = response.getBlob();
    return {
      success: true,
      base64: Utilities.base64Encode(blob.getBytes()),
      fileName: 'WDCW_Peddapalli_Applications_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  } catch (e) {
    return { success: false, message: 'Export error: ' + e.message };
  }
}
