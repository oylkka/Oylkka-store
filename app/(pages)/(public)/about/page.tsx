import {
  Award,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  MapPin,
  Shield,
  Star,
  Truck,
  Users,
} from 'lucide-react';
import Image from 'next/image';

import cover1 from '@/assets/cover1.jpg';
import cover2 from '@/assets/cover2.jpg';
import user1 from '@/assets/user1.jpg';
import user2 from '@/assets/user2.jpg';
import user3 from '@/assets/user3.jpg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import Contact from './contact';

export default function AboutPage() {
  return (
    <div className='bg-background min-h-screen'>
      {/* Hero Section */}
      <section className='relative overflow-hidden py-12'>
        <div className='bg-primary/5 absolute inset-0 -z-10' />
        <div className='bg-primary/10 absolute -top-24 -right-24 -z-10 h-64 w-64 rounded-full blur-3xl' />
        <div className='bg-secondary/10 absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full blur-3xl' />

        <div className='mx-auto max-w-6xl px-2'>
          <div className='grid items-center gap-16 lg:grid-cols-2'>
            <div className='space-y-8'>
              <div className='inline-flex'>
                <Badge
                  variant='secondary'
                  className='px-4 py-1 text-sm font-medium'
                >
                  Our Story
                </Badge>
              </div>
              <h1 className='text-foreground text-4xl leading-tight font-bold lg:text-6xl'>
                Welcome to{' '}
                <span className='text-primary relative'>
                  Oylkka
                  <span className='bg-primary/20 absolute -bottom-2 left-0 h-2 w-full rounded-full' />
                </span>
              </h1>
              <p className='text-muted-foreground text-xl leading-relaxed'>
                We&#39;re passionate about bringing you the finest products with
                exceptional quality and service. Our journey began with a simple
                mission: to make premium shopping accessible to everyone.
              </p>
              <div className='flex gap-4'>
                <Button size='lg' className='group'>
                  Shop Our Collection
                  <ChevronRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Button>
                <Button size='lg' variant='outline'>
                  Learn More
                </Button>
              </div>
            </div>
            <div className='relative'>
              <div className='border-border/40 relative aspect-square overflow-hidden rounded-3xl border shadow-2xl'>
                <div className='from-primary/10 absolute inset-0 z-10 bg-gradient-to-tr to-transparent' />
                <Image
                  src={cover1}
                  alt='Oylkka team'
                  width={600}
                  height={600}
                  className='h-full w-full object-cover'
                />
              </div>
              <div className='bg-card border-border/40 absolute -bottom-8 -left-8 rounded-2xl border p-6 shadow-lg'>
                <div className='flex items-center gap-4'>
                  <div className='bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                    <Heart className='text-primary h-7 w-7' />
                  </div>
                  <div>
                    <p className='text-foreground text-xl font-semibold'>
                      10,000+
                    </p>
                    <p className='text-muted-foreground'>Happy Customers</p>
                  </div>
                </div>
              </div>
              <div className='bg-card border-border/40 absolute -top-6 -right-6 rounded-full border p-4 shadow-lg'>
                <Star className='text-primary h-8 w-8' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className='py-12'>
        <div className='mx-auto max-w-6xl px-2'>
          <div className='mx-auto mb-16 max-w-3xl text-center'>
            <Badge
              variant='outline'
              className='mb-6 px-4 py-1 text-sm font-medium'
            >
              Our Values
            </Badge>
            <h2 className='text-foreground mb-6 text-3xl font-bold lg:text-5xl'>
              What We Stand For
            </h2>
            <p className='text-muted-foreground text-xl'>
              Our core values guide everything we do, from product selection to
              customer service.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                icon: Shield,
                title: 'Quality First',
                description:
                  'We carefully curate every product to ensure it meets our high standards for quality and durability.',
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                description:
                  'Quick and reliable shipping to get your orders to you as fast as possible, wherever you are.',
              },
              {
                icon: Users,
                title: 'Customer Focus',
                description:
                  "Your satisfaction is our priority. We're here to help with exceptional customer service.",
              },
              {
                icon: Award,
                title: 'Excellence',
                description:
                  'We strive for excellence in everything we do, from product quality to user experience.',
              },
              {
                icon: Globe,
                title: 'Sustainability',
                description:
                  'Committed to sustainable practices and environmentally responsible business operations.',
              },
              {
                icon: Heart,
                title: 'Community',
                description:
                  'Building a community of satisfied customers who trust us for their shopping needs.',
              },
            ].map((value, index) => (
              <Card
                // biome-ignore lint: error
                key={index}
                className='group border-border/40 overflow-hidden transition-all duration-300 hover:shadow-xl'
              >
                <CardContent className='relative p-8'>
                  <div className='bg-primary/5 group-hover:bg-primary/10 absolute -top-8 -right-8 h-24 w-24 rounded-full transition-colors duration-300' />
                  <div className='bg-primary/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110'>
                    <value.icon className='text-primary h-8 w-8' />
                  </div>
                  <h3 className='text-foreground mb-4 text-xl font-semibold'>
                    {value.title}
                  </h3>
                  <p className='text-muted-foreground leading-relaxed'>
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className='bg-muted/30 relative overflow-hidden py-12'>
        <div className='bg-grid-primary/5 absolute inset-0 -z-10' />
        <div className='bg-primary/5 absolute top-0 right-0 -z-10 h-1/3 w-1/3 rounded-full blur-3xl' />
        <div className='bg-secondary/5 absolute bottom-0 left-0 -z-10 h-1/3 w-1/3 rounded-full blur-3xl' />

        <div className='mx-auto max-w-6xl px-2'>
          <div className='grid items-center gap-16 lg:grid-cols-2'>
            <div className='order-2 space-y-8 lg:order-1'>
              <Badge
                variant='outline'
                className='px-4 py-1 text-sm font-medium'
              >
                Our Journey
              </Badge>
              <h2 className='text-foreground text-3xl font-bold lg:text-5xl'>
                The Oylkka Story
              </h2>
              <div className='text-muted-foreground space-y-6 leading-relaxed'>
                <p>
                  Founded with a vision to revolutionize online shopping, Oylkka
                  started as a small team passionate about bringing quality
                  products to customers worldwide. We believed that everyone
                  deserves access to premium products without compromising on
                  service or value.
                </p>
                <p>
                  Over the years, we&#39;ve grown from a startup to a trusted
                  brand, but our core mission remains the same: to provide
                  exceptional products with outstanding customer experience.
                  Every product in our catalog is carefully selected and tested
                  to ensure it meets our rigorous quality standards.
                </p>
                <p>
                  Today, we&#39;re proud to serve thousands of customers
                  globally, and we continue to innovate and expand our offerings
                  while maintaining the personal touch that makes Oylkka
                  special.
                </p>
              </div>
              <div className='grid grid-cols-3 gap-8 pt-4'>
                <div className='bg-card border-border/40 rounded-xl border p-2 text-center shadow-sm md:p-6'>
                  <p className='text-primary text-3xl font-bold'>2025</p>
                  <p className='text-muted-foreground text-sm'>Founded</p>
                </div>
                <div className='bg-card border-border/40 rounded-xl border p-2 text-center shadow-sm md:p-6'>
                  <p className='text-primary text-3xl font-bold'>10K+</p>
                  <p className='text-muted-foreground text-sm'>Customers</p>
                </div>
                <div className='bg-card border-border/40 rounded-xl border p-2 text-center shadow-sm md:p-6'>
                  <p className='text-primary text-3xl font-bold'>500+</p>
                  <p className='text-muted-foreground text-sm'>Products</p>
                </div>
              </div>
            </div>
            <div className='relative order-1 lg:order-2'>
              <div className='border-border/40 relative aspect-[4/3] overflow-hidden rounded-3xl border shadow-2xl'>
                <div className='from-primary/10 absolute inset-0 z-10 bg-gradient-to-br to-transparent' />
                <Image
                  src={cover2}
                  alt='Our story'
                  width={600}
                  height={500}
                  className='h-full w-full object-cover'
                />
              </div>
              <div className='bg-card border-border/40 absolute -right-4 -bottom-4 rounded-xl border p-6 shadow-lg'>
                <div className='flex items-center gap-3'>
                  <Clock className='text-primary h-6 w-6' />
                  <p className='text-foreground font-medium'>Est. 2019</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className='py-12'>
        z
        <div className='mx-auto max-w-6xl px-2'>
          <div className='mx-auto mb-16 max-w-3xl text-center'>
            <Badge
              variant='outline'
              className='mb-6 px-4 py-1 text-sm font-medium'
            >
              Our Team
            </Badge>
            <h2 className='text-foreground mb-6 text-3xl font-bold lg:text-5xl'>
              Meet The People Behind Oylkka
            </h2>
            <p className='text-muted-foreground text-xl'>
              The passionate individuals who work tirelessly to bring you the
              best shopping experience.
            </p>
          </div>

          <div className='grid gap-10 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                image: user1,
                bio: 'With over 15 years in retail, Sarah founded Oylkka with a vision to transform online shopping.',
              },
              {
                name: 'Michael Chen',
                role: 'Head of Product',
                image: user2,
                bio: 'Michael ensures every product meets our quality standards before reaching our customers.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Customer Success',
                image: user3,
                bio: 'Emily leads our customer service team, ensuring every customer has an exceptional experience.',
              },
            ].map((member, index) => (
              <Card
                // biome-ignore lint: error
                key={index}
                className='group border-border/40 overflow-hidden p-0 transition-all duration-300 hover:shadow-xl'
              >
                <CardContent className='p-0'>
                  <div className='relative overflow-hidden'>
                    <div className='aspect-[3/4] overflow-hidden'>
                      <Image
                        src={member.image || '/placeholder.svg'}
                        alt={member.name}
                        width={400}
                        height={500}
                        className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    </div>
                    <div className='from-background absolute inset-0 bg-gradient-to-t to-transparent' />
                    <div className='absolute right-0 bottom-0 left-0 p-6 text-left'>
                      <h3 className='text-foreground mb-1 text-xl font-semibold'>
                        {member.name}
                      </h3>
                      <p className='text-primary mb-3 font-medium'>
                        {member.role}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='bg-muted/30 relative overflow-hidden px-2 py-12'>
        <div className='bg-grid-secondary/5 absolute inset-0 -z-10' />
        <div className='bg-secondary/5 absolute top-0 left-0 -z-10 h-1/3 w-1/3 rounded-full blur-3xl' />
        <div className='bg-primary/5 absolute right-0 bottom-0 -z-10 h-1/3 w-1/3 rounded-full blur-3xl' />

        <div className='mx-auto max-w-7xl'>
          <div className='mx-auto mb-16 max-w-3xl text-center'>
            <Badge
              variant='outline'
              className='mb-6 px-4 py-1 text-sm font-medium'
            >
              Testimonials
            </Badge>
            <h2 className='text-foreground mb-6 text-3xl font-bold lg:text-5xl'>
              What Our Customers Say
            </h2>
            <p className='text-muted-foreground text-xl'>
              Don&#39;t just take our word for it. Here&#39;s what our customers
              have to say about their Oylkka experience.
            </p>
          </div>

          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className='w-full'
          >
            <CarouselContent className='-ml-2 md:-ml-4'>
              {[
                {
                  name: 'Jessica Thompson',
                  location: 'New York, USA',
                  avatar: user1,
                  quote:
                    "Oylkka has completely changed how I shop online. The quality of products is exceptional, and their customer service team went above and beyond when I had questions about my order. I've recommended them to all my friends!",
                  rating: 5,
                  product: 'Premium Collection',
                },
                {
                  name: 'Robert Kim',
                  location: 'London, UK',
                  avatar: user2,
                  quote:
                    "I've been shopping with Oylkka for over a year now, and I'm consistently impressed by their attention to detail and the quality of their products. Fast shipping and excellent packaging every time.",
                  rating: 5,
                  product: 'Home Essentials',
                },
                {
                  name: 'Aisha Mohammed',
                  location: 'Toronto, Canada',
                  avatar: user3,
                  quote:
                    "The products I've purchased from Oylkka have exceeded my expectations. Their commitment to quality is evident in everything they sell. The customer support is also top-notch!",
                  rating: 5,
                  product: 'Tech Accessories',
                },
                {
                  name: 'Carlos Rodriguez',
                  location: 'Madrid, Spain',
                  avatar: user1,
                  quote:
                    'Outstanding service and product quality. I was skeptical about ordering online, but Oylkka proved me wrong. Everything arrived perfectly packaged and exactly as described.',
                  rating: 5,
                  product: 'Fashion Items',
                },
                {
                  name: 'Emma Wilson',
                  location: 'Sydney, Australia',
                  avatar: user2,
                  quote:
                    "I love how Oylkka curates their products. Every item I've bought has been of exceptional quality. Their return policy is also very customer-friendly, which gives me confidence when shopping.",
                  rating: 5,
                  product: 'Lifestyle Products',
                },
                {
                  name: 'David Chen',
                  location: 'Singapore',
                  avatar: '/placeholder.svg?height=80&width=80',
                  quote:
                    'Fast international shipping and products that actually match the descriptions. Oylkka has become my go-to for online shopping. The quality-to-price ratio is unbeatable.',
                  rating: 5,
                  product: 'Electronics',
                },
              ].map((testimonial, index) => (
                <CarouselItem
                  // biome-ignore lint: error
                  key={index}
                  className='pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3'
                >
                  <Card className='border-border/40 group h-full shadow-lg transition-all duration-300 hover:shadow-xl'>
                    <CardContent className='flex h-full flex-col p-8'>
                      {/* Rating Stars */}
                      <div className='mb-6 flex justify-center'>
                        {Array(testimonial.rating)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              // biome-ignore lint: error
                              key={i}
                              className='text-primary fill-primary h-5 w-5'
                            />
                          ))}
                      </div>

                      {/* Quote */}
                      <blockquote className='text-foreground mb-6 flex-grow text-center leading-relaxed italic'>
                        &#34;{testimonial.quote}&#34;
                      </blockquote>

                      {/* Product Badge */}
                      <div className='mb-6 text-center'>
                        <Badge variant='secondary' className='text-xs'>
                          {testimonial.product}
                        </Badge>
                      </div>

                      {/* Customer Info */}
                      <div className='flex flex-col items-center space-y-3'>
                        <div className='border-primary/20 group-hover:border-primary/40 h-16 w-16 overflow-hidden rounded-full border-2 transition-colors duration-300'>
                          <Image
                            src={testimonial.avatar || '/placeholder.svg'}
                            alt={testimonial.name}
                            width={64}
                            height={64}
                            className='h-full w-full object-cover'
                          />
                        </div>
                        <div className='text-center'>
                          <p className='text-foreground font-semibold'>
                            {testimonial.name}
                          </p>
                          <div className='text-muted-foreground flex items-center justify-center text-sm'>
                            <MapPin className='mr-1 h-3 w-3' />
                            <span>{testimonial.location}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation */}
            <div className='mt-12 flex items-center justify-center gap-4'>
              <CarouselPrevious className='border-border/40 hover:bg-primary hover:text-primary-foreground hover:border-primary relative inset-auto h-12 w-12 translate-y-0 transition-all duration-300' />
              <div className='flex items-center gap-2'>
                <div className='bg-primary/30 h-2 w-2 rounded-full' />
                <div className='bg-primary h-2 w-2 rounded-full' />
                <div className='bg-primary/30 h-2 w-2 rounded-full' />
              </div>
              <CarouselNext className='border-border/40 hover:bg-primary hover:text-primary-foreground hover:border-primary relative inset-auto h-12 w-12 translate-y-0 transition-all duration-300' />
            </div>
          </Carousel>

          {/* Stats Section */}
          <div className='mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4'>
            <div className='bg-card/50 border-border/40 rounded-xl border p-6 text-center'>
              <p className='text-primary mb-2 text-3xl font-bold'>4.9</p>
              <p className='text-muted-foreground text-sm'>Average Rating</p>
            </div>
            <div className='bg-card/50 border-border/40 rounded-xl border p-6 text-center'>
              <p className='text-primary mb-2 text-3xl font-bold'>10K+</p>
              <p className='text-muted-foreground text-sm'>Reviews</p>
            </div>
            <div className='bg-card/50 border-border/40 rounded-xl border p-6 text-center'>
              <p className='text-primary mb-2 text-3xl font-bold'>98%</p>
              <p className='text-muted-foreground text-sm'>Satisfaction</p>
            </div>
            <div className='bg-card/50 border-border/40 rounded-xl border p-6 text-center'>
              <p className='text-primary mb-2 text-3xl font-bold'>50+</p>
              <p className='text-muted-foreground text-sm'>Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Contact />

      {/* CTA Section */}
      <section className='bg-primary relative overflow-hidden py-12'>
        <div className='bg-grid-white/10 absolute inset-0 -z-10' />
        <div className='absolute -top-24 -right-24 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl' />
        <div className='absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-white/10 blur-3xl' />

        <div className='mx-auto max-w-4xl px-2 text-center'>
          <h2 className='text-foreground mb-6 text-3xl font-bold lg:text-5xl'>
            Ready to Start Shopping?
          </h2>
          <p className='text-foreground/80 mx-auto mb-10 max-w-2xl text-xl'>
            Join thousands of satisfied customers and discover our amazing
            collection of premium products.
          </p>
          <div className='flex justify-center gap-4'>
            <Button size='lg' variant='default' className='group bg-black'>
              Browse Products
              <ChevronRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
            </Button>
            <Button size='lg' variant='outline'>
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
