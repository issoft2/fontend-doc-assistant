import { Link } from "react-router-dom";

import { motion } from 'framer-motion';
import heroImage from "../assets/images/download.webp";

interface HeroProps {
  title: string;
  subtitle: string
}

const Hero = ({title, subtitle}: HeroProps ) => {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0613] pt-32 pb-10 font-light text-white antialiased md:pt-20 md:pb-16"
      style={{
        background: 'linear-gradient(135deg, #0a0613 0%, #150d27 100%)',
      }}
    >
      <div
        className="absolute top-0 right-0 h-1/2 w-1/2"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)',
        }}
      />
      <div
        className="absolute top-0 left-0 h-1/2 w-1/2 -scale-x-100"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)',
        }}
      />

      <div className="relative z-10 container mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="mb-6 inline-block rounded-full border border-[#9b87f5]/30 px-3 py-1 text-xs text-[#9b87f5]">
            {title }
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Smarter Knowledge with{' '}
            <span className="text-[#9b87f5]">AI-Powered</span> Assistant
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
            {subtitle}
          </p>

          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:mb-0 sm:flex-row">
            <Link
              to="/docs/get-started"
              className="neumorphic-button hover:shadow-[0_0_20px_rgba(155, 135, 245, 0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#9b87f5]/30 sm:w-auto"
            >
              Get Started
            </Link>
            <a
              href="#how-it-works"
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
            >
              <span>Learn how it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </a>
          </div>
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        >
          <div className="relative flex h-[400px] w-full items-center justify-center md:h-[500px]">
            
            <motion.img
              src={heroImage}
              className="relative rounded-full object-cover w-72 h-72 md:w-96 md:h-96 opacity-90 shadow-2xl border border-white/10"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "mirror", // 'mirror' makes the loop seamless and soft
                ease: "easeInOut",
              }}
            />

            <div className="absolute h-64 w-64 bg-[#9b87f5]/20 blur-[100px] -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero

