import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/index';
import { Button, Card, Badge } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';

const Landing = () => {
  const features = [
    {
      icon: Icons.ClipboardList,
      title: 'Task Management',
      description: 'Create, organize, and track your tasks with ease. Set priorities, due dates, and never miss a deadline.',
    },
    {
      icon: Icons.Bell,
      title: 'Smart Notifications',
      description: 'Get timely reminders and updates. Customize notification preferences to stay informed without overwhelm.',
    },
    {
      icon: Icons.ChartBar,
      title: 'Progress Tracking',
      description: 'Visualize your productivity with intuitive charts and statistics. Understand your work patterns.',
    },
    {
      icon: Icons.Tag,
      title: 'Tags & Categories',
      description: 'Organize tasks with custom tags and categories. Filter and find what you need instantly.',
    },
    {
      icon: Icons.Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We prioritize your privacy and data protection.',
    },
    {
      icon: Icons.Lightning,
      title: 'Lightning Fast',
      description: 'Built for speed and efficiency. Enjoy a smooth, responsive experience across all devices.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      company: 'TechCorp',
      content: 'TaskFlow has transformed how our team manages projects. The intuitive interface and powerful features make it indispensable.',
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Designer',
      company: 'Self-employed',
      content: 'As a freelancer, staying organized is crucial. TaskFlow helps me juggle multiple clients and deadlines effortlessly.',
      avatar: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Startup Founder',
      company: 'InnovateLab',
      content: 'The best task management tool I\'ve used. Clean design, powerful features, and excellent customer support.',
      avatar: 'ER',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals getting started',
      features: [
        'Up to 50 tasks',
        'Basic notifications',
        'Mobile app access',
        'Email support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For professionals who need more',
      features: [
        'Unlimited tasks',
        'Advanced notifications',
        'Priority support',
        'Custom tags & filters',
        'Analytics dashboard',
        'API access',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Team',
      price: '$29',
      period: 'per month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Up to 10 team members',
        'Team collaboration',
        'Admin controls',
        'SSO integration',
        'Dedicated support',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '2M+', label: 'Tasks Completed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="container-app py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="primary" className="mb-6">
              <Icons.Sparkles className="w-3 h-3 mr-1" />
              New: AI-powered task suggestions
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 text-balance">
              Manage your tasks with{' '}
              <span className="gradient-text">clarity and focus</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
              TaskFlow helps you organize your work, track progress, and achieve your goals. 
              Simple, powerful, and designed for the way you work.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <Icons.ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-secondary-200">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                  <p className="text-sm text-secondary-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-secondary-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Powerful features designed to help you manage tasks efficiently and achieve more every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} hover className="p-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32">
        <div className="container-app">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Get started in minutes
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Three simple steps to transform your productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Create an Account',
                description: 'Sign up for free in seconds. No credit card required.',
                icon: Icons.User,
              },
              {
                step: '02',
                title: 'Add Your Tasks',
                description: 'Create tasks, set priorities, and organize with tags.',
                icon: Icons.Plus,
              },
              {
                step: '03',
                title: 'Track & Complete',
                description: 'Monitor progress, get reminders, and celebrate wins.',
                icon: Icons.CheckCircle,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
                    <Icon className="w-8 h-8 text-primary-600" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-secondary-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-secondary-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Loved by thousands of users
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              See what our users have to say about their experience with TaskFlow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Icons.Star key={i} className="w-5 h-5 text-warning-400 fill-warning-400" />
                  ))}
                </div>
                <p className="text-secondary-700 mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900">{testimonial.name}</p>
                    <p className="text-sm text-secondary-500">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="container-app">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 relative ${plan.popular ? 'border-2 border-primary-500 shadow-elevated' : ''}`}
              >
                {plan.popular && (
                  <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-secondary-900">{plan.price}</span>
                    <span className="text-secondary-500">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-secondary-500 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Icons.Check className="w-5 h-5 text-success-500 flex-shrink-0" />
                      <span className="text-secondary-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  fullWidth
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="container-app text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their workflow with TaskFlow.
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                Get Started Free
                <Icons.ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="ghost" size="lg" className="text-white hover:bg-primary-700">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
