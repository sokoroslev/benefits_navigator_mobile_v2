export type RegionCode = string; // e.g. "RU-MOW"

export type DisabilityGroup = "none" | "I" | "II" | "III" | "child";

export interface ChildProfile {
  birthDateISO: string; // YYYY-MM-DD
  isFullTimeStudent18to23?: boolean;
  isDisabledChild?: boolean;
}

export interface UserProfile {
  region: RegionCode;
  hasRegionalRegistration: boolean;

  householdAdults: number;
  children: ChildProfile[];

  monthlyHouseholdIncomeRub: number;

  employment: "employed" | "self_employed" | "ip" | "unemployed" | "pensioner" | "mixed";
  isOfficiallyUnemployed: boolean;

  disability: DisabilityGroup;
  caringForDisabledOrChild: boolean;

  housing: "own" | "rent" | "social" | "other";
  hasMortgage: boolean;
  thirdChildBirthDateISO?: string | null;

  paysNDFL13: boolean;
  hasMedicalExpenses: boolean;
  hasPrescriptionDrugsExpenses: boolean;
  hasSportExpenses: boolean;
  hasEducationExpenses: boolean;
  hasMortgageInterestExpenses: boolean;
}

export type MeasureLevel = "federal" | "regional" | "municipal";
export type MeasureType = "payment" | "benefit" | "service" | "tax_deduction";

export interface Measure {
  id: string;
  title: string;
  level: MeasureLevel;
  type: MeasureType;

  regions: RegionCode[] | ["*"];

  short: string;
  whatYouGet: string;
  whereToApply: string[];
  documents: string[];
  steps: string[];
  sources: { title: string; url: string }[];

  rule: RuleNode;
}

export type Comparator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "exists";

export interface Condition {
  path: string;
  op: Comparator;
  value?: any;
}

export type RuleNode =
  | { all: RuleNode[] }
  | { any: RuleNode[] }
  | { not: RuleNode }
  | { cond: Condition };

export type Eligibility = "eligible" | "maybe" | "not_eligible";

export interface EvaluationResult {
  measureId: string;
  eligibility: Eligibility;
  reasons: string[];
}
