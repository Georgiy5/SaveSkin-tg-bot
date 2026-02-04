import 'dotenv/config'
import { Bot, Keyboard, InlineKeyboard, session, MemorySessionStorage } from 'grammy'
import { hydrate } from '@grammyjs/hydrate'
import { askDeepSeek } from './src/deepseek.js'
import { sendSplitMessages, splitMessage, getFeaturesName, getSkinTypeName, isLikelyIngredientList } from './src/functions.js'
import { skinTypeKeyboard, getSkinFeaturesKeyboard, subcsriptionsPlan, welcomeKeyboard, welcomeSubscriptionsPlan} from './src/keyboards.js'
import mongoose from 'mongoose'
import { welcomeText, notWelcomeText } from './src/text.js'
import { monthlyPayment, halfYearlyPayment, yearlyPayment } from './src/sendInvoice.js'
import { successfulPayment } from './src/successfulPayment.js'
import { User } from './src/UserSchema.js'
import { addDays } from 'date-fns'


const bot = new Bot(process.env.BOT_API_KEY)

bot.on('pre_checkout_query', async (ctx) => {
    await ctx.answerPreCheckoutQuery(true);
});

bot.on(':successful_payment', successfulPayment);

bot.use(async (ctx, next) => {
    // Пропускаем проверку для команд start, help, buy
    if (ctx.message?.text?.startsWith('/start') || 
        ctx.message?.text?.startsWith('/profile')) {
        return next();
    }

    if (ctx.callbackQuery) {
        const allowedCallbacks = ['month', 'halfYear', 'Year', 'fullSubscription', 'trial', 'back']
        if (allowedCallbacks.includes(ctx.callbackQuery.data)) {
            return next()
        }
    }
    
    await checkSubscription(ctx, next);
});

// Настройка сессий для хранения данных пользователя
bot.use(session({
    initial: () => ({
        skinType: null,
        skinFeatures: [],
    }),
    storage: new MemorySessionStorage()
}))

bot.use(hydrate())



// Настройка команд бота
bot.api.setMyCommands([
    { command: 'start', description: 'Запустить бота' },
    { command: 'type', description: 'Указать тип кожи' },
    { command: 'features', description: 'Указать особенности кожи' },
    { command: 'check', description: 'Проверить состав средства' },
    { command: 'profile', description: 'Профиль' },
])



// Обработчик команды /start
bot.command('start', async (ctx) => {
    try {
        const now = new Date()
        const recognizeUser = await User.findOne({telegramId: ctx.from.id})
        if (!recognizeUser) {
            await User.create({
            telegramId: ctx.from.id,
            firstName: ctx.from.first_name,
            username: ctx.from.username,
            isSubscriber: false,
            usedTrial: false,
            })
    }} catch (error) {
        console.log(error)
        await ctx.reply('Произошла ошибка. Попробуй еще раз!')
    }



    try {
        const person = await User.findOne({telegramId: ctx.from.id});

        if (person.isSubscriber === false || person.isSubscriber === undefined) {
            await ctx.reply(notWelcomeText, {
                parse_mode: 'Markdown',
                reply_markup: welcomeKeyboard
            })
            return;
        }
    } catch (error) {
        console.log(error)
        await ctx.reply('Произошла ошибка. Попробуй еще раз!')
    }
    
    await ctx.reply(welcomeText, {
        parse_mode: 'Markdown',
        reply_markup: skinTypeKeyboard
    })
})

// Обработчик команды /type
bot.command('type', async (ctx) => {
        await ctx.reply('👤 Выберите ваш тип кожи:', {
        reply_markup: skinTypeKeyboard
})})


// Обработчик команды /features
bot.command('features', async (ctx) => {
    // const skinFeaturesKeyboard = new InlineKeyboard()
    // .text(`Акне/прыщи${ctx.session.skinFeatures.includes('acne') ? '✅' : ''}`, 'acne').row()
    // .text(`Розацеа${ctx.session.skinFeatures.includes('rosacea') ? '✅' : ''}`, 'rosacea').row()
    // .text(`Аллергии${ctx.session.skinFeatures.includes('allergies') ? '✅' : ''}`, 'allergies').row()
    // .text(`Купероз${ctx.session.skinFeatures.includes('couperose') ? '✅' : ''}`, 'couperose').row()
    // .text(`Повышенная чувствительность${ctx.session.skinFeatures.includes('hypersensitivity') ? '✅' : ''}`, 'hypersensitivity').row()
    // .text(`Дерматит${ctx.session.skinFeatures.includes('dermatit') ? '✅' : ''}`, 'dermatit').row()
    // .text('Нет особенностей', 'none').row()
    // .text('Перейти к анализу 👉', 'stop')

    await ctx.reply('📝 Есть ли у вас особенности кожи?', {
        reply_markup: getSkinFeaturesKeyboard(ctx)
    })
})

