import { notFound } from 'next/navigation';
import { CmsSections } from '@/components/cms-sections';
import { getPage } from '@/lib/sanity-data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: 'Page Not Found' };
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription,
  };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return <CmsSections sections={page.sections || []} />;
}
