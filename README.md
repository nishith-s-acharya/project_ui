# Aidoc - AI Healthcare Assistant

A modern, AI-powered healthcare dashboard that helps users find medication recommendations and locate nearby hospitals.

## Features

- **AI Symptom Checker**: personalized medication recommendations based on symptoms and user profile (age, pregnancy status, medical conditions).
- **Hospital Locator**: Find nearby hospitals and clinics with detailed information and navigation.
- **Health Dashboard**: Overview of health metrics and quick access to services.
- **Secure Authentication**: User onboarding and profile management.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nishith-s-acharya/project_ui.git
    cd project_ui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory if one doesn't exist. You may need to add necessary API keys (e.g., Clerk, Mapbox, etc., if applicable).
    *(Note: If the project uses specific keys, ask the repository owner for the `.env` file)*

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Open in your browser:**
    Navigate to `http://localhost:5173` (or the URL shown in your terminal).

## Building for Production

To create a production build:

```bash
npm run build
```

## Technologies Used

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Shadcn/UI**
- **Leaflet Maps**
