import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { posts } from '@/routes/blog';

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className='min-h-screen bg-background'>
      <Header />
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center'>
        <h1 className='text-2xl font-bold'>Post not found</h1>
        <p className='text-muted-foreground mt-2'>
          The blog post you're looking for doesn't exist.
        </p>
        <Button asChild className='mt-6'>
          <Link to='/blog'>Back to Blog</Link>
        </Button>
      </div>
      <Footer />
    </div>
  ),
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) throw notFound();

  return (
    <div className='min-h-screen bg-background'>
      <Header />

      <div className='border-b border-border'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='mb-8 gap-2 text-primary'
            >
              <Link to='/blog'>
                <ArrowLeft className='w-3.5 h-3.5' /> Back to Blog
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.08,
            }}
          >
            <span className='text-xs font-semibold tracking-[0.12em] uppercase text-primary bg-primary/10 px-3 py-1 rounded-full'>
              {post.category}
            </span>

            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mt-4'>
              {post.title}
            </h1>

            <div className='flex items-center gap-4 mt-6 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <User className='w-4 h-4' />
                {post.author}
              </div>
              <div className='flex items-center gap-1.5'>
                <Calendar className='w-4 h-4' />
                {post.date}
              </div>
              <div className='flex items-center gap-1.5'>
                <Clock className='w-4 h-4' />
                {post.readTime}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
          className='prose prose-sm prose-gray dark:prose-invert max-w-none'
        >
          {post.content.split('\n').map((line, i) => {
            const key = `${line.slice(0, 20)}-${i}`;
            if (line.startsWith('## ')) {
              return (
                <h2 key={key} className='text-xl font-bold mt-8 mb-4'>
                  {line.slice(3)}
                </h2>
              );
            }
            if (line.startsWith('### ')) {
              return (
                <h3 key={key} className='text-lg font-semibold mt-6 mb-3'>
                  {line.slice(4)}
                </h3>
              );
            }
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <p key={key} className='font-semibold text-foreground'>
                  {line.slice(2, -2)}
                </p>
              );
            }
            if (line.startsWith('- ')) {
              return (
                <li key={key} className='text-muted-foreground ml-4'>
                  {line.slice(2)}
                </li>
              );
            }
            if (!line.trim()) return <div key={key} className='h-3' />;
            return (
              <p key={key} className='text-muted-foreground leading-relaxed'>
                {line}
              </p>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
          className='mt-16 pt-8 border-t border-border'
        >
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-semibold'>Share this article</p>
              <p className='text-sm text-muted-foreground'>
                Found this helpful? Share it with others!
              </p>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' asChild>
                <Link to='/blog'>Read More Articles</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
