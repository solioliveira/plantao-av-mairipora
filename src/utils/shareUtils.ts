export interface ShareOptions {
  title: string;
  text: string;
  whatsappSummary?: string;
  fileName?: string;
}

/**
 * Robust share function:
 * 1. Attempts Web Share API (native sheet on Android / iOS / modern desktop).
 * 2. If unsupported or if share fails (e.g., iframe permissions or unsupported file/text length),
 *    automatically copies the full formatted text to the clipboard and launches WhatsApp with
 *    the message ready for pasting.
 */
export async function shareOrFallback(
  options: ShareOptions,
  onFeedback: (message: string, isSuccess: boolean) => void
): Promise<void> {
  const { title, text, whatsappSummary } = options;

  // 1. Try native Web Share API
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      onFeedback('Compartilhado com sucesso via aplicativo!', true);
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User closed/canceled the share sheet intentionally
        return;
      }
      console.warn('Native share failed or blocked by iframe, falling back to clipboard + WhatsApp:', err);
    }
  }

  // 2. Fallback: Copy complete text to clipboard
  let copied = false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (clipErr) {
    console.warn('Clipboard write error:', clipErr);
  }

  // 3. Open WhatsApp with summary and ready-to-paste instruction
  const summary = whatsappSummary || text.slice(0, 1000);
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`;
  window.open(waUrl, '_blank');

  if (copied) {
    onFeedback(
      '📋 Texto completo copiado para a área de transferência! WhatsApp aberto para você colar.',
      true
    );
  } else {
    onFeedback('WhatsApp aberto para envio do resumo.', true);
  }
}

/**
 * Direct file download helper for .txt files
 */
export function downloadTextFile(filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
