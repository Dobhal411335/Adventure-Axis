import { Schema, models, model } from "mongoose";

const HeroBannerSchema = new Schema({
    title: { type: String },
    price: { type: String },
    coupon: { type: String },
    couponAmount: { type: Number, default: null },
    couponPercent: { type: Number, default: null },
    addtoCartLink: { type: String },
    viewDetailLink: { type: String },
    subtitle: { type: String },
    subDescription: { type: String },
    frontImg: { url: { type: String }, key: { type: String } },
    backImg: { url: { type: String }, key: { type: String } },
    order: { type: Number, required: true },
}, { timestamps: true });

export default models.HeroBanner || model("HeroBanner", HeroBannerSchema);