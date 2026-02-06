import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/index';
import { Button, Card, CardContent, Chip, Box, Typography, Container, Grid } from '@mui/material';
import { Icons } from '../components/ui/Icons';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';

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

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '2M+', label: 'Tasks Completed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 5, lg: 8 },
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -1,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '25%',
              width: '100%',
              height: '100%',
              bgcolor: 'primary.light',
              borderRadius: '50%',
              filter: 'blur(3rem)',
              opacity: 0.5,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: '25%',
              width: '100%',
              height: '100%',
              bgcolor: 'grey.100',
              borderRadius: '50%',
              filter: 'blur(3rem)',
              opacity: 0.5,
            }}
          />
        </Box>

        <Container maxWidth="lg">
          <Box sx={{ mx: 'auto', textAlign: 'center', maxWidth: 800 }}>
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Icons.Sparkles sx={{ fontSize: 12 }} />
                  New: AI-powered task suggestions
                </Box>
              }
              sx={{ mb: 3 }}
            />
            
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Manage your tasks with{' '}
              <Typography component="span" variant="inherit" sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 700,
              }}>
                clarity and focus
              </Typography>
            </Typography>
            
            <Typography variant="h6" component="p" color="text.secondary" sx={{ mx: 'auto', mb: 3, maxWidth: 600 }}>
              TaskFlow helps you organize your work, track progress, and achieve your goals. 
              Simple, powerful, and designed for the way you work.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Link to="/register">
                <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
                  Get Started Free
                </Button>
              </Link>
              <Button variant="outlined" size="large" href="#features">
                Learn More
              </Button>
            </Box>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
              {stats.map((stat) => (
                <Grid item xs={6} md={3} key={stat.label}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: { xs: 5, lg: 8 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip label="Features" sx={{ mb: 2 }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Everything you need to stay productive
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mx: 'auto', maxWidth: 600 }}>
              Powerful features designed to help you manage tasks efficiently and achieve more every day.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={feature.title}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Icon sx={{ fontSize: 24, color: 'primary.main' }} />
                      </Box>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 5, lg: 8 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip label="Testimonials" sx={{ mb: 2 }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Loved by thousands of users
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mx: 'auto', maxWidth: 600 }}>
              See what our users have to say about their experience with TaskFlow.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.name}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} sx={{ fontSize: 20, color: '#fbbf24', fill: '#fbbf24' }} />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                          fontWeight: 600,
                        }}
                      >
                        {testimonial.avatar}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 5, lg: 8 },
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
              Ready to boost your productivity?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.8)', mx: 'auto', maxWidth: 500 }}>
              Join thousands of users who have transformed their workflow with TaskFlow.
              Start your free trial today.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Link to="/register">
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Get Started Free
                </Button>
              </Link>
              <Button 
                variant="outlined" 
                size="large"
                sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.1)' } }}
                href="#features"
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default Landing;
