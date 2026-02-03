
export async function sendSplitMessages(ctx, text, delay = 300) {
    const parts = splitMessage(text)
    
    for (let i = 0; i < parts.length; i++) {
        await ctx.reply(`${parts[i]}${i < parts.length - 1 ? '\n\n⏳ *Загружаю продолжение...*' : ''}`, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        })
        
        if (i < parts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delay))
            await ctx.api.sendChatAction(ctx.chat.id, 'typing')
        }
    }
}

// Функция для разбивки длинных сообщений
export function splitMessage(text, maxLength = 4096) {
    if (text.length <= maxLength) return [text]
    
    const parts = []
    let currentPart = ''
    const lines = text.split('\n')
    
    for (const line of lines) {
        if ((currentPart + line + '\n').length <= maxLength) {
            currentPart += line + '\n'
        } else {
            if (currentPart.length > 0) {
                parts.push(currentPart.trim())
                currentPart = ''
            }
            
            // Если отдельная строка слишком длинная
            if (line.length > maxLength) {
                for (let i = 0; i < line.length; i += maxLength) {
                    parts.push(line.substring(i, i + maxLength))
                }
            } else {
                currentPart = line + '\n'
            }
        }
    }
    
    if (currentPart.length > 0) {
        parts.push(currentPart.trim())
    }
    
    return parts
}


// Вспомогательные функции
export function getSkinTypeName(type) {
    const types = {
        'dry': 'Сухая',
        'oily': 'Жирная',
        'combo': 'Комбинированная',
    }
    return types[type] || 'Не указан'
}

export function getFeaturesName(feature) {
    const features = {
        'acne': 'Акне/прыщи',
        'rosacea': 'Розацеа',
        'allergies': 'Аллергии',
        'couperose': 'Купероз',
        'hypersensitivity': 'Повышенная чувствительность',
        'none': 'Нет особенностей'
    }
    return features[feature] || 'Не указаны'
}

export function isLikelyIngredientList(text) {
    if (text.length < 20) return false
    
    const hasLatinChars = /[a-zA-Z]/.test(text)
    const hasIngredients = /(aqua|water|glycerin|alcohol|acid|oil|extract|parfum|perfume|fragrance)/i.test(text)
    const hasStructure = /[,;\n]/.test(text)
    
    return hasLatinChars && (hasIngredients || hasStructure || text.length > 100)
}

