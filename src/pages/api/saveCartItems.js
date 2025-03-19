import dbConnect from '../../app/lib/dbconnect';  // Function to connect to MongoDB
import Cart from '../../models/Cart';
import Item from '../../models/item';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { cartItems, userId } = req.body;

      // Save items to the database
      const savedItems = await Promise.all(cartItems.map(async (item) => {
        const existingItem = await Item.findById(item._id);
        if (!existingItem) {
          const newItem = new Item({
            name: item.name,
            price: item.price,
            imgsrc: item.imgsrc,
          });
          await newItem.save();
          return newItem._id;
        }
        return existingItem._id;
      }));

      // Save cart with references to saved items
      const cart = new Cart({
        userId,
        items: savedItems.map((id, index) => ({
          itemId: id,
          quantity: cartItems[index].count,
        })),
        totalAmount: cartItems.reduce((total, item) => total + item.price * item.count, 0),
      });

      await cart.save();

      res.status(200).json({ message: 'Cart saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save cart' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
