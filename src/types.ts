/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CalculationHistoryItem {
  id: string;
  formula: string;
  result: string;
  timestamp: Date;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  benefits: string[];
  period: string;
  color: string;
}

export type CalculatorMode = 'standard' | 'scientific';
