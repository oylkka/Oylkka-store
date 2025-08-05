import { auth } from '@/features/auth/auth';
import { DeleteImage, UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Corrected: Use an if statement for early return
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const userId = session.user.id; // Now userId is guaranteed to exist

    const ratingStr = formData.get('rating') as string;
    const productId = formData.get('productId') as string;
    const orderId = formData.get('orderId') as string; // Optional
    const title = formData.get('title') as string; // Optional
    const content = formData.get('content') as string; // Required in schema

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      );
    }

    // userId is now guaranteed by the early return, no need for this check unless userId could be null
    // after session check for some other reason (e.g. if session.user.id was optional in type)
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: 'User ID is required' },
    //     { status: 400 }
    //   );
    // }

    if (!ratingStr) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Review content is required' },
        { status: 400 },
      );
    }

    // Convert rating to number and validate
    const rating = Number(ratingStr);
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 },
      );
    }

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[];
    const uploadedImages = [];

    if (imageFiles.length > 0) {
      try {
        for (const file of imageFiles) {
          if (file.size > 0) {
            // Upload to Cloudinary
            const uploadResult = await UploadImage(file, 'reviews');

            uploadedImages.push({
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              alt: `Review image for ${existingProduct.productName || 'product'}`,
            });
          }
        }
        // biome-ignore lint: error
      } catch (uploadError) {
        return NextResponse.json(
          {
            error: 'Failed to upload images',
          },
          { status: 500 },
        );
      }
    }

    // Create the review
    const review = await db.review.create({
      data: {
        productId: productId,
        userId: userId,
        orderId: orderId || undefined,
        rating: rating,
        title: title || undefined,
        content: content,
        images: uploadedImages,
        verified: false, // You can implement verification logic later
        helpful: 0,
        reported: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            // Add other safe user fields you want to include
          },
        },
        product: {
          select: {
            id: true,
            productName: true,
            // Add other product fields you want to include
          },
        },
      },
    });

    await db.notification.create({
      data: {
        type: 'INFO',
        avatar: existingProduct.images[0].url,
        title: 'New Review',
        recipientId: userId,
        message: `Your product ${existingProduct.productName} has a new review!`,
        actionUrl: `/products/${existingProduct.slug}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review created successfully',
        review: review,
      },
      { status: 201 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId'); // Optional: for checking user's review status
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // 'createdAt', 'rating', 'helpful'
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // 'asc', 'desc'

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 },
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch all reviews for calculations (without pagination)
    const allReviews = await db.review.findMany({
      where: { productId: productId },
      select: {
        id: true,
        rating: true,
        userId: true,
      },
    });

    // Calculate basic stats
    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? parseFloat(
            (
              allReviews.reduce((acc, review) => acc + review.rating, 0) /
              totalReviews
            ).toFixed(2),
          )
        : 0;

    // Calculate rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating as keyof typeof ratingCounts]++;
      }
    });

    const ratingDistribution = Object.entries(ratingCounts)
      .map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
        percentage:
          totalReviews > 0
            ? parseFloat(((count / totalReviews) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.rating - a.rating);

    // Check if current user has reviewed (if userId provided)
    let currentUserReview = null;
    let hasUserReviewed = false;
    if (userId) {
      currentUserReview =
        allReviews.find((review) => review.userId === userId) || null;
      hasUserReviewed = !!currentUserReview;
    }

    // Build sort options
    // biome-ignore lint: error
    const sortOptions: any = {};
    switch (sortBy) {
      case 'rating':
        sortOptions.rating = sortOrder;
        break;
      case 'helpful':
        sortOptions.helpful = sortOrder;
        break;

      default:
        sortOptions.createdAt = sortOrder;
        break;
    }

    // Fetch paginated reviews with full details
    const reviews = await db.review.findMany({
      where: { productId: productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: sortOptions,
      skip: offset,
      take: limit,
    });

    // Process reviews for frontend consumption
    const processedReviews = reviews.map((review) => ({
      ...review,
      isVerified: review.verified || false,
      timeAgo: formatDistanceToNow(review.createdAt, { addSuffix: true }),
      canEdit: userId ? review.userId === userId : false,
      canDelete: userId ? review.userId === userId : false,
    }));

    // Return comprehensive data
    return NextResponse.json(
      {
        // Basic stats
        averageRating,
        totalReviews,
        ratingDistribution,

        // User-specific data
        currentUserReview: currentUserReview
          ? {
              id: currentUserReview.id,
              hasReviewed: true,
            }
          : null,
        hasUserReviewed,

        // Paginated reviews
        reviews: processedReviews,

        // Pagination info
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          hasNextPage: offset + limit < totalReviews,
          hasPreviousPage: page > 1,
          totalItems: totalReviews,
          itemsPerPage: limit,
        },

        // Sorting info
        sorting: {
          sortBy,
          sortOrder,
        },

        // Legacy fields for backward compatibility
        ratingCount: totalReviews,
        allReviewsDetails: processedReviews,
      },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 },
      );
    }

    // Fetch the review to check ownership and get image data
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if user owns the review or is admin
    const isOwner = existingReview.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own reviews' },
        { status: 403 },
      );
    }

    // Delete images from Cloudinary if they exist
    if (existingReview.images && Array.isArray(existingReview.images)) {
      // biome-ignore lint: error
      for (const image of existingReview.images as any[]) {
        if (image.publicId) {
          await DeleteImage(image.publicId);
        }
      }
    }

    // Delete the review from database
    await db.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully',
      },
      { status: 200 },
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
