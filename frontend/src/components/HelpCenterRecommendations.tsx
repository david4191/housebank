import { AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.tsx';
import { useGetMyProfileQuery } from '../redux/housebank.ts';

const RecommendedSection = () => {
  const auth = useAuth();
  const role = auth.user?.role;
  const needsVerificationProfile = role === 'agent' || role === 'company';
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useGetMyProfileQuery(undefined, { skip: !needsVerificationProfile });
  const rawStatus = profile?.profile?.verification_status;
  const verificationStatus =
    rawStatus === 'pending' || rawStatus === 'verified' || rawStatus === 'rejected'
      ? rawStatus
      : undefined;

  const verificationCard = (() => {
    if (!role) {
      return {
        badge: 'SIGN IN',
        title: 'Check your account status',
        description: 'Sign in to see recommendations and any verification steps for your account.',
        action: 'Sign in',
        href: '/signin',
        Icon: AlertCircle,
      };
    }

    if (role === 'customer') {
      return {
        badge: 'YOUR ACCOUNT',
        title: 'Keep your account details up to date',
        description: 'Review your profile and security settings from your customer dashboard.',
        action: 'Manage account',
        href: '/customer/settings',
        Icon: ShieldCheck,
      };
    }

    if (role === 'admin') {
      return {
        badge: 'ADMIN ACTION',
        title: 'Review company verification requests',
        description: 'Open the admin dashboard to review company registrations awaiting verification.',
        action: 'Review companies',
        href: '/admin/companies',
        Icon: AlertCircle,
      };
    }

    const profileType = role === 'company' ? 'company' : 'realtor';
    const href = role === 'company' ? '/company/settings' : '/agent/settings';
    const statusAction = role === 'company' ? 'View company status' : 'View realtor status';

    if (isProfileLoading) {
      return {
        badge: 'LOADING STATUS',
        title: `Checking your ${profileType} verification`,
        description: 'Your verification status is being loaded.',
        action: statusAction,
        href,
        Icon: ShieldCheck,
      };
    }

    if (isProfileError) {
      return {
        badge: 'STATUS UNAVAILABLE',
        title: `Could not load your ${profileType} verification`,
        description: 'Open your dashboard settings to check your status.',
        action: statusAction,
        href,
        Icon: AlertCircle,
      };
    }

    if (verificationStatus === 'verified') {
      return {
        badge: 'VERIFIED',
        title: `Your ${profileType} profile is verified`,
        description: 'Your verification is complete. You can review your status in dashboard settings.',
        action: statusAction,
        href,
        Icon: CheckCircle2,
      };
    }

    if (verificationStatus === 'rejected') {
      return {
        badge: 'ACTION REQUIRED',
        title: `Your ${profileType} verification needs attention`,
        description: 'Review your status in dashboard settings and contact HouseBank support for next steps.',
        action: statusAction,
        href,
        Icon: AlertCircle,
      };
    }

    if (verificationStatus === 'pending') {
      return {
        badge: 'IN REVIEW',
        title: `Your ${profileType} verification is pending`,
        description: 'You can check the latest status in dashboard settings.',
        action: statusAction,
        href,
        Icon: AlertCircle,
      };
    }

    return {
      badge: 'STATUS UNAVAILABLE',
      title: `Your ${profileType} status is unavailable`,
      description: 'Open your dashboard settings to check your status.',
      action: statusAction,
      href,
      Icon: AlertCircle,
    };
  })();
  const VerificationIcon = verificationCard.Icon;
  const isPositiveCard = verificationStatus === 'verified' || role === 'customer';

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Recommended for you
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Role-aware account and verification card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-6">
              <VerificationIcon
                className={`w-4 h-4 ${
                  isPositiveCard ? 'text-green-700' : 'text-orange-500'
                }`}
              />
              <span
                className={`text-sm font-medium uppercase tracking-wide ${
                  isPositiveCard ? 'text-green-700' : 'text-orange-500'
                }`}
              >
                {verificationCard.badge}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{verificationCard.title}</h3>
              <p className="text-gray-600 leading-relaxed">{verificationCard.description}</p>
            </div>

            <Link
              to={verificationCard.href}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group w-fit"
            >
              <span className="text-gray-700 font-medium">{verificationCard.action}</span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Explore Neighborhoods Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            {/* Card Content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Explore
              </h3>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Great Neighborhoods
              </h4>
              <p className="text-gray-600 leading-relaxed">
                We connect with directly to the person that knowns the most 
                about property for sale, the listing realtor.
              </p>
            </div>

            {/* Explore Button, the real, public property browse page */}
            <Link
              to="/explore"
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group w-fit"
            >
              <span className="text-gray-700 font-medium">Explore</span>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RecommendedSection;
