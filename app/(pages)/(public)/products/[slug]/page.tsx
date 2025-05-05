import SingleProduct from './single-product';

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div>
      <SingleProduct slug={slug} />
    </div>
  );
}
