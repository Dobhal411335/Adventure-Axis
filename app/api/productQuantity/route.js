import connectDB from "@/lib/connectDB";
import Quantity from '@/models/Quantity';
import Product from '@/models/Product';
// GET: List all product quantity records or by productId
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  // Accept both 'product' and 'productId' for compatibility
  const productId = searchParams.get('product') || searchParams.get('productId');
  let result;
  if (productId) {
    result = await Quantity.findOne({ product: productId });
    return Response.json(result || {});
  } else {
    const quantities = await Quantity.find({});
    return Response.json(quantities);
  }
}

// POST: Upsert (create or update) product quantity by productId
export async function POST(req) {
  await connectDB();
  const body = await req.json();
  if (!body.product || !Array.isArray(body.variants)) {
    return Response.json({ error: 'Missing product or variants' }, { status: 400 });
  }
  // Validate variants
  for (const v of body.variants) {
    if (!v.size || !v.color || typeof v.qty !== 'number' || typeof v.price !== 'number' || typeof v.weight !== 'number') {
      return Response.json({ error: 'Each variant must have size, color, qty, price, weight' }, { status: 400 });
    }
  }
  // Upsert by product
  const updated = await Quantity.findOneAndUpdate(
    { product: body.product },
    { $set: { variants: body.variants } },
    { new: true, upsert: true }
  );

  // Also update Product document: only set the quantity field to the Quantity _id
await Product.findByIdAndUpdate(body.product, { quantity: updated._id });
  return Response.json(updated, { status: 201 });
}

// PUT: Update a product quality record by id
export async function PUT(req) {
  await connectDB();
  const { _id, ...rest } = await req.json();
  const updated = await Quantity.findByIdAndUpdate(_id, rest, { new: true });
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
  // Also update Product document: only set the quantity field to the Quantity _id
  if (rest.product) {
    const quantity = await Quantity.findOneAndUpdate(
      { product: rest.product },
      { quantity: updated._id },
      { new: true }
    );
    return Response.json({quantity});
  }
}

// DELETE: Remove a product quality record by id (expects ?id=...)
export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const productId = searchParams.get('productId');
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
  await Quantity.findByIdAndDelete(id);
      await Product.findByIdAndUpdate(productId, { quantity: null });
  return Response.json({ success: true });
}
