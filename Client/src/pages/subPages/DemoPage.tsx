import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const DemoPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-800 to-emerald-600 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Tutorial</h1>
          </div>
        </section>
        <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Coming Soon!</h2>
            <p className="text-gray-600 mb-4">Our demo page is under construction. Stay tuned for updates!</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DemoPage; 