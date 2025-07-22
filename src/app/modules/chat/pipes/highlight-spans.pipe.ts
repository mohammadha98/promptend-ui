import { Pipe, PipeTransform } from '@angular/core';
import { ExplainBlock } from '../models/message.model';

@Pipe({
  name: 'highlightSpans',
  standalone: true
})
export class HighlightSpansPipe implements PipeTransform {
  transform(text: string, explanations: ExplainBlock[] = []): string {
    if (!text || !explanations || explanations.length === 0) {
      return text;
    }

    // Sort explanations by start offset in descending order to avoid offset issues
    const sortedExplanations = [...explanations].sort((a, b) => b.range.startOffset - a.range.startOffset);
    
    let highlightedText = text;
    
    // Apply highlights from end to beginning to preserve offsets
    sortedExplanations.forEach(explanation => {
      const { startOffset, endOffset } = explanation.range;
      
      if (startOffset >= 0 && endOffset <= text.length && startOffset < endOffset) {
        const beforeText = highlightedText.substring(0, startOffset);
        const selectedText = highlightedText.substring(startOffset, endOffset);
        const afterText = highlightedText.substring(endOffset);
        
        // Wrap the selected text with a highlight mark
        const highlightedSpan = `<mark class="bg-yellow-200/70 dark:bg-yellow-700/50 rounded px-1 cursor-pointer" data-explain-id="${explanation.id}">${selectedText}</mark>`;
        
        highlightedText = beforeText + highlightedSpan + afterText;
      }
    });
    
    return highlightedText;
  }
}