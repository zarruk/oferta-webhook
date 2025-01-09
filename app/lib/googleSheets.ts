if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  throw new Error('Faltan las credenciales de Google en las variables de entorno');
}

export const SPREADSHEET_ID = '1T5Hf0XKnOmJNkXeW-5TbkIIxcgBWMNwJ6RVpf-S4xHI';
export const SHEET_ID = '0';
export const CREDENTIALS = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
}; 