const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.post("/scan", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
          { type: "text", text: "You are reading a valet parking ticket. Extract all visible information.\n\nReturn ONLY this JSON object with no other text or markdown:\n{\"ticketNumber\":\"\",\"guestName\":\"\",\"make\":\"\",\"model\":\"\",\"color\":\"\",\"licensePlate\":\"\",\"location\":\"\",\"notes\":\"\"}\n\n- ticketNumber: pre-printed number\n- guestName: handwritten name\n- make: car brand with slash/mark through checkbox\n- model: handwritten model\n- color: color with slash/mark through checkbox\n- licensePlate: handwritten plate UPPERCASE\n- location: location field if present\n- notes: any other info\n- Use empty string for blank fields" }
        ]}]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    const text = data.content?.[0]?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(400).json({ error: "No data returned" });
    res.json(JSON.parse(match[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/", (req, res) => res.send("Valet Scanner API running"));
app.listen(process.env.PORT || 3001, () => console.log("Server running"));
