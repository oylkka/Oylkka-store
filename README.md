# Oylkka - E-commerce Platform

![CI](https://github.com/parvez/oylkka/actions/workflows/ci.yml/badge.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![linting: eslint](https://img.shields.io/badge/linting-eslint-4B32C3.svg?style=flat-square)](https://eslint.org/)

Welcome to the Oylkka project! This is a private, modern, full-stack e-commerce platform built with a powerful and scalable tech stack.

## 🖼️ Visuals

_(It is highly recommended to add a few screenshots or a GIF of the application here to give developers a quick visual overview of the UI and key features.)_

## ✨ Features

- **Secure User Authentication:** Powered by NextAuth.js for robust and secure user management.
- **Complete Product Management:** A full suite of tools for adding, editing, and managing products.
- **Seamless Shopping Cart:** A persistent and user-friendly shopping cart experience.
- **Efficient Checkout Process:** A streamlined checkout flow with integrated payment solutions.
- **Comprehensive Admin Dashboard:** An intuitive dashboard for managing orders, customers, and store settings.
- **Fully Responsive Design:** A mobile-first approach ensuring a great experience on all devices.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [TanStack Query](https://tanstack.com/query/v5)
- **Validation:** [Zod](https://zod.dev/)
- **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

## 📦 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher recommended)
- [pnpm](https://pnpm.io/)
- A [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud-hosted)

### 2. Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd Oylkka
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file by copying the example file:

    ```bash
    cp .env.example .env.local
    ```

    Now, fill in the variables in `.env.local`.

4.  **Apply the database schema:**

    ```bash
    pnpm prisma db push
    ```

    _Note: `prisma migrate` is not typically used with MongoDB in Prisma. `db push` syncs the schema to the database._

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

The application should now be running at [http://localhost:3000](http://localhost:3000).

### 3. Environment Variables

A `.env.example` file should be created to show all required environment variables.

| Variable          | Description                                    |
| ----------------- | ---------------------------------------------- |
| `MONGODB_URI`     | Your MongoDB connection string.                |
| `NEXTAUTH_URL`    | The canonical URL of your app.                 |
| `NEXTAUTH_SECRET` | A secret key for NextAuth.js.                  |
| `CLOUDINARY_URL`  | API environment variable for Cloudinary.       |
| `BKASH_...`       | Credentials for the Bkash payment gateway.     |
| `GOOGLE_...`      | Credentials for Google APIs (e.g., for OAuth). |

## 📜 Available Scripts

- `pnpm dev`: Starts the development server with Turbopack.
- `pnpm build`: Creates a production-ready build.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Lints the codebase for errors and style issues.
- `pnpm fix`: Automatically fixes linting issues.
- `pnpm format`: Formats the code using Prettier.
- `pnpm test`: Runs the test suite using Jest.
- `pnpm test:watch`: Runs tests in watch mode.

## 🚀 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to your Git repository (GitHub, GitLab, etc.).
2.  Import the project into Vercel.
3.  Set the environment variables in the Vercel project settings.
4.  Vercel will automatically build and deploy the application upon each push to the main branch.

## 🤝 Contributing

As this is a private repository, contributions are managed internally. Please follow these guidelines:

1.  Create a new branch for each feature or bug fix (`feature/new-thing` or `fix/broken-thing`).
2.  Follow the established code style and conventions.
3.  Ensure all tests pass before submitting a pull request.
4.  Provide a clear and descriptive pull request message.

---

_This is a private repository. Please do not distribute._
