import ProductDetails from './product-details';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className='container mx-auto px-4 py-8'>
      <ProductDetails slug={slug} />
    </div>
  );
}
