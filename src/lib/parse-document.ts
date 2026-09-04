import { parsePDF } from "@/lib/parse-pdf";
// @ts-ignore
import mammoth from "mammoth";

export async function parseResumeDocument(
  buffer: Buffer,
  fileName?: string,
  mimeType?: string
): Promise<{ text: string }> {
  const lowerName = (fileName || "").toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  // 1. Check magic bytes
  const isPdf =
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46; // %PDF
  const isZipOrDocx =
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04; // PK..
  const isOleDoc =
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0; // OLE CFBF

  // Handle PDF
  if (isPdf || lowerName.endsWith(".pdf") || lowerMime.includes("pdf")) {
    return parsePDF(buffer);
  }

  // Handle DOCX (OpenXML)
  if (isZipOrDocx || lowerName.endsWith(".docx") || lowerMime.includes("wordprocessingml")) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return { text: result.value };
      }
    } catch (docxErr) {
      console.warn("[parseResumeDocument] Mammoth extraction failed, trying text extraction fallback:", docxErr);
    }
  }

  // Handle DOC (Legacy Word Binary)
  if (isOleDoc || lowerName.endsWith(".doc") || lowerMime.includes("msword")) {
    try {
      // Mammoth can sometimes extract if it's modern XML in disguise
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return { text: result.value };
      }
    } catch {
      // Mammoth expected to fail for binary .doc
    }

    const extractedText = extractTextFromBinary(buffer);
    if (extractedText.trim().length > 0) {
      return { text: extractedText };
    }
  }

  // Fallback 1: Try Mammoth (in case extension was missed)
  try {
    const docxRes = await mammoth.extractRawText({ buffer });
    if (docxRes && docxRes.value && docxRes.value.trim().length > 0) {
      return { text: docxRes.value };
    }
  } catch {}

  // Fallback 2: Try PDF parser
  try {
    const pdfRes = await parsePDF(buffer);
    if (pdfRes.text && pdfRes.text.trim().length > 0) {
      return pdfRes;
    }
  } catch {}

  // Fallback 3: Try binary text extraction
  const rawText = extractTextFromBinary(buffer);
  if (rawText.trim().length > 0) {
    return { text: rawText };
  }

  throw new Error("Unable to extract text from the document. Please ensure it is a valid PDF, DOC, or DOCX file.");
}

function extractTextFromBinary(buffer: Buffer): string {
  const str = buffer.toString("latin1");
  const matches = str.match(/[\x20-\x7E\r\n\t]{4,}/g);
  if (!matches) return "";
  return matches
    .filter((segment) => !/^[^\w\s]+$/.test(segment))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
