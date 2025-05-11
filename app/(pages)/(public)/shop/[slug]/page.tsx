import ShopContent from './shop-content';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="mt-8">
      <ShopContent slug={slug} />
    </div>
  );
}
