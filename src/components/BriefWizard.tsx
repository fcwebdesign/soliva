"use client";
import { useState } from "react";

interface Etape {
  id: string;
  question: string;
  type: string;
  suggestions?: string[];
  options?: string[];
  placeholder?: string;
  fields?: Array<{
    name: string;
    label: string;
    type: string;
  }>;
}

const ETAPES: Etape[] = [
  {
    id: "objectifs",
    question: "Quels sont vos objectifs principaux ?",
    type: "suggestions",
    suggestions: [
      "Augmenter la visibilité",
      "Générer des leads",
      "Vendre en ligne",
      "Moderniser l'image",
      "Améliorer l'UX",
      "Automatiser des processus",
      "Créer une communauté"
    ]
  },
  {
    id: "cible",
    question: "À qui s'adresse ce projet ?",
    type: "suggestions",
    suggestions: [
      "Grand public",
      "Professionnels B2B",
      "Collaborateurs internes",
      "Clients fidèles",
      "Nouveaux prospects",
      "Partenaires",
      "Investisseurs"
    ]
  },
  {
    id: "fonctionnalites",
    question: "Quelles fonctionnalités souhaitez-vous ?",
    type: "checkboxes",
    options: [
      "Site vitrine",
      "E-commerce",
      "Blog",
      "Espace client",
      "Prise de RDV",
      "Newsletter",
      "Chat en ligne",
      "Paiement en ligne",
      "Gestion des stocks",
      "Réseaux sociaux"
    ]
  },
  {
    id: "budget",
    question: "Quelle est votre fourchette de budget ?",
    type: "radio",
    options: [
      "Moins de 2 000 €",
      "2 000 – 5 000 €",
      "5 000 – 10 000 €",
      "Plus de 10 000 €",
      "Je ne sais pas encore"
    ]
  },
  {
    id: "delai",
    question: "Quand souhaitez-vous lancer le projet ?",
    type: "radio",
    options: [
      "Dès que possible",
      "1-3 mois",
      "3-6 mois",
      "Plus tard",
      "Date précise"
    ]
  },
  {
    id: "inspirations",
    question: "Inspirations ou exemples de sites qui vous plaisent ?",
    type: "text",
    placeholder: "Décrivez les sites qui vous inspirent ou partagez des liens..."
  },
  {
    id: "contraintes",
    question: "Autres infos/contraintes importantes ?",
    type: "text",
    placeholder: "Contraintes techniques, délais spécifiques, exigences particulières..."
  },
  {
    id: "contact",
    question: "Vos coordonnées",
    type: "contact",
    fields: [
      { name: "nom", label: "Nom complet", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "societe", label: "Société", type: "text" },
      { name: "telephone", label: "Téléphone (optionnel)", type: "tel" }
    ]
  }
];

interface Message {
  type: 'user' | 'ai';
  etape?: string;
  reponse?: string;
  message?: string;
}

