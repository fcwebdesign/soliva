interface AINamingRequest {
  category: string;
  style?: string;
  industry?: string;
  mood?: string;
}

interface AINamingResponse {
  names: string[];
  description: string;
}

export class AITemplateNaming {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async generateTemplateNames(request: AINamingRequest): Promise<AINamingResponse> {
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key not found, using fallback naming');
      return this.getFallbackNames(request.category);
    }

    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en naming de templates web. Génère des noms créatifs, mémorables et professionnels pour des templates de sites web. Réponds UNIQUEMENT en JSON avec un array de noms et une description.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse JSON response
      const parsed = JSON.parse(content);
      return {
        names: parsed.names || [],
        description: parsed.description || 'Template généré par IA'
      };

    } catch (error) {
      console.error('❌ Erreur IA naming:', error);
      return this.getFallbackNames(request.category);
    }
  }

  private buildPrompt(request: AINamingRequest): string {
    const { category, style, industry, mood } = request;
    
    const categoryPrompts: Record<string, string> = {
      'portfolio': 'template portfolio créatif pour artistes, designers, photographes',
      'agency': 'template agence digitale moderne pour agences marketing et communication',
      'blog': 'template blog élégant pour créateurs de contenu et influenceurs',
      'ecommerce': 'template boutique en ligne premium pour e-commerce et marketplace',
      'landing': 'template landing page optimisée pour conversions et ventes',
      'corporate': 'template corporate professionnel pour entreprises et institutions',
      'creative': 'template créatif innovant avec design artistique et moderne',
      'minimal': 'template minimaliste épuré avec design sobre et élégant'
    };
    
    let prompt = `Génère 8 noms créatifs et uniques pour un ${categoryPrompts[category] || `template de catégorie "${category}"`}.`;
    
    if (style) prompt += ` Style: ${style}.`;
    if (industry) prompt += ` Industrie: ${industry}.`;
    if (mood) prompt += ` Ambiance: ${mood}.`;
    
    prompt += `\n\nInspire-toi du style des templates Framer Marketplace. Les noms doivent être:\n`;
    prompt += `- Créatifs, mémorables et originaux (comme "Talentify", "Sereenity", "Portfolite")\n`;
    prompt += `- Un seul mot ou deux mots maximum\n`;
    prompt += `- Sans caractères spéciaux ni espaces\n`;
    prompt += `- Éviter les mots génériques comme "template", "site", "web", "modern", "premium"\n`;
    prompt += `- Utiliser des mots inventés, des combinaisons créatives ou des mots évocateurs\n`;
    prompt += `- Style moderne et professionnel\n\n`;
    
    prompt += `Exemples inspirants par catégorie:\n`;
    prompt += `- Portfolio: "Talentify", "Artboard", "Pixend", "PureVisuals", "Brandora"\n`;
    prompt += `- Agency: "Sereenity", "ReadyLaunch", "Stratex", "Gordian", "Trifecta"\n`;
    prompt += `- Blog: "Limitless", "Breve", "Viral", "Hypersonic", "Clover"\n`;
    prompt += `- Ecommerce: "Dalgona", "Bombon", "Lungo", "Swipe", "Helium"\n`;
    prompt += `- Corporate: "Praxis", "Effica", "Omnis", "Pearl", "Acelia"\n\n`;
    
    prompt += `Réponds UNIQUEMENT en JSON: {"names": ["nom1", "nom2", ...], "description": "description créative du template"}`;

    return prompt;
  }

  private getFallbackNames(category: string): AINamingResponse {
    const fallbacks: Record<string, { names: string[], description: string }> = {
      'portfolio': {
        names: ['Talentify', 'Artboard', 'Pixend', 'PureVisuals', 'Brandora', 'CreativeFlow', 'VisualHub', 'DesignCore'],
        description: 'Template portfolio créatif pour artistes et designers'
      },
      'ecommerce': {
        names: ['Dalgona', 'Bombon', 'Lungo', 'Swipe', 'Helium', 'Shopify', 'CommerceFlow', 'StoreCore'],
        description: 'Template e-commerce premium et moderne'
      },
      'agency': {
        names: ['Sereenity', 'ReadyLaunch', 'Stratex', 'Gordian', 'Trifecta', 'AgencyFlow', 'CreativeCore', 'DigitalHub'],
        description: 'Template agence digitale professionnelle'
      },
      'blog': {
        names: ['Limitless', 'Breve', 'Viral', 'Hypersonic', 'Clover', 'ContentFlow', 'StoryCore', 'WritingHub'],
        description: 'Template blog élégant pour créateurs de contenu'
      },
      'corporate': {
        names: ['Praxis', 'Effica', 'Omnis', 'Pearl', 'Acelia', 'BusinessFlow', 'CorporateCore', 'EnterpriseHub'],
        description: 'Template corporate professionnel et moderne'
      },
      'landing': {
        names: ['Landio', 'ConversionFlow', 'SalesCore', 'LeadHub', 'ConvertPro', 'LandingFlow', 'SalesCore', 'LeadHub'],
        description: 'Template landing page optimisée pour conversions'
      },
      'creative': {
        names: ['CreativeFlow', 'ArtCore', 'DesignHub', 'InnovateFlow', 'ArtCore', 'CreativeHub', 'DesignFlow', 'InnovateCore'],
        description: 'Template créatif innovant et artistique'
      },
      'minimal': {
        names: ['MinimalFlow', 'CleanCore', 'SimpleHub', 'PureFlow', 'CleanCore', 'MinimalHub', 'SimpleFlow', 'PureCore'],
        description: 'Template minimaliste épuré et élégant'
      }
    };

    return fallbacks[category.toLowerCase()] || {
      names: [`${category}Flow`, `${category}Core`, `${category}Hub`, `${category}Pro`, `${category}Studio`, `${category}Space`, `${category}Lab`, `${category}Works`],
      description: `Template ${category} moderne et professionnel`
    };
  }

  // Méthode pour obtenir un nom unique basé sur la catégorie
  async getUniqueTemplateName(category: string, existingNames: string[] = []): Promise<string> {
    const request: AINamingRequest = {
      category,
      style: 'moderne',
      mood: 'professionnel'
    };

    const response = await this.generateTemplateNames(request);
    
    // Trouver le premier nom qui n'existe pas déjà
    for (const name of response.names) {
      const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      if (!existingNames.includes(cleanName)) {
        return cleanName;
      }
    }

    // Si tous les noms existent, ajouter un suffixe
    const baseName = response.names[0]?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || `${category}-template`;
    let counter = 1;
    let uniqueName = `${baseName}-${counter}`;
    
    while (existingNames.includes(uniqueName)) {
      counter++;
      uniqueName = `${baseName}-${counter}`;
    }

    return uniqueName;
  }
}

export const aiTemplateNaming = new AITemplateNaming();
