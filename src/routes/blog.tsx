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

const posts = [
  {
    title: 'The Ultimate Guide to Online Shopping in Bangladesh',
    excerpt:
      'Discover tips and tricks for a safe and enjoyable online shopping experience — from payment security to finding the best deals.',
    image: null,
    category: 'Shopping Tips',
    author: 'Oylkka Team',
    date: 'May 15, 2026',
    readTime: '5 min read',
  },
  {
    title: 'How to Choose the Right Vendor on Oylkka',
    excerpt:
      'Learn how to evaluate vendor ratings, read reviews, and verify authenticity before making a purchase.',
    image: null,
    category: 'Vendors',
    author: 'Oylkka Team',
    date: 'May 10, 2026',
    readTime: '4 min read',
  },
  {
    title: 'Top 10 Trending Products This Season',
    excerpt:
      'From electronics to fashion, explore the most popular items our customers are loving right now.',
    image: null,
    category: 'Trending',
    author: 'Oylkka Team',
    date: 'May 5, 2026',
    readTime: '6 min read',
  },
  {
    title: 'Understanding bKash Payments: A Step-by-Step Guide',
    excerpt:
      'New to bKash? Walk through the payment process with our simple guide to secure transactions.',
    image: null,
    category: 'Payments',
    author: 'Oylkka Team',
    date: 'April 28, 2026',
    readTime: '3 min read',
  },
  {
    title: 'How to Start Selling on Oylkka as a Vendor',
    excerpt:
      'Everything you need to know about becoming a verified vendor on our marketplace — from application to your first sale.',
    image: null,
    category: 'Vendors',
    author: 'Oylkka Team',
    date: 'April 20, 2026',
    readTime: '7 min read',
  },
  {
    title: '5 Tips for Hassle-Free Returns',
    excerpt:
      'Make your return experience smooth by following these simple guidelines and best practices.',
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
            <motion.article
              key={post.title}
              variants={fadeUp}
              custom={0}
              className='group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all duration-300'
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
          ))}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
