/**
 * Helper to show toast notifications when form submission fails due to missing or invalid required fields.
 */
export function onFormInvalid(errors: Record<string, any>, toast: any) {
  const messages: string[] = [];
  
  const extractMessages = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.message && typeof obj.message === 'string') {
      messages.push(obj.message);
    } else {
      Object.values(obj).forEach(val => extractMessages(val));
    }
  };

  extractMessages(errors);

  const uniqueMessages = Array.from(new Set(messages)).filter(Boolean);
  const count = uniqueMessages.length;
  const summary = uniqueMessages.slice(0, 3).join(' • ') + (count > 3 ? ` (+${count - 3} more)` : '');

  toast({
    title: "Required Fields Missing",
    description: summary || "Please fill in all required fields before saving.",
    variant: "destructive"
  });
}
