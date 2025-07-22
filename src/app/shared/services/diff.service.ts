import { Injectable } from '@angular/core';
import { DiffSpan } from '../../modules/chat/models/message.model';

@Injectable({
  providedIn: 'root'
})
export class DiffService {

  constructor() { }

  /**
   * Computes the difference between two texts at word level and returns an array of DiffSpan objects
   * @param oldText The original text
   * @param newText The new text
   * @returns Array of DiffSpan objects with text and changed flag
   */
  computeWordDiff(oldText: string, newText: string): DiffSpan[] {
    // Split texts into words
    const oldWords = this.tokenizeText(oldText);
    const newWords = this.tokenizeText(newText);
    
    // Find the longest common subsequence
    const lcs = this.longestCommonSubsequence(oldWords, newWords);
    
    // Build the diff spans
    const diffSpans: DiffSpan[] = [];
    let currentSpan: DiffSpan | null = null;
    
    let oldIndex = 0;
    let newIndex = 0;
    let lcsIndex = 0;
    
    while (newIndex < newWords.length) {
      if (lcsIndex < lcs.length && newWords[newIndex] === lcs[lcsIndex]) {
        // Word is unchanged
        if (currentSpan && !currentSpan.changed) {
          // Append to current unchanged span
          currentSpan.text += (currentSpan.text ? ' ' : '') + newWords[newIndex];
        } else {
          // Start a new unchanged span
          if (currentSpan) {
            diffSpans.push(currentSpan);
          }
          currentSpan = { text: newWords[newIndex], changed: false };
        }
        oldIndex++;
        newIndex++;
        lcsIndex++;
      } else {
        // Word is changed
        if (currentSpan && currentSpan.changed) {
          // Append to current changed span
          currentSpan.text += (currentSpan.text ? ' ' : '') + newWords[newIndex];
        } else {
          // Start a new changed span
          if (currentSpan) {
            diffSpans.push(currentSpan);
          }
          currentSpan = { text: newWords[newIndex], changed: true };
        }
        newIndex++;
      }
    }
    
    // Add the last span if it exists
    if (currentSpan) {
      diffSpans.push(currentSpan);
    }
    
    return diffSpans;
  }
  
  /**
   * Tokenizes text into words, preserving punctuation
   */
  private tokenizeText(text: string): string[] {
    // This simple tokenization splits by whitespace but keeps punctuation attached to words
    // For a more sophisticated approach, consider using a proper NLP tokenizer
    return text.trim().split(/\s+/);
  }
  
  /**
   * Finds the longest common subsequence between two arrays
   */
  private longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
    const lengths: number[][] = Array(arr1.length + 1)
      .fill(0)
      .map(() => Array(arr2.length + 1).fill(0));
    
    // Fill the lengths array
    for (let i = 0; i < arr1.length; i++) {
      for (let j = 0; j < arr2.length; j++) {
        if (arr1[i] === arr2[j]) {
          lengths[i + 1][j + 1] = lengths[i][j] + 1;
        } else {
          lengths[i + 1][j + 1] = Math.max(lengths[i + 1][j], lengths[i][j + 1]);
        }
      }
    }
    
    // Reconstruct the LCS
    const result: string[] = [];
    let i = arr1.length;
    let j = arr2.length;
    
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        result.unshift(arr1[i - 1]);
        i--;
        j--;
      } else if (lengths[i - 1][j] > lengths[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return result;
  }
}