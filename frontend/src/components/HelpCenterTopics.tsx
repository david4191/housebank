import { ChevronRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

// You'll need to add these images to your assets folder
import gettingStartedImage from '../assets/hbCover/getting-started.png';
import findingPlaceImage from '../assets/hbCover/finding-place.png';
import payingPropertyImage from '../assets/hbCover/paying-property.png';
import houseBankCover from '../assets/hbCover/housebank-cover.png';

interface Article {
  id: number;
  title: string;
  image: string;
  category: string;
  isSpecial?: boolean;
}

const HelpCenterArticlesSection = () => {
  const articles: Article[] = [
    {
      id: 1,
      title: "Getting started on HouseBank",
      image: gettingStartedImage,
      category: 'Getting started',
    },
    {
      id: 2,
      title: "Finding the right place for you",
      image: findingPlaceImage,
      category: 'Renting & buying',
    },
    {
      id: 3,
      title: "Paying for a property",
      image: payingPropertyImage,
      category: 'Payments',
    },
    {
      id: 4,
      title: "Housebank Cover",
      image: houseBankCover,
      category: 'Trust & safety',
    }
  ];

  // There's no per-guide detail page or CMS content behind these cards
  // (no matching route, no static_pages slug), so "Browse all topics"
  // does the one real thing available: jumps to the live, searchable
  // list of help_topics rendered by HelpCenterSearch above.
  const browseAllTopics = () => {
    document.getElementById('help-search')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Guides for getting started
          </h2>
          <button
            type="button"
            onClick={browseAllTopics}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <span className="text-sm font-medium">Browse all topics</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Guide cards open the matching live help-topic category. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/help-center?category=${encodeURIComponent(article.category)}#help-search`}
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              {/* Article Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {article.isSpecial ? (
                    <div className="w-full h-full bg-black flex flex-col items-center justify-center">
                      <Shield className="w-12 h-12 text-white mb-4" />
                      <h3 className="text-white text-lg font-semibold text-center px-4">
                        Housebank Cover
                      </h3>
                    </div>
                  ) : (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {!article.isSpecial && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {article.title}
                    </h3>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HelpCenterArticlesSection;
