'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Chatbot } from '@/components/chatbot'
import { SubmitResume } from '@/components/submitResume'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useAuth, SignInButton } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      toast.info('Login to access forms', {
        description: 'You can browse the site, but login is required to submit forms.',
        duration: 3000,
        closeButton: true,
      })
    }
  }, [isSignedIn, isLoaded])

  // Check if mobile and update on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chefTypes = [
    {
      number: "01.",
      title: "Indian Tandoor",
      description: "A skilled culinary role specializing in the operation and mastery of the tandoor oven. This involves preparing a variety of Indian breads (like naan and roti), grilling meats (such as tandoori chicken and kebabs), and ensuring dishes have the authentic smoky flavor characteristic of tandoor cooking. They understand heat control and marination techniques specific to tandoor items."
    },
    {
      number: "02.",
      title: "Indian Commi",
      description: "An entry-level chef in the Indian kitchen, assisting senior chefs with food preparation. This includes chopping vegetables, preparing spice mixes, marinating ingredients, and maintaining a clean and organized work station. They are learning the fundamentals of Indian cuisine and developing their culinary skills under supervision."
    },
    {
      number: "03.",
      title: "Chinese Commi",
      description: "Similar to the Indian Commi, this role is an entry-level position within the Chinese kitchen. Responsibilities involve assisting chefs with prepping ingredients like vegetables, meats, and sauces according to Chinese culinary techniques. They learn about stir-frying, steaming, and other essential Chinese cooking methods while maintaining kitchen hygiene."
    },
    {
      number: "04.",
      title: "Kitchen Helper",
      description: "A support role in the kitchen responsible for basic tasks such as cleaning dishes and kitchen equipment, maintaining sanitation standards, and assisting with food preparation as directed by chefs. They ensure the smooth operation of the kitchen by handling essential but less specialized duties."
    },
    {
      number: "05.",
      title: "Head Chef",
      description: "The culinary leader of the kitchen, responsible for overseeing all food preparation, menu planning, and kitchen staff management. They ensure food quality, consistency, and cost-effectiveness, while also maintaining hygiene standards and often contributing to the restaurant's overall culinary vision."
    }
  ]

  // Auto-scroll effect for desktop carousel only
  useEffect(() => {
    if (isMobile) return; // Don't auto-scroll on mobile
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(chefTypes.length / 3));
    }, 4000);

    return () => clearInterval(interval);
  }, [isMobile, chefTypes.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(chefTypes.length / 3));
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(chefTypes.length / 3)) % Math.ceil(chefTypes.length / 3));
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative text-white min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/3217157/pexels-photo-3217157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Chef in a modern kitchen"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              Find Your Perfect Chef
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-gray-200"
            >
              Connect with skilled culinary professionals for your restaurant or business
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/findchefs">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
                  Find Chefs
                </Button>
              </Link>
              <Link href="/findchef">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg">
                  Browse Resumes
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chef Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Types of Chefs We Connect
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From entry-level kitchen helpers to experienced head chefs, we have a diverse pool of culinary talent
            </p>
          </motion.div>

          {/* Desktop Carousel */}
          <div className="hidden md:block relative">
            <motion.div 
              animate={{ x: -currentSlide * 100 + '%' }}
              transition={{ duration: 0.5 }}
              className="flex gap-8"
            >
              {chefTypes.map((chef, index) => (
                <div key={index} className="w-1/3 flex-shrink-0">
                  <Card className="p-8 h-full bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-orange-500 font-bold text-lg mb-4">{chef.number}</div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">{chef.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{chef.description}</p>
                  </Card>
                </div>
              ))}
            </motion.div>
            
            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Mobile Grid */}
          <div className="md:hidden grid grid-cols-1 gap-6">
            {chefTypes.map((chef, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-white shadow-lg">
                  <div className="text-orange-500 font-bold text-lg mb-3">{chef.number}</div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">{chef.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{chef.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Resume Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Are You a Chef Looking for Opportunities?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Submit your resume and connect with potential employers
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <SubmitResume />
          </motion.div>
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