export default function BriefWizard(): React.JSX.Element {
  const [etapeActuelle, setEtapeActuelle] = useState<number>(0);
  const [reponses, setReponses] = useState<Record<string, any>>({});
  const [reponseActuelle, setReponseActuelle] = useState<string>("");
  const [texteLibre, setTexteLibre] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [contactInfo, setContactInfo] = useState<Record<string, any>>({});
  const [analyseIA, setAnalyseIA] = useState<string>("");
  const [reponseRelance, setReponseRelance] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showRecap, setShowRecap] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Message[]>([]);

  const etape = ETAPES[etapeActuelle];

  const handleSubmit = async () => {
    if (!reponseActuelle.trim() && etape.type !== "checkboxes" && etape.type !== "radio" && etape.type !== "contact") return;

    setLoading(true);
    
    // Préparer la réponse selon le type d'étape
    let reponseComplete = "";
    
    if (etape.type === "checkboxes") {
      const selected = selectedOptions[etape.id] || [];
      reponseComplete = selected.length > 0 ? selected.join(", ") : "Aucune fonctionnalité sélectionnée";
    } else if (etape.type === "radio") {
      reponseComplete = reponseActuelle;
    } else if (etape.type === "contact") {
      reponseComplete = Object.entries(contactInfo)
        .filter(([key, value]) => value.trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } else if (etape.type === "suggestions") {
      // Pour les suggestions, combiner la suggestion sélectionnée avec le texte libre
      if (reponseActuelle && texteLibre) {
        reponseComplete = `${reponseActuelle}. ${texteLibre}`;
      } else if (reponseActuelle) {
        reponseComplete = reponseActuelle;
      } else if (texteLibre) {
        reponseComplete = texteLibre;
      } else {
        reponseComplete = "Aucune réponse fournie";
      }
    } else {
      reponseComplete = reponseActuelle;
    }

    // Ajouter la réponse utilisateur à la conversation
    const nouvelleReponse = {
      type: "user" as const,
      question: etape.question,
      reponse: reponseComplete,
      etape: etape.id
    };
    
    setConversation(prev => [...prev, nouvelleReponse]);

    try {
      const res = await fetch("/api/ia-relance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: etape.question,
          reponseClient: reponseComplete
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      // Ajouter l'analyse IA à la conversation
      const analyseIA = {
        type: "ai" as const,
        message: data.analyse,
        etape: etape.id
      };
      
      setConversation(prev => [...prev, analyseIA]);
      setAnalyseIA(data.analyse);

      // Sauvegarder la réponse
      setReponses(prev => ({
        ...prev,
        [etape.id]: reponseComplete
      }));

      // Vérifier si c'est la dernière étape
      if (etapeActuelle === ETAPES.length - 1) {
        setShowRecap(true);
      } else {
        // Ne pas passer automatiquement à l'étape suivante
        // L'utilisateur doit cliquer sur "Continuer" après avoir lu l'analyse IA
      }

    } catch (error) {
      console.error("Erreur:", error);
      setAnalyseIA("Désolé, une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Si la suggestion est déjà sélectionnée, la désélectionner
    if (reponseActuelle === suggestion) {
      setReponseActuelle("");
    } else {
      // Sinon, la sélectionner
      setReponseActuelle(suggestion);
    }
  };

  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => {
      const current = prev[etape.id] || [];
      const updated = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [etape.id]: updated };
    });
  };

  const handleRadioChange = (option) => {
    setReponseActuelle(option);
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyBrief = () => {
    const briefText = Object.entries(reponses)
      .map(([etape, reponse]) => `${etape}:\n${reponse}`)
      .join("\n\n");
    
    navigator.clipboard.writeText(briefText);
    alert("Brief copié dans le presse-papiers !");
  };

  const resetWizard = () => {
    setEtapeActuelle(0);
    setReponses({});
    setReponseActuelle("");
    setTexteLibre("");
    setReponseRelance("");
    setSelectedOptions({});
    setContactInfo({});
    setAnalyseIA("");
    setShowRecap(false);
    setConversation([]);
  };

  const canSubmit = () => {
    if (etape.type === "checkboxes") {
      return (selectedOptions[etape.id] || []).length > 0;
    } else if (etape.type === "radio") {
      return reponseActuelle.trim() !== "";
    } else if (etape.type === "contact") {
      return contactInfo.nom && contactInfo.email;
    } else if (etape.type === "suggestions") {
      return reponseActuelle.trim() !== "" || texteLibre.trim() !== "";
    } else {
      return reponseActuelle.trim() !== "";
    }
  };

  const handleContinue = () => {
    setEtapeActuelle(prev => prev + 1);
    setReponseActuelle("");
    setTexteLibre("");
    setReponseRelance("");
    setSelectedOptions({});
    setContactInfo({});
    setAnalyseIA("");
  };

  const handleRelanceSubmit = async () => {
    if (!reponseRelance.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/ia-relance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Précisions demandées par l'IA: ${analyseIA}`,
          reponseClient: reponseRelance
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      // Ajouter la réponse de relance à la conversation
      const relanceReponse = {
        type: "user" as const,
        question: "Précisions",
        reponse: reponseRelance,
        etape: etape.id
      };
      
      const relanceIA = {
        type: "ai" as const,
        message: data.analyse,
        etape: etape.id
      };
      
      setConversation(prev => [...prev, relanceReponse, relanceIA]);

      // Mettre à jour la réponse finale avec les précisions
      const reponseFinale = `${reponses[etape.id]}. Précisions: ${reponseRelance}`;
      setReponses(prev => ({
        ...prev,
        [etape.id]: reponseFinale
      }));

      setAnalyseIA(data.analyse);
      setReponseRelance("");

    } catch (error) {
      console.error("Erreur:", error);
      setAnalyseIA("Désolé, une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (showRecap) {
    return (
      <div className="brief-wizard">
        <div className="wizard-header">
          <h2>Brief complet généré ! 🎉</h2>
          <p>Voici le récapitulatif de vos réponses :</p>
        </div>

        <div className="brief-recap">
          {Object.entries(reponses).map(([etapeId, reponse]) => {
            const etapeInfo = ETAPES.find(e => e.id === etapeId);
            return (
              <div key={etapeId} className="recap-item">
                <h3>{etapeInfo?.question || etapeId}</h3>
                <p>{reponse}</p>
              </div>
            );
          })}
        </div>

        <div className="wizard-actions">
          <button onClick={copyBrief} className="action-btn primary">
            📋 Copier le brief
          </button>
          <button onClick={resetWizard} className="action-btn secondary">
            🔄 Nouveau brief
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="brief-wizard">
      {/* Indicateur de progression */}
      <div className="wizard-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((etapeActuelle + 1) / ETAPES.length) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Étape {etapeActuelle + 1} sur {ETAPES.length}
        </div>
      </div>

      {/* Question actuelle */}
      <div className="wizard-question">
        <h2>{etape.question}</h2>
      </div>

      {/* Zone de réponse selon le type */}
      <div className="wizard-input">
        {etape.type === "suggestions" && (
          <div className="suggestions-container">
            <div className="suggestions-grid">
              {etape.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`suggestion-btn ${reponseActuelle === suggestion ? 'active' : ''}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <textarea
              value={texteLibre}
              onChange={(e) => setTexteLibre(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ou tapez votre réponse personnalisée..."
              rows={3}
              disabled={loading}
              className="wizard-textarea"
            />
          </div>
        )}

        {etape.type === "checkboxes" && (
          <div className="checkboxes-container">
            <div className="checkboxes-grid">
              {etape.options.map((option, index) => (
                <label key={index} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={(selectedOptions[etape.id] || []).includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                    disabled={loading}
                  />
                  <span className="checkbox-label">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {etape.type === "radio" && (
          <div className="radio-container">
            {etape.options.map((option, index) => (
              <label key={index} className="radio-item">
                <input
                  type="radio"
                  name={etape.id}
                  value={option}
                  checked={reponseActuelle === option}
                  onChange={() => handleRadioChange(option)}
                  disabled={loading}
                />
                <span className="radio-label">{option}</span>
              </label>
            ))}
          </div>
        )}

        {etape.type === "text" && (
          <textarea
            value={reponseActuelle}
            onChange={(e) => setReponseActuelle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={etape.placeholder}
            rows={4}
            disabled={loading}
            className="wizard-textarea"
          />
        )}

        {etape.type === "contact" && etape.fields && (
          <div className="contact-form">
            {etape.fields.map((field, index) => (
              <div key={index} className="contact-field">
                <label>{field.label}</label>
                <input
                  type={field.type}
                  value={contactInfo[field.name] || ""}
                  onChange={(e) => handleContactChange(field.name, e.target.value)}
                  placeholder={field.label}
                  disabled={loading}
                  className="contact-input"
                />
              </div>
            ))}
          </div>
        )}

        {!analyseIA ? (
          <button 
            onClick={handleSubmit} 
            disabled={loading || !canSubmit()}
            className="wizard-submit"
          >
            {loading ? "Analyse en cours..." : "Valider"}
          </button>
        ) : (
          <button 
            onClick={handleContinue} 
            className="wizard-submit continue"
          >
            Continuer →
          </button>
        )}
      </div>

      {/* Analyse IA */}
      {analyseIA && (
        <div className="ai-analysis">
          <div className="ai-message">
            <span className="ai-avatar">🤖</span>
            <p>{analyseIA}</p>
          </div>
          
          {/* Champ de réponse aux questions de relance */}
          {(etape.type === "checkboxes" || etape.type === "radio") && (
            <div className="relance-container">
              <textarea
                value={reponseRelance}
                onChange={(e) => setReponseRelance(e.target.value)}
                placeholder="Répondez aux questions de l'IA ici..."
                rows={3}
                disabled={loading}
                className="relance-textarea"
              />
              <button 
                onClick={handleRelanceSubmit} 
                disabled={loading || !reponseRelance.trim()}
                className="relance-submit"
              >
                {loading ? "Envoi..." : "Envoyer les précisions"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Conversation */}
      {conversation.length > 0 && (
        <div className="conversation-history">
          <h3>Conversation</h3>
          <div className="conversation-messages">
            {conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.type === "user" ? (
                  <div className="user-message">
                    <span className="user-avatar">👤</span>
                    <div>
                      <strong>{msg.etape}</strong>
                      <p>{msg.reponse}</p>
                    </div>
                  </div>
                ) : (
                  <div className="ai-message">
                    <span className="ai-avatar">🤖</span>
                    <p>{msg.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 