import { InlineKeyboard, Keyboard, session, } from "grammy"

// Клавиатура для выбора типа кожи
export const skinTypeKeyboard = new InlineKeyboard()
    .text('Сухая', 'dry').row()
    .text('Жирная', 'oily').row()
    .text('Комбинированная', 'combo').row()


export const subcsriptionsPlan = new InlineKeyboard()
    .text('Купить на 1 месяц', 'month').row()
    .text('Купить на 6 месяцев', 'halfYear').row()
    .text('Купить на 12 месяцев', 'year')

export const welcomeSubscriptionsPlan = new InlineKeyboard()
    .text('Купить на 1 месяц', 'month').row()
    .text('Купить на 6 месяцев', 'halfYear').row()
    .text('Купить на 12 месяцев', 'year').row()
    .text('Назад⏪', 'back')

export const welcomeKeyboard = new InlineKeyboard()
    .text('Получить пробную подписку на 1 день', 'trial').row()
    .text('Приобрести полную подписку', 'fullSubscription')


export const getSkinFeaturesKeyboard = (ctx) => {
    const skinFeaturesKeyboard = new InlineKeyboard()
        .text(`Акне/прыщи${ctx.session.skinFeatures.includes('acne') ? '✅' : ''}`, 'acne').row()
        .text(`Розацеа${ctx.session.skinFeatures.includes('rosacea') ? '✅' : ''}`, 'rosacea').row()
        .text(`Аллергии${ctx.session.skinFeatures.includes('allergies') ? '✅' : ''}`, 'allergies').row()
        .text(`Купероз${ctx.session.skinFeatures.includes('couperose') ? '✅' : ''}`, 'couperose').row()
        .text(`Повышенная чувствительность${ctx.session.skinFeatures.includes('hypersensitivity') ? '✅' : ''}`, 'hypersensitivity').row()
        .text(`Дерматит${ctx.session.skinFeatures.includes('dermatit') ? '✅' : ''}`, 'dermatit').row()
        .text('Нет особенностей', 'none').row()
        .text('Перейти к анализу 👉', 'stop')
        
    return skinFeaturesKeyboard
}

export const retinoidsKeyboard = new InlineKeyboard()
    .text('Да✅', 'retinoidsYes').row()
    .text('Нет🚫', 'retinoidsNo').row()