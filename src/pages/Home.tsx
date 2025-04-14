
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGradientBackground } from '@/components/ui/animated-gradient-background';
import { motion } from 'framer-motion';

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Project Management",
      description: "Build your dream team and get AI-powered task assignments.",
      path: "/project-manager",
      color: "bg-kage-purple"
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "Code Assistant",
      description: "Analyze and optimize your code with advanced AI guidance.",
      path: "/code-assistant",
      color: "bg-kage-accent"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "AI Chat",
      description: "Get real-time answers to technical questions from KAGE.",
      path: "/ai-chat",
      color: "bg-kage-purple-light"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <AnimatedGradientBackground className="py-20 md:py-32">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold tracking-tight font-heading"
              variants={fadeInUp}
            >
              <span className="text-kage-purple-light">KAGE</span> the Shadow Leader
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground"
              variants={fadeInUp}
            >
              An AI-powered assistant for project management and technical guidance
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="bg-kage-purple hover:bg-kage-purple-dark">
                <Link to="/project-manager">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/ai-chat">Chat with KAGE</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedGradientBackground>
      
      {/* Features Section */}
      <section className="py-20 bg-kage-gray-dark">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight font-heading mb-4">Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              KAGE provides advanced AI capabilities to support your development journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-kage-gray rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`${feature.color} w-12 h-12 rounded-md flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 font-heading">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Button asChild variant="ghost" className="text-kage-purple-light hover:text-kage-purple hover:bg-kage-purple/10">
                  <Link to={feature.path}>
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-kage-purple bg-opacity-10">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight font-heading mb-4">
            Ready to elevate your development process?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join the ranks of developers and team leaders using KAGE to streamline project management,
            optimize code, and get rapid answers to technical challenges.
          </p>
          <Button asChild size="lg" className="bg-kage-purple hover:bg-kage-purple-dark">
            <Link to="/project-manager">Start Your First Project</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
