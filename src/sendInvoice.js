import 'dotenv/config'

const monthly = {
    title: 'Премиум подписка',
    description: 'Доступ к функциям на 1 месяц',
    currency: 'RUB',
    value: '250'
}
const halfyearly = {
    title: 'Премиум подписка',
    description: 'Доступ к функциям на 6 месяцев',
    currency: 'RUB',
    value: '1100'
}
const yearly = {
    title: 'Премиум подписка',
    description: 'Доступ к функциям на 12 месяц',
    currency: 'RUB',
    value: '2000'
}


// Месячный инвойс------------------------------
export const monthlyPayment = async (ctx) => {
    const providerInvoiceData = {
        receipt : {
            items: [
                {
                    description: monthly.description,
                    quantity: 1,
                    amount: {
                        value: `${monthly.value}.00`,
                        currency: monthly.currency
                    },
                    vat_code: 1,
                }
            ]
        }
    }

    try {
        await ctx.api.sendInvoice(
            ctx.chat.id,
            monthly.title,
            monthly.description,
            `premium1_${ctx.from.id}_${Date.now()}`, // Уникальный идентификатор
            monthly.currency,
            [{ label: 'Премиум подписка 1 месяц', amount: monthly.value * 100 }], // 250 рублей (в копейках)
            {
                provider_token: process.env.PAYMENT_TOKEN,
                need_email: true,
                send_email_to_provider: true,
                provider_data: JSON.stringify(providerInvoiceData)
            }
        );
    } catch (error) {
        console.error('Ошибка при создании счета:', error);
        await ctx.reply('Произошла ошибка при создании счета');
    }
}


// Полугодовой инвойс------------------------------
export const halfYearlyPayment = async (ctx) => {
    const providerInvoiceData = {
        receipt : {
            items: [
                {
                    description: halfyearly.description,
                    quantity: 1,
                    amount: {
                        value: `${halfyearly.value}.00`,
                        currency: halfyearly.currency
                    },
                    vat_code: 1,
                }
            ]
        }
    }

    try {
        await ctx.api.sendInvoice(
            ctx.chat.id,
            halfyearly.title,
            halfyearly.description,
            `premium6_${ctx.from.id}_${Date.now()}`, // Уникальный идентификатор
            halfyearly.currency,
            [{ label: 'Премиум подписка 6 месяцев', amount: halfyearly.value * 100 }], // 250 рублей (в копейках)
            {
                provider_token: process.env.PAYMENT_TOKEN,
                need_email: true,
                send_email_to_provider: true,
                provider_data: JSON.stringify(providerInvoiceData)
            }
        );
    } catch (error) {
        console.error('Ошибка при создании счета:', error);
        await ctx.reply('Произошла ошибка при создании счета');
    }
}

// Годовой инвойс------------------------------
export const yearlyPayment = async (ctx) => {
    const providerInvoiceData = {
        receipt : {
            items: [
                {
                    description: yearly.description,
                    quantity: 1,
                    amount: {
                        value: `${yearly.value}.00`,
                        currency: yearly.currency
                    },
                    vat_code: 1,
                }
            ]
        }
    }

    try {
        await ctx.api.sendInvoice(
            ctx.chat.id,
            yearly.title,
            yearly.description,
            `premium12_${ctx.from.id}_${Date.now()}`, // Уникальный идентификатор
            yearly.currency,
            [{ label: 'Премиум подписка 12 месяцев', amount: yearly.value * 100 }], // 250 рублей (в копейках)
            {
                provider_token: process.env.PAYMENT_TOKEN,
                need_email: true,
                send_email_to_provider: true,
                provider_data: JSON.stringify(providerInvoiceData)
            }
        );
    } catch (error) {
        console.error('Ошибка при создании счета:', error);
        await ctx.reply('Произошла ошибка при создании счета');
    }
}
