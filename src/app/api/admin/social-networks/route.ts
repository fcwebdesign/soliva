import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Liste des principaux réseaux sociaux
    const socialNetworks = [
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'twitter', label: 'Twitter / X' },
      { key: 'instagram', label: 'Instagram' },
      { key: 'facebook', label: 'Facebook' },
      { key: 'youtube', label: 'YouTube' },
      { key: 'tiktok', label: 'TikTok' },
      { key: 'behance', label: 'Behance' },
      { key: 'dribbble', label: 'Dribbble' },
      { key: 'github', label: 'GitHub' },
      { key: 'medium', label: 'Medium' },
      { key: 'pinterest', label: 'Pinterest' },
      { key: 'snapchat', label: 'Snapchat' },
      { key: 'twitch', label: 'Twitch' },
      { key: 'discord', label: 'Discord' },
      { key: 'telegram', label: 'Telegram' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'spotify', label: 'Spotify' }
    ];

    return NextResponse.json({
      networks: socialNetworks,
      total: socialNetworks.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des réseaux sociaux:', error);
    
    // Retourner une liste de base en cas d'erreur
    const fallbackNetworks = [
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'twitter', label: 'Twitter' },
      { key: 'instagram', label: 'Instagram' },
      { key: 'facebook', label: 'Facebook' },
      { key: 'youtube', label: 'YouTube' }
    ];

    return NextResponse.json({
      networks: fallbackNetworks,
      total: fallbackNetworks.length
    });
  }
} 