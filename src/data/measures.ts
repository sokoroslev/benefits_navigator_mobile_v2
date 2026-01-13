import { Measure } from "../types";

/**
 * DEMO measures. Replace with real ones and region parameters.
 */
export const measures: Measure[] = [
  {
    id: "one_time_birth_payment_fed",
    title: "Единовременное пособие при рождении ребёнка (федеральное)",
    level: "federal",
    type: "payment",
    regions: ["*"],
    short: "Разовая выплата при рождении ребёнка (одному из родителей).",
    whatYouGet: "Денежная выплата (разово).",
    whereToApply: ["Госуслуги", "СФР", "Работодатель (если работаете по ТК)"],
    documents: ["Свидетельство о рождении", "Паспорт", "Реквизиты счёта"],
    steps: ["Соберите документы.", "Подайте заявление.", "Дождитесь перечисления."],
    sources: [{ title: "Госуслуги", url: "https://www.gosuslugi.ru/" }],
    rule: { cond: { path: "childrenCount", op: "gte", value: 1 } },
  },
  {
    id: "tax_deduction_medical",
    title: "Налоговый вычет за лечение и лекарства",
    level: "federal",
    type: "tax_deduction",
    regions: ["*"],
    short: "Возврат части НДФЛ за оплату лечения/лекарств.",
    whatYouGet: "Возврат НДФЛ (13%) в пределах лимитов.",
    whereToApply: ["ФНС (личный кабинет)", "Работодатель (упрощённо)"],
    documents: ["Справка об оплате медуслуг", "Договор/чеки", "Рецепты (для лекарств)"],
    steps: ["Соберите документы.", "Подайте заявление на вычет.", "Получите возврат."],
    sources: [{ title: "ФНС", url: "https://www.nalog.gov.ru/" }],
    rule: {
      all: [
        { cond: { path: "paysNDFL13", op: "eq", value: true } },
        {
          any: [
            { cond: { path: "hasMedicalExpenses", op: "eq", value: true } },
            { cond: { path: "hasPrescriptionDrugsExpenses", op: "eq", value: true } },
          ],
        },
      ],
    },
  },
  {
    id: "mortgage_450k_third_child",
    title: "Выплата до 450 000 ₽ на погашение ипотеки (при 3-м ребёнке)",
    level: "federal",
    type: "payment",
    regions: ["*"],
    short: "Поддержка семьям с ипотекой при 3-м ребёнке (в пределах условий программы).",
    whatYouGet: "Погашение части ипотеки (до лимита).",
    whereToApply: ["Банк-кредитор", "Дом.РФ (через банк)"],
    documents: ["Свидетельства о рождении детей", "Кредитный договор", "Документы на жильё"],
    steps: ["Подготовьте пакет документов.", "Подайте через банк.", "Дождитесь зачисления средств."],
    sources: [{ title: "Дом.РФ", url: "https://domrf.ru/" }],
    rule: {
      all: [
        { cond: { path: "hasMortgage", op: "eq", value: true } },
        { cond: { path: "childrenCount", op: "gte", value: 3 } },
      ],
    },
  },
  {
    id: "regional_newborn_example_mow",
    title: "Региональная поддержка новорождённым (пример: Москва)",
    level: "regional",
    type: "benefit",
    regions: ["RU-MOW"],
    short: "Пример региональной меры. Реальные параметры должны обновляться по региону.",
    whatYouGet: "Набор/компенсация (пример).",
    whereToApply: ["Роддом/Соцзащита", "МФЦ"],
    documents: ["Свидетельство о рождении", "Паспорт", "Регистрация"],
    steps: ["Уточните право по региону.", "Получите набор/оформите компенсацию."],
    sources: [{ title: "mos.ru", url: "https://www.mos.ru/" }],
    rule: {
      all: [
        { cond: { path: "region", op: "eq", value: "RU-MOW" } },
        { cond: { path: "childrenCount", op: "gte", value: 1 } },
      ],
    },
  },
];