// Обработчик команды /check
bot.command('check', async (ctx) => {
    if (!ctx.session.skinType) {
        await ctx.reply('⚠️ Сначала укажите ваш тип кожи командой /type')
        return
    }

    const skinTypeName = getSkinTypeName(ctx.session.skinType)
    const features = ctx.session.skinFeatures ? getFeaturesName(ctx.session.skinFeatures) : 'нет особенностей'

        const checkText = `✅ *Ваши настройки:*
👤 Тип кожи: ${skinTypeName}
📝 Особенности: ${features}

🔍 *Отправьте мне состав косметического средства.*

📋 *Формат (INCI):*
Aqua, Glycerin, Niacinamide, Salicylic Acid, Zinc PCA

💡 *Совет:* Можно скопировать состав с упаковки или сайта производителя.`
    
    await ctx.reply(checkText, {
        parse_mode: 'Markdown'
    })
})

// Обработчик команды /profile
bot.command('profile', async (ctx) => {
    try {
        const person = await User.findOne({telegramId: ctx.from.id});
        const endDate = person.endDate
        const isSubscriber = person.isSubscriber

        let date;
        if (isSubscriber === true && endDate) {
            date = new Date(person.endDate).toLocaleDateString('ru-RU')
        } else {
            date = 'Нет активной подписки'
        }
        let subscribeStatus
        if (isSubscriber === false || isSubscriber === undefined) {
            subscribeStatus = 'Неактивна'
        } else {
            subscribeStatus = 'Активна'
        }

        const profileText = `
👤 **Ваш профиль**

📛 **Имя:** ${person.firstName || 'Не указано'}
🔖 **Логин:** ${person.username ? '@' + person.username : 'Не указан'}
🎫 **Статус подписки:** ${subscribeStatus}
📅 **Подписка до:** ${date}
🆔 **Ваш ID:** ${person.telegramId}
        `.trim()

        await ctx.reply(profileText, { parse_mode: 'Markdown', reply_markup: subcsriptionsPlan})
    } catch (error) {
        console.log(error)
        await ctx.reply('Произошла ошибка. Попробуй еще раз!')
    }

})


// Обработчики callback для типа кожи
bot.callbackQuery(['dry', 'oily', 'combo'], async (ctx) => {
    ctx.session.skinType = ctx.callbackQuery.data
    const typeName = getSkinTypeName(ctx.session.skinType)

    await ctx.answerCallbackQuery(`✅ Тип кожи: ${typeName}`)
    
    await ctx.editMessageText(`✅ *Тип кожи сохранен:* ${typeName}\n\nТеперь укажите особенности кожи (если есть):`, {
        parse_mode: 'Markdown',
        reply_markup: getSkinFeaturesKeyboard(ctx)
    })
})


// Обработчики callback для особенностей кожи
bot.callbackQuery(['acne', 'rosacea', 'allergies', 'couperose', 'hypersensitivity', 'dermatit'], async (ctx) => {
    if (ctx.session.skinFeatures.includes('none')) {
        ctx.session.skinFeatures = []
    }



    if (ctx.session.skinFeatures.includes(ctx.callbackQuery.data)) {
        ctx.answerCallbackQuery(`❌ Удалена особенность: ${getFeaturesName(ctx.callbackQuery.data)}`)
        const index = ctx.session.skinFeatures.indexOf(ctx.callbackQuery.data)
        ctx.session.skinFeatures.splice(index, 1)

        await ctx.editMessageText('📝 Есть ли у вас особенности кожи?', {
            reply_markup: getSkinFeaturesKeyboard(ctx)
        })
        return
    }


    ctx.session.skinFeatures.push(ctx.callbackQuery.data)
    const featuresText = getFeaturesName(ctx.callbackQuery.data)
    
    await ctx.answerCallbackQuery(`✅ Добавлена особенность: ${featuresText}`)
    await ctx.editMessageText('📝 Есть ли у вас особенности кожи?', {
        reply_markup: getSkinFeaturesKeyboard(ctx)
    })

})

bot.callbackQuery('none', async (ctx) => {
    ctx.session.skinFeatures = [ctx.callbackQuery.data]
            const configText = `⚙️ *Настройки сохранены:*
👤 Тип кожи: ${getSkinTypeName(ctx.session.skinType)}
📝 Особенности: ${getFeaturesName(ctx.callbackQuery.data)}

Теперь отправьте мне состав косметического средства для анализа!`
    
    await ctx.editMessageText(configText, {
        parse_mode: 'Markdown',
    })

})

bot.callbackQuery('stop', async (ctx) => {
        const features = ctx.session.skinFeatures.map(e => getFeaturesName(e)).join(', ')
        const configText = `⚙️ *Настройки сохранены:*
👤 Тип кожи: ${getSkinTypeName(ctx.session.skinType)}
📝 Особенности: ${features}

Теперь отправьте мне состав косметического средства для анализа!`
    
    await ctx.editMessageText(configText, {
        parse_mode: 'Markdown',
    })
})


bot.callbackQuery('month', monthlyPayment)
bot.callbackQuery('halfYear', halfYearlyPayment)
bot.callbackQuery('year', yearlyPayment)


