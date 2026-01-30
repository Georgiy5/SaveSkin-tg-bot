import { InlineKeyboard, Keyboard } from "grammy"
// Клавиатура для выбора типа кожи
export const skinTypeKeyboard = new InlineKeyboard()
    .text('Сухая', 'dry').row()
    .text('Нормальная', 'normal').row()
    .text('Жирная', 'oily').row()
    .text('Комбинированная', 'combo').row()
    .text('Чувствительная', 'sensitive')

// Клавиатура для особенностей кожи
export const skinFeaturesKeyboard = new InlineKeyboard()
    .text('Акне/прыщи', 'acne').row()
    .text('Розацеа', 'rosacea').row()
    .text('Аллергии', 'allergies').row()
    .text('Купероз', 'couperose').row()
    .text('Повышенная чувствительность', 'hypersensitivity').row()
    .text('Нет особенностей', 'none')

// Главное меню
export const mainMenuKeyboard = new InlineKeyboard()
    .text('🔍 Проверить состав').row()
    .text('👤 Изменить тип кожи').row()
    .text('📋 История проверок').row()
    .text('❓ Помощь')

export const subcsriptionsPlan = new InlineKeyboard()
    .text('Купить на 1 месяц', 'month').row()
    .text('Купить на 6 месяцев', 'halfYear').row()
    .text('Купить на 12 месяцев', 'year')