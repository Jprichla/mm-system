import { S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID ?? '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? '';

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? '';

// URL pública do bucket (Custom Domain do R2, ou o dev URL r2.dev habilitado no painel da Cloudflare)
// Ex: https://arquivos.seudominio.com  ou  https://pub-xxxxxxxx.r2.dev
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '');

if (!accountId || !accessKeyId || !secretAccessKey || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️  Variáveis de ambiente do R2 (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL) não estão todas configuradas. Upload de arquivos vai falhar.'
  );
}

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export function montarChaveArquivo(pastaBase: string, entidadeId: string, nomeOriginal: string): string {
  const ext = nomeOriginal.includes('.') ? nomeOriginal.slice(nomeOriginal.lastIndexOf('.')) : '';
  const baseSemExt = nomeOriginal
    .slice(0, nomeOriginal.length - ext.length)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 60);
  const timestamp = Date.now();
  const sufixoAleatorio = Math.random().toString(36).slice(2, 8);
  return `${pastaBase}/${entidadeId}/${timestamp}-${sufixoAleatorio}-${baseSemExt}${ext}`;
}

export function montarUrlPublica(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

// Extrai a "key" do objeto a partir da URL pública salva no banco.
// Necessário pra conseguir apagar o arquivo certo no R2 quando o anexo é removido.
export function extrairChaveDaUrl(url: string): string | null {
  if (!R2_PUBLIC_URL || !url.startsWith(`${R2_PUBLIC_URL}/`)) return null;
  return url.slice(R2_PUBLIC_URL.length + 1);
}
