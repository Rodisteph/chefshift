import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET : derniers avis publics (pour la page d'accueil), aucun compte requis
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isPublic: true,
        overallScore: { gte: 4 },
        reviewText: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        fromUser: {
          select: {
            name: true,
            role: true,
            horecaProfile: { select: { companyName: true } },
            kokProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    const items = reviews
      .filter((r) => r.reviewText && r.reviewText.trim().length > 0)
      .map((r) => {
        const auteur =
          r.fromUser.horecaProfile?.companyName ||
          [r.fromUser.kokProfile?.firstName, r.fromUser.kokProfile?.lastName].filter(Boolean).join(' ') ||
          r.fromUser.name ||
          'ChefShift gebruiker'
        return {
          id: r.id,
          score: r.overallScore,
          text: r.reviewText,
          auteur,
          rol: r.fromUser.role,
          datum: r.createdAt,
        }
      })

    return NextResponse.json({ reviews: items })
  } catch (error) {
    return NextResponse.json({ reviews: [] })
  }
}
