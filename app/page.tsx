"use client";

import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const Page: React.FC = () => {
  const [responseText, setResponseText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name); // Display the uploaded file name
    setLoading(true);

    try {
      const fileData = await file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileData)));

      const ai = new GoogleGenAI({
        apiKey: "AIzaSyDBnfjAHRKYzeTOq-wETbJ4hkXNPdwLAns",
      });

      const contents = [
        { text: "Give me all the contents of this document" },
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contents,
      });

      setResponseText(response.text || "");
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>AI Generated Summary</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="file-upload"
          style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Choose File
        </label>
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        {fileName && <p>Selected File: {fileName}</p>}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>{responseText || "Upload a file to get started."}</p>
      )}
    </div>
  );
};

export default Page;
