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

    setFileName(file.name);
    setLoading(true);

    try {
      // Step 1: Extract content using GoogleGenAI
      const fileData = await file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileData)));

      const ai = new GoogleGenAI({
        apiKey: "AIzaSyDBnfjAHRKYzeTOq-wETbJ4hkXNPdwLAns",
      });

      const contents = [
        {
          text: `Extract the following details from the document in a structured JSON format. Ensure all fields are included, even if they are empty:

{
  "contact": {
    "fullName": "",
    "phoneNumber": "",
    "email": "",
    "linkedIn": "",
    "github": "",
    "portfolio": ""
  },
  "summary": "",
  "workExperience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "achievements": ["", "", ""]
    }
  ],
  "skills": ["", "", ""],
  "education": [
    {
      "degree": "",
      "institution": "",
      "location": "",
      "startDate": "",
      "endDate": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "organization": "",
      "year": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "achievements": ["", ""]
    }
  ],
  "additionalInfo": {
    "languages": ["", ""],
    "volunteerExperience": "",
    "publications": ""
  }
}
`,
        },
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

      // Debugging: Log the raw response
      console.log("Raw Response:", response);

      // Step 2: Validate and sanitize the response
      let extractedContent;
      try {
        // Check if the response contains valid JSON
        const rawText = response.text || "";
        console.log("Raw Text:", rawText);

        // Remove any non-JSON content (e.g., backticks, markdown)
        const sanitizedText = rawText.trim().replace(/```json|```/g, "");
        console.log("Sanitized Text:", sanitizedText);

        // Parse the sanitized JSON
        extractedContent = JSON.parse(sanitizedText);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Invalid JSON response from the AI model.");
      }

      // Debugging: Log the extracted content
      console.log("Extracted Content:", extractedContent);

      // Step 3: Format the extracted content into the resume template
      const formatResponse = await fetch("/api/formatResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedContent }),
      });

      if (!formatResponse.ok) {
        throw new Error("Failed to format resume");
      }

      const { formattedResume } = await formatResponse.json();

      // Step 4: Update the state with the formatted resume
      setResponseText(formattedResume);
    } catch (error) {
      console.error("Error processing the file:", error);
      setResponseText("An error occurred while processing the file.");
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
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {responseText || "Upload a file to get started."}
        </pre>
      )}
    </div>
  );
};

export default Page;
