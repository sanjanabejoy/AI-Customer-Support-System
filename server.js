const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
global.WebSocket = WebSocket;
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);
const app = express();

app.use(cors());
app.use(express.json());

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
}
function classifyRequest(message) {
  const text = message.toLowerCase();

  if (text.includes("payment")) {
    return {
      category: "Billing",
      priority: "High",
      summary: "Customer payment issue",
      confidence: 0.95,
      reason: "Contains payment related keywords",
    };
  }

  if (text.includes("login")) {
    return {
      category: "Authentication",
      priority: "Medium",
      summary: "Customer login issue",
      confidence: 0.9,
      reason: "Contains login related keywords",
    };
  }

  return {
    category: "General",
    priority: "Low",
    summary: "General customer request",
    confidence: 0.7,
    reason: "No specific keywords detected",
  };
}
app.get("/", (req, res) => {
  res.send("Backend Running");
});
app.get("/requests", async (req, res) => {
  const { data, error } = await supabase.from("customer_requests").select("*");

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});
app.patch(
  "/requests/:id/status",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    const requestId = req.params.id;
    const { status } = req.body;

    const { data, error } = await supabase
      .from("customer_requests")
      .update({ status })
      .eq("id", requestId)
      .select();

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data);
  },
);
const PORT = 5000;
app.post("/requests", async (req, res) => {
  const { customer_name, customer_email, message } = req.body;

  const { data, error } = await supabase
    .from("customer_requests")
    .insert([
      {
        customer_name,
        customer_email,
        message,
      },
    ])
    .select();

  if (error) {
    return res.status(500).json(error);
  }
  const requestId = data[0].id;

  // Queue AI processing in background
  setTimeout(async () => {
    const aiResult = classifyRequest(message);

    await supabase.from("ai_classifications").insert([
      {
        request_id: requestId,
        category: aiResult.category,
        priority: aiResult.priority,
        summary: aiResult.summary,
        confidence: aiResult.confidence,
        reason: aiResult.reason,
      },
    ]);

    console.log(`AI processed request ${requestId}`);
  }, 3000);

  // Return immediately
  res.status(201).json({
    message: "Request queued for AI processing",
    request: data[0],
  });
});

app.post("/requests/:id/notes", authMiddleware, adminOnly, async (req, res) => {
  const requestId = req.params.id;
  const { author, note } = req.body;

  const { data, error } = await supabase
    .from("internal_notes")
    .insert([
      {
        request_id: requestId,
        author,
        note,
      },
    ])
    .select();

  if (error) {
    return res.status(500).json(error);
  }

  res.status(201).json(data);
});
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password_hash: passwordHash,
        role: "admin",
      },
    ])
    .select();

  if (error) {
    return res.status(500).json(error);
  }

  res.status(201).json({
    message: "User registered successfully",
  });
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  res.json({
    token,
  });
});
app.get("/classifications", async (req, res) => {
  const { data, error } = await supabase
    .from("ai_classifications")
    .select("*");

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
