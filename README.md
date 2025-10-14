# Firebase Studio

This is a Next.js starter project built in Firebase Studio. It features a simple sentence explorer that fetches quotes from an external API.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Running Locally

1.  **Install dependencies:**
    Open your terminal in the project's root directory and run the following command to install the necessary packages:

    ```bash
    npm install
    ```

2.  **Run the development server:**
    After the installation is complete, start the Next.js development server:

    ```bash
    npm run dev
    ```

3.  **Open the app:**
    Open your web browser and navigate to [http://localhost:9002](http://localhost:9002) to see your application running.

---

## Deploying to Vercel

You can deploy this Next.js application to Vercel using two primary methods: Git integration or the Vercel CLI.

### Option 1: Deploy with Git Integration (Recommended)

This is the easiest way to deploy your app and set up automatic deployments.

1.  **Push to a Git Repository:**
    Make sure your project is on a Git provider like [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or [Bitbucket](https://bitbucket.org/).

2.  **Sign up for Vercel:**
    If you don't have a Vercel account, sign up for free at [vercel.com](https://vercel.com/signup).

3.  **Import Your Project:**
    - From your Vercel dashboard, click **"Add New..." > "Project"**.
    - In the "Import Git Repository" section, find and select your project's repository. Vercel will automatically detect that it's a Next.js project.
    - Vercel will pre-fill the build settings. You can leave them as they are.

4.  **Deploy:**
    Click the **"Deploy"** button. Vercel will build and deploy your application. Once finished, you'll get a public URL for your live site. Any future pushes to your main branch will automatically trigger a new deployment.

### Option 2: Deploy with Vercel CLI

This method allows you to deploy directly from your local machine.

1.  **Set up a Vercel Account:**
    If you don't have a Vercel account, sign up for free at [vercel.com](https://vercel.com/signup).

2.  **Install the Vercel CLI:**
    Open your terminal and install the Vercel Command Line Interface (CLI) globally.

    ```bash
    npm install -g vercel
    ```

3.  **Log in to Vercel:**
    Link your local machine to your Vercel account.

    ```bash
    vercel login
    ```

4.  **Deploy Your Project:**
    Navigate to your project's root directory in the terminal and run the command:

    ```bash
    vercel
    ```

The Vercel CLI will guide you through the rest of the process, and you'll get a public URL for your live application once it's complete.
