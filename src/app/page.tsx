"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Users,
  Zap,
  Target,
  ArrowRight,
  Plus,
  Minus,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useState } from "react";

export default function HireAILanding() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number | null) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="relative w-full overflow-hidden bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Hire
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              AI
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Reviews
            </a>
          </div>
          {/* <Button variant="outline">Login</Button> */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute bottom-0 left-0 w-full h-[60vh] z-0 animate-float"
          style={{
            backgroundImage: "url(/illustration.png)",
            backgroundSize: "100% 100%",
            backgroundPosition: "bottom center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <Badge className="mb-6 bg-purple-500/20 text-white border-purple-500/30">
            ✨ Introducing Erwin's Revolutionary AI
          </Badge>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 text-white">
            HireAI
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The AI search engine that understands who you're looking for.
            <span className="text-white font-semibold">
              {" "}
              Discover and unlock talent density at scale.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-10 justify-center items-center mb-12">
            <a href="/search">
              <Button
                variant={"ghost"}
                className="relative cursor-pointer h-12 px-8 py-4 text-lg font-poppins font-medium text-white rounded-xl overflow-hidden group
                         [background:linear-gradient(45deg,theme(colors.black)_50%,theme(colors.gray.900)_100%)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.gray.600/.3)_0%,theme(colors.blue.500)_15%,theme(colors.purple.500)_30%,theme(colors.pink.500)_45%,theme(colors.blue.500)_60%,theme(colors.gray.600/.3)_80%)_border-box] 
                         border-2 border-transparent animate-border-spin
                         hover:scale-105 transition-transform duration-300"
              >
                <span className="">Get Started</span>
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </Button>
            </a>

            <a href="https://www.loom.com/share/e89c76cacdc44e788ea74dc988eccaa1?sid=77717f23-5fa5-48d1-82a1-512d6af3746d">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 border-gray-600 text-gray-300 hover:border-purple-400 transition-all duration-300 cursor-pointer"
              >
                Watch Demo
              </Button>
            </a>
          </div>

          {/* <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <Badge className="flex items-center space-x-2 bg-black text-white text-sm p-1">
              <Check className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </Badge>
            <Badge className="flex items-center space-x-2 bg-black text-white text-sm p-1">
              <Check className="w-4 h-4 text-green-400" />
              <span>14-day free trial</span>
            </Badge>
          </div> */}
        </div>
      </section>

      {/* Problem Section */}
      {/* <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white animate-pulse-slow">
            Hiring is Broken
          </h2>
          <p className="text-xl text-gray-300 mb-16 max-w-4xl mx-auto">
            Traditional recruitment methods are failing companies worldwide. The
            best talent remains hidden while hiring managers drown in irrelevant
            applications.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gray-900/50 border-red-500/30 hover:border-red-400 transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white">87% Time Wasted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Recruiters spend most of their time sifting through
                  unqualified candidates
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-red-500/30 hover:border-red-400 transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-red-400">$240B Lost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Annual cost of bad hires and prolonged vacancy periods
                  globally
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-red-500/30 hover:border-red-400 transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-red-400">42 Days Average</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Time to fill critical positions while productivity suffers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Transformation Section */}
      <section className="py-24 px-6 bg-gradient-to-b ">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
            Imagine If...
          </h2>
          <p className="text-xl text-gray-300 mb-16 max-w-4xl mx-auto">
            What if you could find the perfect candidate in minutes, not months?
            What if AI could understand not just keywords, but potential?
          </p>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-pink-500/40 blur-3xl"></div>
            <Card className="relative bg-black p-8 max-w-4xl mx-auto">
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">
                      Instant Talent Discovery
                    </h3>
                    <p className="text-gray-400">
                      Find candidates who match your culture, not just your job
                      description
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">
                      Precision Matching
                    </h3>
                    <p className="text-gray-400">
                      AI understands context, potential, and hidden talents
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-white">
                      Scale Effortlessly
                    </h3>
                    <p className="text-gray-400">
                      From startups to enterprises, grow your team with
                      confidence
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 mb-8">
            Trusted by forward-thinking companies
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-gray-500">TechCorp</div>
            <div className="text-2xl font-bold text-gray-500">InnovateLabs</div>
            <div className="text-2xl font-bold text-gray-500">FutureScale</div>
            <div className="text-2xl font-bold text-gray-500">NextGen</div>
            <div className="text-2xl font-bold text-gray-500">CloudFirst</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Everything you need to revolutionize your hiring process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Search",
                description:
                  "Natural language queries that understand intent and context",
                icon: "🔍",
              },
              {
                title: "Smart Matching",
                description:
                  "Advanced algorithms that go beyond keyword matching",
                icon: "🎯",
              },
              {
                title: "Talent Analytics",
                description:
                  "Deep insights into candidate potential and market trends",
                icon: "📊",
              },
              {
                title: "Seamless Integration",
                description: "Works with your existing ATS and HR tools",
                icon: "🔗",
              },
              {
                title: "Real-time Updates",
                description: "Live candidate availability and status tracking",
                icon: "⚡",
              },
              {
                title: "Team Collaboration",
                description: "Share insights and coordinate hiring decisions",
                icon: "👥",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className=" transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 group bg-black"
              >
                <CardHeader>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-white transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Simple Pricing
          </h2>
          <p className="text-xl text-gray-400 mb-16">
            Choose the plan that scales with your hiring needs
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-black border-gray-700 hover:border-gray-600 hover:scale-102 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Starter</CardTitle>
                <CardDescription className="text-gray-400">
                  Perfect for small teams
                </CardDescription>
                <div className="text-4xl font-bold text-white mt-4">
                  $49<span className="text-lg text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Up to 10 searches/month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Basic AI matching</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Email support</span>
                </div>
                <Button className="w-full mt-6 hover:bg-neutral-400">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:scale-107 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500 hover:border-purple-400 transition-all duration-300 transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  Professional
                </CardTitle>
                <CardDescription className="text-gray-300">
                  For growing companies
                </CardDescription>
                <div className="text-4xl font-bold text-white mt-4">
                  $149<span className="text-lg text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Unlimited searches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Advanced AI matching</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Analytics dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Priority support</span>
                </div>
                <Button className="text-white w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-800 hover:to-pink-800">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black hover:scale-102 border-gray-700 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  Enterprise
                </CardTitle>
                <CardDescription className="text-gray-400">
                  For large organizations
                </CardDescription>
                <div className="text-4xl font-bold text-white mt-4">Custom</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Custom integrations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Dedicated support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">SLA guarantee</span>
                </div>
                <Button variant="outline" className="w-full mt-6 ">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Head of Talent, TechFlow",
                content:
                  "HireAI reduced our time-to-hire by 70%. The AI actually understands what we're looking for beyond just keywords.",
                rating: 5,
              },
              {
                name: "Marcus Rodriguez",
                role: "Founder, StartupLab",
                content:
                  "As a startup, we can't afford bad hires. HireAI helps us punch above our weight in the talent market.",
                rating: 5,
              },
              {
                name: "Emily Watson",
                role: "VP People, ScaleUp",
                content:
                  "The insights from HireAI have transformed how we think about talent acquisition. Game-changing.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="bg-black transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-neutral-400 font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How does HireAI's AI matching work?",
                answer:
                  "Our AI analyzes multiple data points including skills, experience, cultural fit indicators, and career trajectory to provide highly accurate candidate matches that go beyond simple keyword matching.",
              },
              {
                question: "Can HireAI integrate with our existing ATS?",
                answer:
                  "Yes, HireAI seamlessly integrates with most popular ATS platforms including Greenhouse, Lever, Workday, and BambooHR through our API and pre-built connectors.",
              },
              {
                question: "What's the typical ROI for companies using HireAI?",
                answer:
                  "Companies typically see a 3-5x ROI within the first year through reduced time-to-hire, lower recruitment costs, and improved hire quality. The average time-to-hire decreases by 60-80%.",
              },
              {
                question: "Is there a free trial available?",
                answer:
                  "Yes, we offer a 14-day free trial with full access to all Professional plan features. No credit card required to start.",
              },
              {
                question: "How do you ensure candidate privacy?",
                answer:
                  "We're fully GDPR and CCPA compliant. All candidate data is encrypted, and we only work with publicly available information or data that candidates have explicitly consented to share.",
              },
            ].map((faq, index) => (
              <Card key={index} className="">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-white">
                      {faq.question}
                    </CardTitle>
                    <ArrowUp
                      className={`w-5 h-5 text-white ${
                        openFAQ === index
                          ? "rotate-180 transition-all"
                          : "rotate-0 transition-all"
                      }`}
                    />
                  </div>
                </CardHeader>
                {openFAQ === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br/50 from-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-purple-100 mb-12 max-w-3xl mx-auto">
            Join thousands of companies who've revolutionized their talent
            acquisition with HireAI. Start your free trial today and see the
            difference AI-powered hiring can make.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="relative h-12 px-12 text-lg font-semibold transform hover:scale-105 transition-all duration-300">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <a href="https://calendar.app.google/CKGkoAdaCXrPi4Tf6">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-12 border-white text-white hover:bg-white/10 text-xl transition-all duration-300 cursor-pointer"
              >
                Schedule Demo
              </Button>
            </a>
          </div>

          <div className="flex items-center justify-center space-x-8 mt-8 text-sm">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-300" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-300" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-300" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-20 px-6 bg-gradient-to-b from-black to-gray-950 border-t border-gray-800 overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main footer content */}
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            {/* Brand column - wider */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  Hire
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    AI
                  </span>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Revolutionizing talent acquisition with AI-powered precision.
                Find the perfect match, faster than ever before.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://x.com/CerealFound"
                  className="group w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/adarshji"
                  className="group w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="https://github.com/CerealNotFound"
                  className="group w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>

            {/* Navigation columns */}
            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Product
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Company
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Press Kit
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Partners
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
                Support
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Status
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="border-t border-gray-800 pt-12 mb-12">
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-white font-semibold mb-4">
                Stay in the loop
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Get the latest updates, feature releases, and recruitment
                insights.
              </p>
              <div className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 HireAI. All rights reserved. Built with 💜 for the future
              of recruitment.
            </p>
            <div className="flex items-center space-x-8 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
              >
                Cookie Policy
              </a>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
