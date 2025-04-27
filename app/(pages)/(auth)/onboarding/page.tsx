"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { onboardingSchema } from "@/schemas";
import { useOnboardingMutation } from "@/services";

import ShopInfoSection from "./shop-info-section";
import UserInfo from "./user-info";

export default function InputForm() {
  const session = useSession();
  const router = useRouter();

  // Initialize form with default values
  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      id: "",
      name: "",
      username: "",
      email: "",
      role: "CUSTOMER",
      phone: "",
      shopName: "",
      shopSlug: "",
      shopCategory: "",
      shopAddress: "",
      shopDescription: "",
      shopEmail: "",
      shopPhone: "",
      socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        website: "",
      },
    },
  });

  // Load user data from session
  useEffect(() => {
    if (session.data?.user) {
      form.reset({
        ...form.getValues(),
        id: session.data.user.id,
        name: session.data.user.name || "",
        email: session.data.user.email || "",
        avatar: session.data.user.image,
        role: session.data.user.role || "CUSTOMER",
      });
    }
  }, [session.data?.user, form]);

  // Setup mutation for form submission
  const { mutate, isPending } = useOnboardingMutation({
    onSuccess: () => {
      // Redirect or update UI on success
      router.push("/dashboard");
    },
  });

  // Form submission handler
  function onSubmit(data: z.infer<typeof onboardingSchema>) {
    mutate(data);
  }

  // Check if the role is vendor to show shop info section
  const isVendor = form.watch("role") === "VENDOR";

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Complete Your Profile
      </h1>
      <p className="text-muted-foreground mb-8 text-center">
        Please provide your information to get started
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="container mx-auto max-w-5xl space-y-8"
        >
          <UserInfo />

          {isVendor && <ShopInfoSection />}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[120px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
