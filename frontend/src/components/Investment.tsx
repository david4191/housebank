/**
 * Controlled filter bar for the public /investment browse page (Joan, Sep
 * 2026 -- "/investment isn't fixed"). Used to own local activeFilter/
 * location/priceRange state that went nowhere -- no props, no callbacks,
 * so typing here never changed what the listing grid below showed.
 *
 * Now a plain controlled component: PropertyListingsPage (the sibling
 * that actually owns the data) holds the real filter state and renders
 * this as a child, passing every value + change handler down. Nothing
 * in this file talks to the API directly.
 */
export interface PropertyFilterHeaderProps {
  status: 'open' | 'fully_funded';
  onStatusChange: (status: 'open' | 'fully_funded') => void;
  location: string;
  onLocationChange: (value: string) => void;
  minAmount: string;
  onMinAmountChange: (value: string) => void;
  maxAmount: string;
  onMaxAmountChange: (value: string) => void;
  onSearch: () => void;
}

const PropertyFilterHeader = ({
  status,
  onStatusChange,
  location,
  onLocationChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange,
  onSearch,
}: PropertyFilterHeaderProps) => {
  const filters: { key: 'open' | 'fully_funded'; label: string }[] = [
    { key: 'open', label: 'Active' },
    { key: 'fully_funded', label: 'Sold Out' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
          {/* Filter Buttons */}
          <div className="grid grid-cols-2 gap-3 md:flex">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => onStatusChange(filter.key)}
                className={`w-full px-4 py-2 md:w-auto md:py-1.5 rounded-md text-sm font-medium border text-center min-w-[80px]
                  ${
                    status === filter.key
                      ? filter.key === 'open'
                        ? 'text-green-900 border-green-900 bg-transparent'
                        : 'text-red-600 border-red-600 bg-transparent'
                      : filter.key === 'open'
                        ? 'text-green-900 border-green-900 bg-transparent hover:bg-green-50'
                        : 'text-red-600 border-red-600 bg-transparent hover:bg-red-50'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Section */}
          <div className="grid w-full grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-md md:flex md:w-auto md:flex-1 md:items-center md:gap-0 md:overflow-hidden md:rounded-full md:p-0">
            {/* Location Input */}
            <div className="relative min-w-0">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="City or state"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full border-none py-3 pl-12 pr-4 text-sm text-gray-600 placeholder-gray-400 focus:outline-none md:w-40"
              />
            </div>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-gray-300 md:block md:mx-1" />

            {/* Min investment amount */}
            <div className="grid min-w-0 grid-cols-2 gap-3 md:contents">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Min investment"
                value={minAmount}
                onChange={(e) => onMinAmountChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full min-w-0 border-none px-3 py-3 text-sm text-gray-600 placeholder-gray-400 focus:outline-none md:w-24 md:px-4"
              />

              {/* Divider */}
              <div className="hidden h-6 w-px bg-gray-300 md:block md:mx-1" />

              {/* Max investment amount */}
              <div className="relative flex min-w-0 items-center">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Max investment"
                  value={maxAmount}
                  onChange={(e) => onMaxAmountChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full min-w-0 border-none py-3 pl-3 pr-10 text-sm text-gray-600 placeholder-gray-400 focus:outline-none md:w-24 md:pl-4"
                />
                <button
                  type="button"
                  onClick={onSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#455C47] hover:bg-green-700 text-white p-2.5 rounded-full transition-colors"
                  aria-label="Search investment opportunities"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyFilterHeader;
