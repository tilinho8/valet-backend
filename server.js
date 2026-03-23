{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require("express");\
const cors = require("cors");\
\
const app = express();\
app.use(cors());\
app.use(express.json(\{ limit: "20mb" \}));\
\
app.post("/scan", async (req, res) => \{\
  try \{\
    const \{ imageBase64, mimeType \} = req.body;\
\
    const response = await fetch("https://api.anthropic.com/v1/messages", \{\
      method: "POST",\
      headers: \{\
        "Content-Type": "application/json",\
        "x-api-key": process.env.ANTHROPIC_API_KEY,\
        "anthropic-version": "2023-06-01"\
      \},\
      body: JSON.stringify(\{\
        model: "claude-sonnet-4-20250514",\
        max_tokens: 1024,\
        messages: [\{\
          role: "user",\
          content: [\
            \{ type: "image", source: \{ type: "base64", media_type: mimeType, data: imageBase64 \} \},\
            \{ type: "text", text: `You are reading a valet parking ticket. Extract all visible information.\
\
Return ONLY this JSON object with no other text or markdown:\
\{"ticketNumber":"","guestName":"","make":"","model":"","color":"","licensePlate":"","location":"","notes":""\}\
\
- ticketNumber: pre-printed number on ticket\
- guestName: handwritten name field\
- make: car brand with a slash/mark through its checkbox\
- model: handwritten model field\
- color: color with a slash/mark through its checkbox\
- licensePlate: handwritten plate (UPPERCASE)\
- location: location field if present\
- notes: any other info\
- Empty string "" for blank/unreadable fields` \}\
          ]\
        \}]\
      \})\
    \});\
\
    const data = await response.json();\
    if (data.error) return res.status(400).json(\{ error: data.error.message \});\
\
    const text = data.content?.[0]?.text || "";\
    const match = text.match(/\\\{[\\s\\S]*\\\}/);\
    if (!match) return res.status(400).json(\{ error: "No data returned" \});\
\
    res.json(JSON.parse(match[0]));\
  \} catch (e) \{\
    res.status(500).json(\{ error: e.message \});\
  \}\
\});\
\
app.get("/", (req, res) => res.send("Valet Scanner API running"));\
\
app.listen(process.env.PORT || 3001, () => console.log("Server running"));}