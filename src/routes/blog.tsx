import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const Route = createFileRoute('/blog')({
  component: BlogPage,
});

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  category: string;
  author: string;
  date: string;
  readTime: string;
};

export const posts: BlogPost[] = [
  {
    slug: 'ultimate-guide-online-shopping-bangladesh',
    title: 'The Ultimate Guide to Online Shopping in Bangladesh',
    excerpt:
      'Discover tips and tricks for a safe and enjoyable online shopping experience — from payment security to finding the best deals.',
    content: `Online shopping in Bangladesh has seen tremendous growth over the past few years. With platforms like Oylkka leading the way, consumers now have access to thousands of products from trusted vendors across the country.\n\n## Why Shop Online?\n\nConvenience is the biggest advantage. You can browse, compare, and purchase products from the comfort of your home. Plus, with secure payment options like bKash and Cash on Delivery, you can shop with confidence.\n\n## Tips for Safe Online Shopping\n\n1. **Check Vendor Ratings** - Always review vendor ratings and read customer feedback before making a purchase.\n2. **Compare Prices** - Don't settle for the first option. Use Oylkka's compare feature to find the best deal.\n3. **Read Product Descriptions** - Pay attention to specifications, sizes, and materials.\n4. **Understand Return Policies** - Know the return window and conditions before you buy.\n\n## Payment Security\n\nOylkka uses industry-standard encryption to protect your payment information. Whether you're using bKash, credit card, or Cash on Delivery, your data is safe.\n\nStart exploring Oylkka today and discover a better way to shop!`,
    image: null,
    category: 'Shopping Tips',
    author: 'Oylkka Team',
    date: 'May 15, 2026',
    readTime: '5 min read',
  },
  {
    slug: 'how-to-choose-right-vendor-oylkka',
    title: 'How to Choose the Right Vendor on Oylkka',
    excerpt:
      'Learn how to evaluate vendor ratings, read reviews, and verify authenticity before making a purchase.',
    content: `Choosing the right vendor is one of the most important decisions you'll make when shopping on Oylkka. Here's how to find trustworthy sellers.\n\n## Check Vendor Ratings\n\nEvery vendor on Oylkka has a rating based on customer feedback. Look for vendors with consistently high ratings and a large number of reviews.\n\n## Read Customer Reviews\n\nTake time to read through recent reviews. Pay attention to comments about product quality, shipping speed, and customer service.\n\n## Verify Product Authenticity\n\nLook for detailed product photos and descriptions. Verified vendors often provide better product information and customer support.\n\n## Communication Matters\n\nDon't hesitate to message vendors with questions before purchasing. Responsive vendors are typically more reliable.\n\nBy following these guidelines, you can shop with confidence on Oylkka.`,
    image: null,
    category: 'Vendors',
    author: 'Oylkka Team',
    date: 'May 10, 2026',
    readTime: '4 min read',
  },
  {
    slug: 'top-10-trending-products-this-season',
    title: 'Top 10 Trending Products This Season',
    excerpt:
      'From electronics to fashion, explore the most popular items our customers are loving right now.',
    content: `Looking for what's hot this season? Here are the top 10 trending products on Oylkka right now.\n\n## 1. Wireless Earbuds\nAffordable and high-quality audio accessories continue to dominate sales.\n\n## 2. Smart Home Devices\nFrom smart bulbs to security cameras, home automation is on the rise.\n\n## 3. Traditional Fashion\nEthnic wear and traditional Bangladeshi fashion are always in demand.\n\n## 4. Skin Care Products\nNatural and organic skincare products are seeing a surge in popularity.\n\n## 5. Fitness Equipment\nHome workout gear remains popular as more people embrace fitness.\n\n## 6. Smartphones\nBudget and mid-range smartphones are consistently top sellers.\n\n## 7. Kitchen Appliances\nModern kitchen gadgets make cooking easier and more enjoyable.\n\n## 8. Baby Products\nParents are always looking for quality baby care items.\n\n## 9. Books\nBoth English and Bengali books have a dedicated audience.\n\n## 10. Handicrafts\nBangladeshi handicrafts and handmade items are loved by customers.\n\nBrowse these categories on Oylkka and find your next favorite product!`,
    image: null,
    category: 'Trending',
    author: 'Oylkka Team',
    date: 'May 5, 2026',
    readTime: '6 min read',
  },
  {
    slug: 'understanding-bkash-payments-step-by-step',
    title: 'Understanding bKash Payments: A Step-by-Step Guide',
    excerpt:
      'New to bKash? Walk through the payment process with our simple guide to secure transactions.',
    content: `bKash is one of the most popular mobile financial services in Bangladesh. Here's how to use it for your Oylkka purchases.\n\n## Step 1: Select bKash at Checkout\n\nWhen you're ready to pay, choose bKash as your payment method on the checkout page.\n\n## Step 2: Get Payment Details\n\nYou'll receive a payment request with the exact amount due. Confirm the details.\n\n## Step 3: Complete Payment via bKash App\n\nOpen your bKash app and follow the prompts to complete the payment.\n\n## Step 4: Automatic Confirmation\n\nOnce the payment is processed, your order is automatically confirmed and you'll receive an email with order details.\n\n## Troubleshooting Tips\n\n- Make sure your bKash account has sufficient balance\n- Check that your internet connection is stable\n- If a payment fails, funds are automatically refunded within 24 hours\n\nbKash payments on Oylkka are secure, fast, and hassle-free!`,
    image: null,
    category: 'Payments',
    author: 'Oylkka Team',
    date: 'April 28, 2026',
    readTime: '3 min read',
  },
  {
    slug: 'how-to-start-selling-on-oylkka-as-vendor',
    title: 'How to Start Selling on Oylkka as a Vendor',
    excerpt:
      'Everything you need to know about becoming a verified vendor on our marketplace — from application to your first sale.',
    content: `Ready to start selling on Oylkka? Follow this step-by-step guide to become a verified vendor.\n\n## Step 1: Create Your Account\n\nSign up on Oylkka and navigate to the "Become a Vendor" section in your dashboard.\n\n## Step 2: Submit Your Application\n\nFill out your shop details including your business information, product categories, and shipping policies.\n\n## Step 3: Get Verified\n\nOur team reviews your application. Once approved, you can start listing products immediately.\n\n## Step 4: List Your Products\n\nAdd products with clear photos, detailed descriptions, and competitive prices.\n\n## Step 5: Start Selling\n\nOnce your products are live, customers can find them through search and category browsing.\n\n## Tips for Success\n\n- Offer competitive shipping rates\n- Respond to customer inquiries quickly\n- Maintain high product quality\n- Gather positive reviews\n\nJoin Oylkka today and grow your business!`,
    image: null,
    category: 'Vendors',
    author: 'Oylkka Team',
    date: 'April 20, 2026',
    readTime: '7 min read',
  },
  {
    slug: '5-tips-for-hassle-free-returns',
    title: '5 Tips for Hassle-Free Returns',
    excerpt:
      'Make your return experience smooth by following these simple guidelines and best practices.',
    content: `Returns don't have to be stressful. Follow these five tips for a smooth return experience on Oylkka.\n\n## 1. Know the Return Policy\n\nCheck the vendor's return policy before making a purchase. Return windows and conditions vary.\n\n## 2. Keep the Original Packaging\n\nAlways keep the original box and packaging until you're sure the product meets your expectations.\n\n## 3. Document the Condition\n\nTake photos of the product when it arrives, especially if there's visible damage.\n\n## 4. Initiate Returns Promptly\n\nDon't wait until the last day of the return window to start the process.\n\n## 5. Communicate Clearly\n\nWhen submitting a return request, provide clear details about why you're returning the item.\n\n## The Return Process on Oylkka\n\n1. Go to your Orders page\n2. Select the order and click "Return"\n3. Fill out the return form\n4. Ship the item back (if required)\n5. Receive your refund\n\nWe're here to help make returns as easy as possible!`,
    image: null,
    category: 'Shopping Tips',
    author: 'Oylkka Team',
    date: 'April 15, 2026',
    readTime: '4 min read',
  },
];

function BlogPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Header />

      <div className='border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0}
          >
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='mb-8 gap-2 text-primary'
            >
              <Link to='/'>
                <ArrowLeft className='w-3.5 h-3.5' /> Back to Home
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0.08}
          >
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight'>
              Our <span className='italic font-bold text-primary'>Blog</span>
              <span className='text-primary'>.</span>
            </h1>
            <p className='text-sm text-muted-foreground mt-3 max-w-2xl'>
              News, guides, and stories from the Oylkka community.
            </p>
          </motion.div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
        <motion.div
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
        >
          {posts.map((post) => (
            <Link key={post.slug} to='/blog/$slug' params={{ slug: post.slug }}>
              <motion.article
                variants={fadeUp}
                custom={0}
                className='group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-pointer'
              >
                <div className='relative aspect-[2/1] overflow-hidden bg-muted flex items-center justify-center'>
                  <div className='w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center'>
                    <Tag className='w-6 h-6 text-primary' />
                  </div>
                </div>

                <div className='p-5 space-y-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[10px] font-semibold tracking-[0.12em] uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full'>
                      {post.category}
                    </span>
                  </div>

                  <h3 className='text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200'>
                    {post.title}
                  </h3>

                  <p className='text-sm leading-relaxed text-muted-foreground line-clamp-2'>
                    {post.excerpt}
                  </p>

                  <div className='flex items-center gap-3 pt-2 text-[11px] text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <User className='w-3 h-3' />
                      {post.author}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Calendar className='w-3 h-3' />
                      {post.date}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
