export const COPYRIGHT_TEXT = '© Mohamed Abu AlSaud & Sama ♥';

export const SHARE_FOOTER = `. 
. 
. 
. 
Bestiecheck SM
© Mohamed Abu AlSaud & Sama ♥`;

export function formatQuizShareText(creatorName: string, url: string): string {
  return `${creatorName} وريني، لو كنت صاحبي/تي وحبيبي/تي \nبجد ولا متعرفنيش كويس ومش مهتم.. لو درجتك معجبتنيش هديك/ي احلي بلوك.. 🤨 ✨\n\n• الرابط:\n${url}\n\n${SHARE_FOOTER}`;
}

export function formatPlatformShareText(url: string): string {
  return `منصه Bestiecheck Sm لأختبارات الصداقة الفرفوشه أنشئ اختبارك واعرف مين صحابك اللي بجد ومين محتاج يركز معاك..! 👌👫\n\n• الرابط:\n${url}\n\n${SHARE_FOOTER}`;
}

export function formatResultShareText(creatorName: string, score: number, total: number, url: string): string {
  return `أنا جبت ${score} من ${total} في اختبار الصداقة بتاع ${creatorName}! ادخل شوف هتعرف تجيب أعلى مني ولا هتهبد!\n\n• الرابط:\n${url}\n\n${SHARE_FOOTER}`;
}

export async function shareLinkWithImage(title: string, text: string, url: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      // Try to attach SM.jpg image if browser supports file sharing
      if (navigator.canShare) {
        try {
          const res = await fetch('/SM.jpg');
          if (res.ok) {
            const blob = await res.blob();
            const file = new File([blob], 'SM.jpg', { type: 'image/jpeg' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title,
                text,
                url,
                files: [file],
              });
              return true;
            }
          }
        } catch {}
      }

      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch {
      // User cancelled or share dismissed
      return false;
    }
  }
  return false;
}
