/**
 * S.N.A.X. ARCADE: WINGS & BONELESS RUSH
 * Backend en Google Apps Script (code.gs) para registrar jugadores,
 * métricas de jugabilidad adaptativa (IA) y cupones desbloqueados en Google Sheets.
 */

const SHEET_NAME = 'Jugadores_SNAX_Arcade';

/**
 * Crea automáticamente la pestaña y los encabezados si aún no existen.
 */
function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Fecha y Hora',
      'Evento',
      'Nombre del Jugador',
      'Puntuación',
      'Nivel Alcanzado',
      'Precisión (%)',
      'Perfil Dificultad IA',
      'Cupón Desbloqueado'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#dc2626')
      .setFontColor('#facc15')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Recibe las peticiones POST desde script.js cuando el jugador inicia sesión
 * y cuando finaliza su partida.
 */
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const sheet = getOrCreateSheet_();
    const timestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || 'America/Mexico_City',
      'yyyy-MM-dd HH:mm:ss'
    );

    sheet.appendRow([
      timestamp,
      data.evento || 'REGISTRO',
      data.jugador || 'INVITADO',
      Number(data.puntuacion || 0),
      Number(data.nivel || 1),
      data.precision || '0%',
      data.perfilIA || 'ESTÁNDAR',
      data.cupon || 'NINGUNO'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Registro guardado en S.N.A.X. Sheets' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint GET opcional para verificar desde el navegador que el servicio está activo.
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'online',
      app: 'S.N.A.X. Arcade Backend',
      sheet: SHEET_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}