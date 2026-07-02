import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-900 selection:bg-brand-red/30">
      <Navbar />
      <Hero />
      
      {/* Decorative divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-20"></div>

      {/* Quick FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">How it works</h2>
          <div className="brand-divider"></div>
        </div>

        <div className="grid gap-6">
          <div className="glass-card p-8 group hover:border-brand-red/30 transition-colors">
            <h3 className="text-xl font-bold mb-3 group-hover:text-brand-red transition-colors">Do I need to sign up?</h3>
            <p className="text-white/60">No! Find Your Match is completely anonymous and requires no registration. You can start chatting instantly with just one click.</p>
          </div>
          
          <div className="glass-card p-8 group hover:border-brand-red/30 transition-colors">
            <h3 className="text-xl font-bold mb-3 group-hover:text-brand-red transition-colors">Is video chat safe?</h3>
            <p className="text-white/60">Yes, our video chat uses secure peer-to-peer WebRTC technology. We do not record or have access to your camera streams. You can also report and block abusive users instantly.</p>
          </div>

          <div className="glass-card p-8 group hover:border-brand-red/30 transition-colors">
            <h3 className="text-xl font-bold mb-3 group-hover:text-brand-red transition-colors">How are matches selected?</h3>
            <p className="text-white/60">Our algorithm connects you randomly with another available user in the queue. If you skip someone, you will immediately be matched with someone new.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
