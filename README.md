<div align="center">
  <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExem1sdWVzaGw0cTZianI3eWRqbjJ6d3RmOHF2M2VsZzl4YnJ6cTdzZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xTiTnHN9JLODvS1fr2/giphy.gif" alt="Eva AI">
</div>

---

# 🌟 Meet Eva: Your Personalized Yoga Companion 🌟

Welcome to **Eva AI**, an innovative approach to yoga practice with the power of AI. Whether you're an experienced yogi or just beginning your journey, Yoga Assistant AI offers tailored sessions that adapt in real-time to your needs, providing a truly personalized yoga experience.

## 🧘 Project Overview

**Yoga Assistant AI** harnesses the Muti-Modal capabilities of Generative AI, specifically leveraging Google’s Gemini 1.5 Pro model, to deliver dynamic and responsive yoga sessions. Our application is designed to guide users through yoga poses with real-time feedback, utilizing modern web technologies to create a seamless and engaging experience. Key features include pose suggestions, real-time speech-to-text processing, and dynamic image fetching for yoga poses using the Google Custom Search API.

## ✨ Key Achievements

### Backend Enhancements
1. **Pose Image Fetching**: 
   - Integrated the Google Custom Search API to dynamically fetch and display relevant yoga pose images according to the pose selection by gemini during sessions, enhancing the visual guidance for users.

2. **AI Session Flow Management**: 
   - Improved AI capabilities to manage and transition between yoga poses smoothly, ensuring a fluid and uninterrupted session experience for users.

### Frontend Enhancements
1. **Dynamic Image Display**: 
   - Implemented functionality within the `YogaSessionPage` to dynamically display fetched pose images, enriching the visual aspect of the user experience.

2. **UI/UX Improvements**: 
   - Enhanced the overall layout for better responsiveness and usability across various devices, making the app more accessible and user-friendly.

## 📁 Current File Structure

```bash
yoga/
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Camera.tsx
│   │   │   ├── AnimatedSpeaker.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Login.tsx
│   │   │   └── PoseImage.tsx 
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   └── YogaSessionPage.tsx
│   │   ├── services/
│   │   │   ├── geminiService.ts
│   │   │   ├── sessionService.ts
│   │   │   ├── speechToTextService.ts
│   │   │   └── poseImageService.ts 
│   │   ├── utils/
│   │   │   └── speechUtils.ts
│   │   ├── styles/
│   │   │   ├── YogaSessionPage.css
│   │   │   └── AnimatedSpeaker.css
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── server/
│   ├── config/
│   │   └── firebaseConfig.js
│   ├── routes/
│   │   ├── apiRoutes.js
│   │   ├── chatRoutes.js
│   │   └── poseImageRoute.js 
│   ├── services/
│   │   ├── chatService.js
│   │   ├── geminiService.js
│   │   └── poseImageService.js 
│   ├── .env
│   ├── index.js
│   └── package.json
├── .gitignore
└── README.md
```

## 💻 Technologies Used

### Frontend
- **React**: Builds the user interface with a component-based architecture.
- **TypeScript**: Provides type safety, ensuring better code quality and maintainability.
- **CSS**: Custom styles for creating a responsive and visually appealing UI.

### Backend
- **Express.js**: Handles server-side operations, managing API requests and integration with the frontend.
- **Firebase**: Powers authentication and data storage, providing a robust and secure backend solution.
- **Google Custom Search API**: Dynamically fetches images of yoga poses based on user input, enhancing the visual guidance in sessions.

### AI Integration
- **Google Gemini 1.5 Pro**: Drives the AI capabilities for session management and dynamic pose suggestions, adapting the flow of yoga sessions to suit the user’s needs.

## 🚀 Installation

Get up and running with Yoga Assistant AI in just a few steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/joyalkenus/Eva_Yoga.git
   ```

2. **Install dependencies**:
   Navigate to both the `client` and `server` directories and run:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Create a Firebase project and add your configuration in `firebaseConfig.js`.

4. **Add Environment Variables**:
   - Securely place your API keys and sensitive information in a `.env` file.

5. **Run the Application**:
   - Start the backend:
     ```bash
     cd server
     npm start
     ```
   - Start the frontend:
     ```bash
     cd client
     npm start
     ```

## 🌐 Usage

- Access the app at `http://localhost:3000`.
- Sign in using Google Authentication.
- Begin your yoga session and enjoy real-time, AI-driven instructions and feedback.

## 🤝 Contributing

We welcome contributions! If you’d like to help improve Eva, please fork the repository, make your changes, and submit a pull request. Together, we can create an even more powerful yoga tool.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
