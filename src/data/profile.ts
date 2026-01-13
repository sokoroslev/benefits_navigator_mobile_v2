import { UserProfile } from "../types";

export const defaultProfile: UserProfile = {
  region: "RU-MOW",
  hasRegionalRegistration: true,

  householdAdults: 2,
  children: [{ birthDateISO: "2022-01-01" }],

  monthlyHouseholdIncomeRub: 120000,

  employment: "employed",
  isOfficiallyUnemployed: false,

  disability: "none",
  caringForDisabledOrChild: false,

  housing: "own",
  hasMortgage: true,
  thirdChildBirthDateISO: null,

  paysNDFL13: true,
  hasMedicalExpenses: false,
  hasPrescriptionDrugsExpenses: false,
  hasSportExpenses: false,
  hasEducationExpenses: false,
  hasMortgageInterestExpenses: false,
};
