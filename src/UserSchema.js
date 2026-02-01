import mongoose from 'mongoose'

export const userSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, unique: true },
    firstName: String,
    username: String,
    isSubscriber: { type: Boolean, required: true},
    endDate: Date
}, {timestamps: true})
export const User = mongoose.model('User', userSchema);