# Навигатор мер поддержки — Mobile MVP v2 (Expo React Native)

Это **переработанный** мобильный прототип с:
- нормальными "скелетонами" загрузки (Skeleton UI)
- поиском
- фильтрами (уровень меры, тип, статус пригодности, только мой регион)
- избранным (★) с сохранением в AsyncStorage
- навигацией: Bottom Tabs + экран деталки (React Navigation)

> Данные мер в проекте — демо. Замените `src/data/measures.ts` на реальные и добавьте ссылки на первоисточники.

## Запуск
1) Node.js 18+
2) В папке проекта:
   - `npm install`
   - `npm run start`
3) Expo Go на телефоне → скан QR

## Важно по зависимостям
React Navigation в Expo обычно требует:
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `@react-navigation/native-stack`
- `react-native-screens`
- `react-native-safe-area-context`
AsyncStorage:
- `@react-native-async-storage/async-storage`
Picker:
- `@react-native-picker/picker`

Если Expo попросит, можно поставить через:
- `npx expo install <package>`

## Структура
- `App.tsx` — провайдеры + навигация
- `src/navigation/*` — табы + стек деталки
- `src/store/*` — состояние (профиль, избранное), сохранение
- `src/screens/*` — Profile, Browse, Favorites, Detail
- `src/engine/eligibility.ts` — правила пригодности
- `src/data/measures.ts` — демо-каталог мер

## Что дальше
- подключить реальный справочник мер по регионам (CMS/Backend)
- “трекер заявок” и чек-листы документов
- пуши/напоминания по срокам
