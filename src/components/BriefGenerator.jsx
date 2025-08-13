"use client";
import { useState } from "react";

export default function BriefGenerator() {
  const [input, setInput] = useState("");
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError("");
    setBrief("");

    try {
      const res = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setBrief(data.brief);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brief-generator">
      <div className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décris ton projet ici... Sois le plus détaillé possible pour un brief optimal."
          rows={6}
          className="brief-textarea"
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading || !input.trim()}
          className="generate-btn"
        >
          {loading ? "Génération..." : "Générer le brief"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {brief && (
        <div className="brief-result">
          <h3>Brief généré :</h3>
          <div className="brief-content">
            {brief}
          </div>
        </div>
      )}
    </div>
  );
} 