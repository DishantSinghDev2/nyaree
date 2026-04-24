import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import { sendAbandonedCart } from "@/lib/email/resend";

export async function GET(req: NextRequest) {
  try {
    // 1. Secure the endpoint using a secret token
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    // Stage 1: 1 hour to 3 hours ago
    const stage1Start = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const stage1End = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    
    // Stage 2: 24 hours to 48 hours ago
    const stage2Start = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const stage2End = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find orders that fall in either time window
    const pendingOrders = await OrderModel.find({
      status: "pending",
      createdAt: { $gte: stage2Start, $lte: stage1End }
    }).populate("userId");

    if (!pendingOrders.length) {
      return NextResponse.json({ success: true, message: "No abandoned carts found." });
    }

    let emailsSent = 0;
    const emailedAddresses = new Set();

    // 3. Process each abandoned order
    for (const order of pendingOrders) {
      const email = order.guestEmail || (order.userId && order.userId.email);
      const name = order.shippingAddress?.fullName || (order.userId && order.userId.name) || "Valued Customer";

      // Skip if no email or if we already emailed this person in this cron run (prevents spam for multiple carts)
      if (!email || emailedAddresses.has(email)) continue;

      const createdAt = new Date(order.createdAt).getTime();
      const timeline = order.timeline || [];
      const hasStage1 = timeline.some((t: any) => t.status === "abandoned_stage_1");
      const hasStage2 = timeline.some((t: any) => t.status === "abandoned_stage_2");

      const isStage1 = (createdAt >= stage1Start.getTime() && createdAt <= stage1End.getTime()) && !hasStage1;
      const isStage2 = (createdAt >= stage2Start.getTime() && createdAt <= stage2End.getTime()) && hasStage1 && !hasStage2;

      if (!isStage1 && !isStage2) continue;

      // Anti-spam check: Did they place a SUCCESSFUL order in the last 7 days?
      // If yes, don't nag them about a pending cart.
      const successfulOrders = await OrderModel.countDocuments({
        $or: [{ guestEmail: email }, { userId: order.userId?._id || "000000000000000000000000" }],
        status: { $ne: "pending" },
        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      });

      if (successfulOrders > 0) continue;

      const cartItems = order.items.map((item: any) => ({
        name: item.name, image: item.image, price: item.price,
      }));

      // Stage 2 gets a slightly better coupon
      const couponCode = isStage2 ? "COMEBACK20" : "COMEBACK10";

      try {
        await sendAbandonedCart(email, name, cartItems, couponCode);

        // Update the order timeline to mark this stage as sent
        await OrderModel.findByIdAndUpdate(order._id, {
          $push: { 
            timeline: { 
              status: isStage1 ? "abandoned_stage_1" : "abandoned_stage_2", 
              timestamp: new Date(), 
              note: `Abandoned cart email stage ${isStage1 ? 1 : 2} sent.` 
            } 
          },
          $set: { abandonedEmailSent: true }
        });

        emailedAddresses.add(email);
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
