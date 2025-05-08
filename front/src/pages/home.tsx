import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useTheme } from '@mui/material';
import AdvantagesSection from '../component/homepage/advantages';
import CTASection from '../component/homepage/cta';
import FeaturesSection from '../component/homepage/feature';
import Footer from '../component/homepage/footer';
import HeroSection from '../component/homepage/heroSection';
import HowItWorksSection from '../component/homepage/HowItWorksSection';
import MultiPlatformSection from '../component/homepage/multiPlatform';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useTheme();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div>
      <HeroSection handleGetStarted={handleGetStarted} />
      <FeaturesSection />
      <HowItWorksSection />
      <MultiPlatformSection handleGetStarted={handleGetStarted} />
      <AdvantagesSection />
      <CTASection handleGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
};

export default HomePage;