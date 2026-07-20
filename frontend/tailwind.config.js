export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        md: "768px", //tablets
        lg: "1024px", //laptops
        xl: "1280px", //desktop screens
      },
    },
  },
  plugins: [],
}