
import React from 'react';
import { Shield, Truck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const FAQs: React.FC = () => (
  <div className="container mx-auto px-4 py-24 max-w-5xl text-left">
    <div className="text-center mb-20">
      <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Information Desk</span>
      <h1 className="text-6xl font-black text-gray-900 italic mb-6 tracking-tight">Frequently Asked Questions</h1>
      <div className="w-24 h-1.5 bg-pink-500 mx-auto rounded-full"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {[
        { q: "What is your return policy?", a: "We offer a 14-day return policy for unused, unopened, and sealed products. For hygiene reasons, opened lip products, lashes, or press-on nails cannot be returned." },
        { q: "How long does shipping take?", a: "Standard delivery within the UK usually takes 3–5 working days after a 1-3 day processing window." },
        { q: "Are your products cruelty-free?", a: "Yes, all products curated by BatLuxe Beauty are 100% cruelty-free and crafted with care." },
        { q: "Do you ship internationally?", a: "We currently ship within the United Kingdom only, but we are working on global shipping options for the future." }
      ].map((item, i) => (
        <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-pink-50 hover:shadow-2xl transition-all">
          <h3 className="text-2xl font-black text-gray-900 mb-4 italic tracking-tight">{item.q}</h3>
          <p className="text-gray-500 leading-relaxed font-medium italic">{item.a}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ShippingPolicy: React.FC = () => (
  <div className="container mx-auto px-4 py-24 max-w-5xl text-left">
    <div className="text-center mb-20">
      <div className="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl">
        <Truck size={40} />
      </div>
      <h1 className="text-6xl font-black text-gray-900 italic mb-6 tracking-tight">Shipping & Returns</h1>
      <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px]">Updated 2025</span>
    </div>

    <div className="space-y-16">
      <section className="bg-white p-12 rounded-[3rem] shadow-xl border border-pink-50">
        <h2 className="text-3xl font-black text-gray-900 italic mb-8 border-b border-pink-50 pb-6">Shipping Policy</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-black text-pink-500 uppercase tracking-widest mb-3 text-[12px]">Processing Time</h3>
            <p className="text-gray-500 font-medium italic leading-relaxed">All orders are processed within 1–3 working days (Monday–Friday, excluding UK bank holidays). During busy periods, processing times may be slightly longer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-50 p-6 rounded-2xl border border-pink-50">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Locations</h3>
              <p className="font-bold text-gray-900">We currently ship within the United Kingdom only.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-pink-50">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Times</h3>
              <p className="font-bold text-gray-900">Standard delivery usually takes 1–3 working days after dispatch.</p>
            </div>
          </div>
          <div className="bg-pink-50/50 p-8 rounded-3xl border border-pink-100 flex items-start gap-4">
            <AlertCircle className="text-pink-500 flex-shrink-0" size={24} />
            <p className="text-sm font-medium italic text-gray-600">Please double-check your address at checkout. We are not responsible for orders delivered to an incorrect address provided by the customer.</p>
          </div>
        </div>
      </section>

      <section className="bg-white p-12 rounded-[3rem] shadow-xl border border-pink-50">
        <h2 className="text-3xl font-black text-gray-900 italic mb-8 border-b border-pink-50 pb-6">Returns & Exchanges</h2>
        <div className="space-y-8">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle2 className="text-green-500 mt-1" size={20} />
            <p className="text-gray-500 font-medium italic leading-relaxed">You may return unused, unopened and sealed items within 14 days of delivery for an exchange or refund.</p>
          </div>
          <div className="bg-red-50/50 p-8 rounded-3xl border border-red-100 mb-8">
            <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Hygiene Notice</h3>
            <p className="text-gray-600 text-sm font-medium italic">For hygiene reasons, we cannot accept returns on opened or used lip products, lashes or press-on nails, unless the item is faulty or damaged.</p>
          </div>
          <div>
            <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-widest mb-3">Damaged Items</h3>
            <p className="text-gray-500 font-medium italic leading-relaxed mb-4">Contact us within 48 hours at <a href="mailto:Batluxebeauty@gmail.com" className="text-pink-600 font-black">Batluxebeauty@gmail.com</a> with your name, order number, and clear photos.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <div className="container mx-auto px-4 py-24 max-w-5xl text-left">
    <div className="text-center mb-20">
      <div className="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl">
        <Shield size={40} />
      </div>
      <h1 className="text-6xl font-black text-gray-900 italic mb-4 tracking-tight">Privacy Policy</h1>
      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Last Updated: 26/02/2025</p>
    </div>

    <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-pink-50 space-y-12">
      <section>
        <h2 className="text-2xl font-black text-gray-900 italic mb-4 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div> 1. Information We Collect
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500 font-medium italic">
          <li className="flex items-center gap-2">• Name, email, phone number</li>
          <li className="flex items-center gap-2">• Billing & shipping addresses</li>
          <li className="flex items-center gap-2">• Payment details & history</li>
          <li className="flex items-center gap-2">• Website usage & Cookies</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-black text-gray-900 italic mb-4 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div> 2. Data Usage
        </h2>
        <p className="text-gray-500 font-medium italic leading-relaxed">We use your information to process orders, manage your account, communicate promotions, and ensure secure transactions.</p>
      </section>

      <section className="bg-gray-50 p-8 rounded-[2rem] border border-pink-50">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">Your Rights (UK GDPR)</h3>
        <p className="text-gray-600 text-sm font-medium italic leading-relaxed">You have the right to access, correct, delete, or restrict your personal data. Contact us at <a href="mailto:Batluxebeauty@gmail.com" className="text-pink-600 font-black">Batluxebeauty@gmail.com</a> to exercise these rights.</p>
      </section>
    </div>
  </div>
);

export const Terms: React.FC = () => (
  <div className="container mx-auto px-4 py-24 max-w-5xl text-left">
    <div className="text-center mb-20">
      <div className="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl">
        <FileText size={40} />
      </div>
      <h1 className="text-6xl font-black text-gray-900 italic mb-4 tracking-tight">Terms & Conditions</h1>
      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Last Updated: 26/11/2024</p>
    </div>

    <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-pink-50 space-y-10">
      {[
        { title: "Acceptance of Terms", text: "By using this website, you agree to these Terms and Conditions and confirm you are at least 18 years old or have parent/guardian consent." },
        { title: "Products & Availability", text: "All products are subject to availability. We reserve the right to modify or discontinue products without notice. Images are for illustration purposes only." },
        { title: "Orders & Payment", text: "Orders are accepted subject to availability. Prices include VAT. We may refuse or cancel orders at our discretion." },
        { title: "Intellectual Property", text: "All content (text, images, logos) is owned by BatLuxe Beauty. You may not reproduce content without express written consent." }
      ].map((item, i) => (
        <section key={i} className="border-b border-pink-50 pb-10 last:border-none">
          <h2 className="text-xl font-black text-gray-900 italic mb-4 uppercase tracking-tighter text-sm">{i + 1}. {item.title}</h2>
          <p className="text-gray-500 font-medium italic leading-relaxed">{item.text}</p>
        </section>
      ))}
    </div>
  </div>
);
