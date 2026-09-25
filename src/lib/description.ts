import { escapeHtml, truncate } from './tweeble-client';

const LABELLED = /^([^:.,;!?]{2,40}):\s+(\S.*)$/;

/** A one- or two-sentence teaser pulled from a Tweeble description's first paragraph. */
export function summaryFromDescription(description: string): string {
  const firstParagraph = (description.split(/\r?\n\r?\n/)[0] ?? '').replace(/\s+/g, ' ').trim();
  return firstParagraph.match(/^.{20,260}?[.!?](?=\s|$)/)?.[0] ?? truncate(firstParagraph, 200);
}

const paragraph = (line: string) => {
  const m = line.match(LABELLED);
  return m ? `<p><strong>${escapeHtml(m[1])}:</strong> ${escapeHtml(m[2])}</p>` : `<p>${escapeHtml(line)}</p>`;
};

/**
 * Turns a Tweeble plain-text description into HTML. Blank lines separate
 * paragraphs. A short, unpunctuated first line followed by more lines is a
 * heading: the lines under it become a list, or — when each is a
 * "Label: text" line — labelled paragraphs. A lone "Label: text" line gets
 * its label bolded.
 */
export function descriptionToHtml(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0)
    .map((lines) => {
      if (lines.length === 1) return paragraph(lines[0]);
      const [first, ...rest] = lines;
      if (first.length <= 40 && !/[.!?:,;]$/.test(first)) {
        const body = rest.every((l) => LABELLED.test(l))
          ? rest.map(paragraph).join('')
          : `<ul>${rest.map((li) => `<li>${escapeHtml(li)}</li>`).join('')}</ul>`;
        return `<h2>${escapeHtml(first)}</h2>${body}`;
      }
      return `<p>${lines.map(escapeHtml).join('<br />')}</p>`;
    })
    .join('\n');
}