// Обработчик текстовых сообщений (анализ состава)
bot.on('msg:text', async (ctx) => {
    const message = ctx.message.text.trim()
    
    // Пропускаем команды
    if (message.startsWith('/')) return
    
    // Проверяем тип кожи
    if (!ctx.session.skinType) {
        await ctx.reply('⚠️ Сначала укажите тип кожи командой /type')
        return
    }
    
    // Проверяем, похоже ли на состав
    if (!isLikelyIngredientList(message)) {
        const exampleText = `❌ Это не похоже на состав косметики.
        
📋 *Отправьте список ингредиентов в формате INCI:*

*Пример 1:*
Aqua, Glycerin, Niacinamide, Salicylic Acid, Zinc PCA

*Пример 2:*
Water, Cyclopentasiloxane, Dimethicone, Niacinamide, Cetyl PEG/PPG-10/1 Dimethicone

💡 *Где найти состав:*
• На упаковке средства
• На сайте производителя
• В приложениях для анализа косметики`
        
        await ctx.reply(exampleText, { parse_mode: 'Markdown' })
        return
    }
    
    // Показываем, что бот печатает
    await ctx.api.sendChatAction(ctx.chat.id, 'typing')
    
    try {
        // Готовим данные для анализа
        const skinTypeName = getSkinTypeName(ctx.session.skinType)
        const features = ctx.session.skinFeatures ? ctx.session.skinFeatures.map(e => getFeaturesName(e)).join(', ') : 'нет особенностей'
        
        // Уведомляем о начале анализа
        await ctx.reply('🔬 *Анализирую состав...*\nЭто может занять до 30 секунд.', {
            parse_mode: 'Markdown'
        })
        
        // Получаем анализ от DeepSeek
        const response = await askDeepSeek(skinTypeName, features, message)
        
        // Извлекаем вердикт из ответа для сохранения в историю
        const verdictMatch = response.match(/📌 ВЕРДИКТ: (.+?)(?:\n|$)/)
        const verdict = verdictMatch ? verdictMatch[1] : 'Не определен'
        
        // Отправляем разбитый ответ
        await sendSplitMessages(ctx, response, 500)
        
        // Добавляем кнопки после анализа
        const afterAnalysisKeyboard = new InlineKeyboard()
            .text('🔄 Новый анализ', 'new_check')
        
        await ctx.reply('✅ *Анализ завершен!*\n\nЧто дальше?', {
            parse_mode: 'Markdown',
            reply_markup: afterAnalysisKeyboard
        })
        
    } catch (error) {
        console.error('Ошибка при анализе:', error)
        
        let errorMessage = '❌ Произошла ошибка при анализе состава.\n\n'
        
        if (error.message.includes('timeout')) {
            errorMessage += '⏱️ Превышено время ожидания. Попробуйте позже.'
        } else if (error.message.includes('API')) {
            errorMessage += '🔧 Проблема с сервисом анализа. Попробуйте позже.'
        } else {
            errorMessage += 'Пожалуйста, попробуйте еще раз или проверьте формат состава.'
        }
        
        await ctx.reply(errorMessage)
    }
})


bot.callbackQuery('trial', async (ctx) => {
    ctx.answerCallbackQuery()
    try {
        const now = new Date()
        const person = await User.findOne({telegramId: ctx.from.id})
        if (person.usedTrial === true) {
            await ctx.reply('Вы уже использовали пробный период❌')
        } else {
            await User.updateOne({telegramId: ctx.from.id}, { usedTrial: true, endDate: addDays(now, 1), isSubscriber: true})
            await ctx.editMessageText('Ваш пробный период активирован✅')
        }
    } catch (error) {
        console.log(error)
        await ctx.reply('Произошла ошибка, попробуйте еще раз!')
    }
})

bot.callbackQuery('fullSubscription', async(ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.editMessageText(notWelcomeText, {
        parse_mode: 'Markdown',
        reply_markup: welcomeSubscriptionsPlan
    })
})

bot.callbackQuery('back', async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.editMessageText(notWelcomeText, {
        parse_mode: 'Markdown',
        reply_markup: welcomeKeyboard,
    })
})

bot.callbackQuery('new_check', async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply('📋 Отправьте новый состав для анализа.')
})

async function checkSubscription(ctx, next) {
    const userId = ctx.from.id;
    
    try {
        const user = await User.findOne({ telegramId: userId });
        
        if (!user || !user.isSubscriber || !user.endDate) {
            await ctx.reply('❌ Эта функция доступна только подписчикам!\n\nИспользуйте /start для приобретения подписки.');
            return;
        }
        
        // Проверяем, не истекла ли подписка
        const now = new Date();
        if (user.endDate < now) {
            await User.updateOne(
                { telegramId: userId },
                { isSubscriber: false }
            );
            await ctx.reply('❌ Ваша подписка истекла!\n\nИспользуйте /start для продления.');
            return;
        }
        
        await next(); // Продолжаем выполнение
        
    } catch (error) {
        console.error('Ошибка проверки подписки:', error);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
}

bot.catch((err) => {
    console.error('Ошибка в боте:', err)
})

// Запуск бота
async function startBot() {
    const MONGODB_URI=process.env.MONGODB_URI
    try {
        bot.start();
        mongoose.connect(MONGODB_URI);
        console.log('Бот и бд запущены');
    } catch (error) {
        console.log(error)
    }
}

startBot()
