export default function NoServices() {
    return (
      <div className="col-span-full text-center py-16">
        <div className="max-w-md mx-auto">
          <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No Services Available</h3>
          <p className="text-gray-500 mb-6">
            Currently there are no active services. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  export  function NoOrder() {
    return (
      <div className="col-span-full text-center py-16">
        <div className="max-w-md mx-auto">
          <svg className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No Orders Yet</h3>
          <p className="text-gray-500 mb-6">
            You've Not Open Any Orders Yet.
          </p>
        </div>
      </div>
    );
  }