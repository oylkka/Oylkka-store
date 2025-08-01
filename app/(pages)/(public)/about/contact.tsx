'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
  AtSign,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const FormSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' }),
  phoneNumber: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function Contact() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      phoneNumber: '',
      email: '',
      message: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await toast.promise(axios.post('/api/email/contact', data), {
      loading: 'Sending your message...',
      success: () => {
        form.reset();
        return 'Your message was successfully sent';
      },
      error: 'Failed to send your message',
    });
  }

  return (
    <section className='px-2 py-12'>
      <div className='mx-auto max-w-6xl'>
        {/* Contact Grid */}
        <div className='grid items-center gap-16 lg:grid-cols-2'>
          {/* Info Card */}
          <div className='space-y-8'>
            <Badge variant='outline' className='px-4 py-1 text-sm font-medium'>
              Get In Touch
            </Badge>
            <h2 className='text-foreground text-3xl font-bold lg:text-5xl'>
              Contact Us
            </h2>
            <p className='text-muted-foreground text-xl'>
              Have questions or feedback? We&#39;d love to hear from you. Our
              team is ready to assist you with any inquiries.
            </p>

            <div className='space-y-6'>
              <div className='flex items-center gap-4'>
                <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                  <Mail className='text-primary h-6 w-6' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Email</p>
                  <p className='text-foreground font-medium'>
                    contact@oylkka.com
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                  <Phone className='text-primary h-6 w-6' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Phone</p>
                  <p className='text-foreground font-medium'>
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                  <MapPin className='text-primary h-6 w-6' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Location</p>
                  <p className='text-foreground font-medium'>
                    123 Commerce St, New York, NY 10001
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className='relative'>
            <div className='bg-primary/5 absolute inset-0 -z-10 -translate-x-1/4 -translate-y-1/4 transform rounded-full blur-3xl' />
            <Card className='border-border/40 overflow-hidden shadow-lg'>
              <CardContent className='space-y-6'>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-6'
                  >
                    <div className='grid gap-6 sm:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='username'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <User className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                                <Input
                                  className='pl-10'
                                  placeholder='John Doe'
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='phoneNumber'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Phone className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                                <Input
                                  className='pl-10'
                                  placeholder='+1 (555) 000-0000'
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <AtSign className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                              <Input
                                className='pl-10'
                                placeholder='you@example.com'
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='message'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <MessageSquare className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
                              <Textarea
                                className='min-h-[150px] resize-none pl-10'
                                placeholder='How can we help you?'
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type='submit'
                      className='group w-full sm:w-auto'
                      size='lg'
                    >
                      <Send className='mr-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                      Send Message
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
