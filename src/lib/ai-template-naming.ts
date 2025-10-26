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
    
    let prompt = `Génère 5 noms créatifs pour un template de site web de catégorie "${category}".`;
    
    if (style) prompt += ` Style: ${style}.`;
    if (industry) prompt += ` Industrie: ${industry}.`;
    if (mood) prompt += ` Ambiance: ${mood}.`;
    
    prompt += `\n\nLes noms doivent être:\n`;
    prompt += `- Créatifs et mémorables\n`;
    prompt += `- Professionnels\n`;
    prompt += `- En anglais (pour l'URL)\n`;
    prompt += `- Courts (2-3 mots max)\n`;
    prompt += `- Sans caractères spéciaux\n\n`;
    prompt += `Réponds en JSON: {"names": ["nom1", "nom2", ...], "description": "description du template"}`;

    return prompt;
  }

  private getFallbackNames(category: string): AINamingResponse {
    const fallbacks: Record<string, { names: string[], description: string }> = {
      'portfolio': {
        names: ['creative-showcase', 'artistic-portfolio', 'design-gallery', 'creative-works', 'portfolio-pro'],
        description: 'Template portfolio créatif'
      },
      'ecommerce': {
        names: ['shop-modern', 'store-premium', 'commerce-pro', 'marketplace-elegant', 'shop-luxury'],
        description: 'Template e-commerce moderne'
      },
      'agency': {
        names: ['agency-pro', 'creative-studio', 'digital-agency', 'marketing-hub', 'agency-modern'],
        description: 'Template agence professionnelle'
      },
      'blog': {
        names: ['blog-minimal', 'content-hub', 'writing-space', 'blog-elegant', 'content-studio'],
        description: 'Template blog élégant'
      },
      'corporate': {
        names: ['corporate-pro', 'business-premium', 'enterprise-modern', 'corporate-elegant', 'business-hub'],
        description: 'Template corporate professionnel'
      }
    };

    return fallbacks[category.toLowerCase()] || {
      names: [`${category}-template`, `${category}-modern`, `${category}-premium`, `${category}-pro`, `${category}-elegant`],
      description: `Template ${category} généré`
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
