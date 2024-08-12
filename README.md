
---

# 🌟 Meet Eva : Your Personalized Yoga Companion 

**Eva AI** 
- An innovative approach to yoga practice with the power of AI. Whether you're an experienced yogi or just beginning your journey, Yoga Assistant AI offers tailored sessions that adapt in real-time to your needs, providing a truly personalized yoga experience.


<div align="center">
  <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2hpaDJvc203cm9ucWpiYWw3eDZ5dmlicTgzdnUyYmwyanUxaTdiYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZbhARpDlb5LjR0TyNC/giphy-downsized-large.gif" alt="Eva AI">
</div>




## 🧘 Project Overview

**Yoga Assistant AI** harnesses the Muti-Modal capabilities of Generative AI, specifically leveraging Google’s Gemini 1.5 Pro model, to deliver dynamic and responsive yoga sessions. Our application is designed to guide users through yoga poses with real-time feedback, utilizing modern web technologies to create a seamless and engaging experience. Key features include pose suggestions, real-time speech-to-text processing, and dynamic image fetching for yoga poses using the Google Custom Search API.


## 🌟 Need
In today's busy world, many people struggle to find the time, resources, or access to quality yoga instruction. Whether due to high costs, packed schedules, or geographical limitations, traditional yoga classes aren't always feasible. Furthermore, without proper guidance, there's a risk of injury or improper practice, which can negate the benefits of yoga.

Common Challenges:
- High Costs of Yoga Classes
- Limited Access to Experienced Instructors
- Scheduling Conflicts
- Risk of Incorrect Posture and Potential Injury

## 💡 Solution
Eva AI addresses these challenges by offering a flexible, affordable, and highly personalized yoga experience that anyone can access, anytime, anywhere.

How Eva AI Solves These Issues:
- Affordability: By providing a virtual yoga instructor, Eva AI eliminates the high costs associated with in-person classes.
- Accessibility: With Eva AI, you have a personal yoga instructor available 24/7, ready to guide you through a session tailored to your needs.
- Safety and Effectiveness: The real-time feedback feature ensures that you perform each pose correctly, reducing the risk of injury and enhancing the effectiveness of your practice.
- Customization: Eva AI’s ability to adapt sessions based on your health and mood ensures that your yoga practice is always aligned with your personal needs.

## ✨ Features
1. Real-Time Feedback on Yoga Poses
- Instant Corrections: Eva AI provides real-time feedback on your yoga poses, helping you to correct your posture instantly, ensuring you're always practicing safely and effectively.
- AI-Powered Guidance: The AI-driven instructions adapt based on your performance, ensuring you improve with every session.
2. Personalized Yoga Sessions
- Tailored to Your Health: Eva AI customizes sessions according to your health status, ensuring that your yoga practice aligns with your physical condition and goals.
- Mood-Based Adjustments: Depending on your mood, Eva AI can suggest yoga routines that either energize or relax you, providing a balanced practice that suits your emotional state.
3. Affordable and Accessible Anytime, Anywhere
- Cost-Effective Solution: Eva AI offers an affordable alternative to traditional yoga classes, making quality yoga instruction accessible to everyone.
- 24/7 Availability: Practice yoga at your convenience—any time of the day, anywhere in the world. All you need is an internet connection and your yoga mat!
4. Dynamic Visual Guidance
- Pose Image Fetching: With dynamic image fetching, Eva AI provides visual references for each yoga pose during the session, ensuring you have the guidance you need right when you need it.


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

I welcome contributions! If you’d like to help improve Eva, please fork the repository, make your changes, and submit a pull request. Together, we can create an even more powerful yoga tool.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
