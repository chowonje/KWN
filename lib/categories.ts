import { BlogPost } from '@/lib/posts'

export type CategoryDef = {
  slug: string
  label: string
  aliases?: string[]
}

export const CATEGORIES: CategoryDef[] = [
  { slug: 'children-teen', label: '아동/청소년', aliases: ['아동', '청소년', '아동-청소년'] },
  { slug: 'youth', label: '청년', aliases: [] },
  { slug: 'middle-elderly', label: '중장년/노인', aliases: ['중장년', '노인', '중장년-노인'] },
  { slug: 'women', label: '여성', aliases: [] },
  { slug: 'disabled', label: '장애인', aliases: ['장애', '장애우'] },
]

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  const s = slug?.toString().trim().toLowerCase()
  return CATEGORIES.find((c) => c.slug === s)
}

function normalize(input?: string) {
  return input ? input.toString().trim().toLowerCase() : ''
}

export function postMatchesCategory(post: BlogPost, categorySlug: string): boolean {
  const def = getCategoryBySlug(categorySlug)
  if (!def) return false
  const postCat = normalize(post.category)
  if (!postCat) return false

  if (postCat === normalize(def.label)) return true
  if (postCat === def.slug) return true
  if (def.aliases && def.aliases.map(normalize).includes(postCat)) return true
  return false
}

