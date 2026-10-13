import { sound } from './sound.ts';

export async function shareContent({
  title,
  text,
  url,
  onSuccess,
  onFallback,
}: {
  title: string;
  text: string;
  url: string;
  onSuccess?: () => void;
  onFallback?: () => void;
}) {
  sound.playPop();

  let shareFiles: File[] = [];
  try {
    const response = await fetch('/SM.jpg');
    if (response.ok) {
      const blob = await response.blob();
      const file = new File([blob], 'SM.jpg', { type: 'image/jpeg' });
      shareFiles = [file];
    }
  } catch (err) {
    console.warn('Could not load SM.jpg for sharing:', err);
  }

  if (navigator.share) {
    try {
      const shareData: ShareData = {
        title,
        text,
        url,
      };

      if (shareFiles.length > 0 && navigator.canShare && navigator.canShare({ files: shareFiles })) {
        shareData.files = shareFiles;
      }

      await navigator.share(shareData);
      if (onSuccess) onSuccess();
      return;
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name === 'AbortError') {
        return;
      }
    }
  }

  // Fallback to WhatsApp and Clipboard
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');

  try {
    await navigator.clipboard.writeText(text);
    if (onSuccess) onSuccess();
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    if (onFallback) onFallback();
  }
}
