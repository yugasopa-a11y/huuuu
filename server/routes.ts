import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import multer from "multer";
import { Resend } from 'resend';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.stl', '.obj', '.3mf'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only STL, OBJ, and 3MF files are allowed.'));
    }
  }
});

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Mock 3D model analysis function
function analyze3DModel(file: Express.Multer.File) {
  // More realistic estimation algorithm based on typical 3D prints
  const fileSizeMB = file.size / (1024 * 1024);

  // Estimate weight: Most STL files are 1-10MB for small-medium objects (10-100g)
  // Typical ratio: ~1MB file ≈ 15-25 grams for normal density objects
  let estimatedWeight;
  if (fileSizeMB < 1) {
    estimatedWeight = Math.max(5, fileSizeMB * 20); // Small objects
  } else if (fileSizeMB < 5) {
    estimatedWeight = 20 + (fileSizeMB - 1) * 15; // Medium objects
  } else {
    estimatedWeight = 80 + (fileSizeMB - 5) * 10; // Large objects
  }

  // Print time estimation based on Ender 3 S1 Pro capabilities
  // Typical speeds: 50-80mm/s, layer height 0.2mm
  // Rough estimate: 1-3 hours per 10-20 grams of material
  const printTimeMinutes = Math.max(30, estimatedWeight * 1.5 + (fileSizeMB * 20));

  return {
    weight: parseFloat(estimatedWeight.toFixed(2)),
    printTime: formatPrintTime(printTimeMinutes),
    baseCost: parseFloat((estimatedWeight * 0.25).toFixed(2)),
  };
}

function formatPrintTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new order
  app.post("/api/orders", upload.single('modelFile'), async (req, res) => {
    try {
      const orderData = req.body;
      const modelFile = req.file;

      console.log('Full received order data:', orderData);

      // Validate the order data
      const validatedOrder = insertOrderSchema.parse({
        ...orderData,
        supportRemoval: orderData.supportRemoval === 'true',
      });

      // Use provided analysis data if available, otherwise analyze the file
      if (modelFile) {
        validatedOrder.modelFileName = modelFile.originalname;

        // Debug log to check received data
        console.log('Received order data:', {
          modelWeight: orderData.modelWeight,
          printTime: orderData.printTime,
          baseCost: orderData.baseCost,
          totalCost: orderData.totalCost,
          supportCost: orderData.supportCost
        });

        // If analysis data was provided from frontend, use it
        if (orderData.modelWeight && orderData.printTime && orderData.baseCost) {
          console.log('Using frontend analysis data');
          validatedOrder.modelWeight = orderData.modelWeight;
          validatedOrder.printTime = orderData.printTime;
          validatedOrder.baseCost = orderData.baseCost;
          validatedOrder.supportCost = orderData.supportCost || (validatedOrder.supportRemoval ? "5.00" : "0.00");
          validatedOrder.totalCost = orderData.totalCost;
        } else {
          // Fallback to backend analysis if no frontend data
          console.log('Using backend analysis fallback');
          const analysis = analyze3DModel(modelFile);
          validatedOrder.modelWeight = analysis.weight.toString();
          validatedOrder.printTime = analysis.printTime;
          validatedOrder.baseCost = analysis.baseCost.toString();

          const baseCost = analysis.baseCost;
          const supportCost = validatedOrder.supportRemoval ? 5.00 : 0.00;
          const totalCost = baseCost + supportCost;

          validatedOrder.supportCost = supportCost.toString();
          validatedOrder.totalCost = totalCost.toString();
        }
      }

      // Create the order
      const order = await storage.createOrder(validatedOrder);

      // Send email notification
      try {
        await sendOrderEmail(order, modelFile);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue with order creation even if email fails
      }

      res.json(order);
    } catch (error: any) {
      console.error('Order creation error:', error);
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analyze 3D model file
  app.post("/api/analyze-model", upload.single('modelFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const analysis = analyze3DModel(req.file);
      res.json(analysis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function sendOrderEmail(order: any, modelFile?: Express.Multer.File) {
  const emailContent = `
    New 3D Printing Order Received

    Order ID: ${order.id}
    Customer: ${order.customerName}
    Phone: ${order.customerPhone}

    Delivery Method: ${order.deliveryMethod}
    ${order.deliveryMethod === 'delivery' ? `
    Address: ${order.streetAddress}
    City: ${order.city}, ${order.state} ${order.zipCode}
    ` : 'Meetup location - customer will be contacted'}

    Model Details:
    File: ${order.modelFileName || 'Not provided'}
    Weight: ${order.modelWeight}g
    Print Time: ${order.printTime}

    Pricing:
    Base Cost: $${order.baseCost}
    Support Removal: ${order.supportRemoval ? 'Yes (+$5.00)' : 'No'}
    Total Cost: $${order.totalCost}

    Order Date: ${new Date(order.createdAt).toLocaleString()}
  `;

  const emailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@example.com', // Use a default or environment variable for 'from'
    to: 'pointzero3dofficial@gmail.com',
    subject: `New 3D Printing Order - ${order.customerName}`,
    html: `<pre>${emailContent}</pre>`, // Use html with pre tag for formatting
    attachments: modelFile ? [{
      filename: modelFile.originalname,
      content: require('fs').readFileSync(modelFile.path), // Read file content for attachment
      contentType: require('mime').lookup(modelFile.path) // Determine content type
    }] : [],
  };

  await resend.emails.send(emailOptions);
}