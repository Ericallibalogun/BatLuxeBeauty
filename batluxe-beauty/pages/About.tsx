
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Leaf, Users, ArrowRight } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="flex flex-col animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=2680&auto=format&fit=crop')` }}
        >
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl px-4">
          <span className="text-white font-black tracking-[0.5em] uppercase text-xs mb-4 block">Est. 2020</span>
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter mb-6">Our Story</h1>
          <p className="text-xl text-white/90 font-medium italic tracking-widest uppercase">From Passion to Premium Beauty</p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="text-left space-y-8">
              <h2 className="text-4xl font-black text-gray-900 italic tracking-tight">Discover the passion behind BatLuxe Beauty</h2>
              <div className="w-20 h-1.5 bg-pink-500 rounded-full"></div>
              <p className="text-gray-500 text-lg leading-relaxed font-medium italic">
                BatLuxe Beauty was born from a simple yet powerful vision: to create luxury beauty products that empower women to express their unique identity with confidence and style. Founded in 2020 by beauty enthusiast Bat, our brand has grown from a small passion project to a beloved beauty destination.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed font-medium italic">
                What started as handmade lip glosses created in a small kitchen has evolved into a full range of premium beauty products, each crafted with the same attention to detail and commitment to quality that defined our humble beginnings.
              </p>
              <p className="text-gray-900 text-xl font-black italic">
                "At BatLuxe Beauty, we believe that luxury shouldn't come at the expense of authenticity."
              </p>
              <Link to="/shop" className="inline-flex items-center gap-4 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-2xl active:scale-95">
                Shop Our Collection <ArrowRight size={18} />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-pink-200 rounded-[3rem] rotate-3 translate-x-4 translate-y-4"></div>
              <img 
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2670&auto=format&fit=crop" 
                alt="Crafting Process" 
                className="relative z-10 w-full h-[600px] object-cover rounded-[3rem] shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-32 bg-[#FDF2F8]/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-gray-900 mb-6 italic tracking-tight">Our Mission & Values</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">What drives everything we do at BatLuxe Beauty</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: <Star />, title: "Quality First", desc: "We never compromise on quality. Every product is carefully formulated and tested to ensure it meets our high standards." },
              { icon: <Heart />, title: "Handcrafted With Love", desc: "Each BatLuxe product is created with attention to detail. Handmade means made with care, passion, and purpose." },
              { icon: <Leaf />, title: "Sustainability", desc: "We're committed to reducing our environmental impact through eco-friendly packaging and responsible sourcing." },
              { icon: <Users />, title: "Community Focused", desc: "We believe in building a community where everyone feels beautiful, empowered, and supported." }
            ].map((value, i) => (
              <div key={i} className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-pink-50 hover:-translate-y-2 transition-all group">
                <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-inner">
                  {React.cloneElement(value.icon as React.ReactElement, { size: 32 })}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 italic">{value.title}</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed italic">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black italic tracking-tight mb-4">Our Handmade Process</h2>
            <p className="text-pink-400 font-black uppercase tracking-widest text-[10px]">The care that goes into every BatLuxe product</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { num: "1", title: "Premium Ingredients", desc: "Sourcing only highest quality, skin-loving ingredients from trusted suppliers." },
              { num: "2", title: "Small Batch Production", desc: "Made in small batches to ensure freshness, quality control, and attention to detail." },
              { num: "3", title: "Artisan Crafting", desc: "Each product is hand-poured, mixed, and finished by skilled beauty artisans." },
              { num: "4", title: "Quality Assurance", desc: "Rigorous testing to ensure consistency, performance, and total safety." }
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-pink-500 text-3xl font-black italic mb-8 mx-auto group-hover:bg-pink-500 group-hover:text-white transition-all shadow-2xl border border-white/10">
                  {step.num}
                </div>
                <h4 className="text-xl font-black mb-4 italic">{step.title}</h4>
                <p className="text-gray-400 text-sm font-medium leading-relaxed italic px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-pink-500 text-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-black italic mb-10 tracking-tighter">Join the BatLuxe Family</h2>
          <p className="text-xl mb-12 font-medium italic opacity-90">Experience the difference of handmade, luxury beauty products crafted with passion and purpose.</p>
          <Link to="/shop" className="bg-white text-gray-900 px-16 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-gray-900 hover:text-white transition-all inline-block active:scale-95">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
