import { User } from "./UserSchema.js";
import { addDays, addMonths } from 'date-fns'

export const successfulPayment = async (ctx) => {
    await ctx.reply('Вы приобрели подписку!')
    const payment = ctx.message.successful_payment;
    const amount = payment.total_amount / 100;

    
    const now = new Date()

    let person;
    try {
        person = await User.findOne({telegramId: ctx.from.id})
    } catch (error) {
        console.log(error)
    }

    if (person.endDate && person.endDate > now) {
            switch (amount) {
                case (250):
                    const newEndDateMonth = addDays(person.endDate, 30)
                    try {
                        await User.updateOne({ telegramId: ctx.from.id}, {isSubscriber: true, endDate: newEndDateMonth});
                    } catch (error) {
                        console.log(error)
                        await ctx.reply('Произошла ошибка. Попробуйте еще раз!')
                    }
                    break;
                case (1100):
                    const newEndDateHalf = addMonths(person.endDate, 6)

                    try {
                        await User.updateOne({ telegramId: ctx.from.id}, {isSubscriber: true, endDate: newEndDateHalf});
                    } catch (error) {
                        console.log(error)
                        await ctx.reply('Произошла ошибка. Попробуйте еще раз!')
                    }
                    break;
                case (2000):
                    const newEndDateYear = addMonths(person.endDate, 12)
                    try {
                        await User.updateOne({ telegramId: ctx.from.id}, {isSubscriber: true, endDate: newEndDateYear});
                    } catch (error) {
                        console.log(error)
                        await ctx.reply('Произошла ошибка. Попробуйте еще раз!')
                    }
                    break;
                default:
                    console.error('Пиздос')
    }
    } else {
        switch (amount) {
            case (250):
                const newEndDateMonth = addDays(now, 30)
                try {
                    await User.updateOne({ telegramId: ctx.from.id}, {isSubscriber: true, endDate: newEndDateMonth});
                } catch (error) {
                    console.log(error)
                    await ctx.reply('Произошла ошибка. Попробуйте еще раз!')
                }
                break;
            case (1100):
                const newEndDateHalf = addMonths(now, 6)

                try {
                    await User.updateOne({ telegramId: ctx.from.id}, {isSubscriber: true, endDate: newEndDateHalf});
                } catch (error) {
                    console.log(error)
                    await ctx.reply('Произошла ошибка. Попробуйте еще раз!')
                }
                break;
            case (2000):
                const newEndDateYear = addMonths(now, 12)
                try {
                    await User.updateOne({ telegramId: ctx.from.id}, {isSubscriber: true, endDate: newEndDateYear});
                } catch (error) {
                    console.log(error)
                    await ctx.reply('Произошла ошибка. Попробуйте еще раз!')
                }
                break;
            default:
                console.error('Пиздос')
    }
    }
 
        
    console.log('Оплата получена:', {
            userId: ctx.from.id,
            amount: payment.total_amount / 100,
            currency: payment.currency,
            payload: payment.invoice_payload,
    });
}