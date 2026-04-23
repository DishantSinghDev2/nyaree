import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import { sendAbandonedCart } from "@/lib/email/resend";

// You can securely trigger this endpoint via a CRON job.
// E.g., Cloudflare Cron Triggers or cron-job.org pointing to:
// GET https://yourdomain.com/api/cron/abandoned-carts
// Header: Authorization: Bearer <YOUR_CRON_SECRET>

export async function GET(req: NextRequest) {
  try {
    // 1. Secure the endpoint using a secret token
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 2. Find pending orders between 1 and 24 hours old that haven't received an email yet
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const abandonedOrders = await OrderModel.find({
      status: "pending",
      createdAt: { $gte: twentyFourHoursAgo, $lte: oneHourAgo },
      abandonedEmailSent: { $ne: true }
    }).populate("userId");

    if (!abandonedOrders.length) {
      return NextResponse.json({ success: true, message: "No abandoned carts found." });
    }

    let emailsSent = 0;

    // 3. Process each abandoned order
    for (const order of abandonedOrders) {
      // Determine the email and name to use
      const email = order.guestEmail || (order.userId && order.userId.email);
      const name = order.shippingAddress?.fullName || (order.userId && order.userId.name) || "Valued Customer";

      if (!email) {
        // Skip if no email is attached to the order
        continue;
      }

      // Extract cart items
      const cartItems = order.items.map((item: any) => ({
        name: item.name,
        image: item.image,
        price: item.price,
      }));

      // Optional: Give them a discount code
      const couponCode = "COMEBACK10"; // Hardcoded for now or fetch from a config if needed

      try {
        // 4. Send the abandoned cart email
        await sendAbandonedCart(email, name, cartItems, couponCode);

        // 5. Update the order to mark the email as sent
        order.abandonedEmailSent = true;
        await order.save();

        emailsSent++;
      } catch (emailErr) {
        console.error(`Failed to send abandoned cart email for order ${order._id}:`, emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Abandoned cart emails sent: ${emailsSent}`,
    });

  } catch (error) {
    console.error("Error in abandoned carts cron:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
