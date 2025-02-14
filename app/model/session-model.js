import mongoose from "mongoose";
const shopSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  id: String,
  
  shop: String,
  state: String,
  isOnline: Boolean,
  scope: String,
  accessToken: String,
});

export const sessionModel = mongoose.models.shopify_sessions || mongoose.model("shopify_sessions", shopSchema);
