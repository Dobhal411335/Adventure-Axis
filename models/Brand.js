import { Schema, models, model } from "mongoose";

const BrandSchema = new Schema({
    buttonLink: { type: String },
    frontImg: { url: { type: String }, key: { type: String } },
    order: { type: Number, required: true },
}, { timestamps: true });

export default models.Brand || model("Brand", BrandSchema);