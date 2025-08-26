declare module 'rrule' {
  export interface RRuleOptions {
    freq?: number;
    dtstart?: Date;
    interval?: number;
    wkst?: number;
    count?: number;
    until?: Date;
    bysetpos?: number[];
    bymonth?: number[];
    bymonthday?: number[];
    byyearday?: number[];
    byweekno?: number[];
    byweekday?: number[];
    byhour?: number[];
    byminute?: number[];
    bysecond?: number[];
    byeaster?: number;
  }

  export class RRule {
    constructor(options: RRuleOptions);
    
    static FREQ: {
      YEARLY: number;
      MONTHLY: number;
      WEEKLY: number;
      DAILY: number;
      HOURLY: number;
      MINUTELY: number;
      SECONDLY: number;
    };

    static MO: number;
    static TU: number;
    static WE: number;
    static TH: number;
    static FR: number;
    static SA: number;
    static SU: number;

    between(after: Date, before: Date, inc: boolean): Date[];
    after(date: Date, inc: boolean): Date | null;
    before(date: Date, inc: boolean): Date | null;
    all(): Date[];
    toString(): string;
    isFullyConvertibleToText(): boolean;
    toText(): string;
  }

  export function rrulestr(s: string, options?: RRuleOptions): RRule;
  export function rrulestr(s: string, options?: RRuleOptions & { cache?: boolean }): RRule;
  
  export function parseText(text: string): RRuleOptions;
  export function parseText(text: string, language?: string): RRuleOptions;
  
  export function toText(rule: RRule, language?: string): string;
  export function toText(rule: RRuleOptions, language?: string): string;
}
