
import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, Loader2, 
  MessageSquare, User, AtSign, Globe, CheckCircle2,
  Clock, Briefcase
} from 'lucide-react';

const Contact: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API dispatch to company email service
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-24">
      <div className="container mx-auto px-4 max-w-7xl text-left">
        <div className="text-center mb-20">
          <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Concierge & Support</span>
          <h1 className="text-6xl font-black text-gray-900 mb-6 italic tracking-tight">Connect With Us</h1>
          <p className="text-gray-400 font-medium max-w-2xl mx-auto italic">
            "Beauty is a silent language. We are here to listen and elevate your aesthetic experience through personalized care."
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          {/* Contact Form Section */}
          <div className="flex-grow lg:w-3/5 bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-pink-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-gray-900 italic mb-8 flex items-center gap-3">
                <MessageSquare className="text-pink-500" size={28} /> Bespoke Inquiry
              </h2>

              {sent && (
                <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-3xl mb-8 flex items-center gap-4 animate-in zoom-in duration-300">
                  <CheckCircle2 size={24} />
                  <p className="text-sm font-black uppercase tracking-widest">Message Dispatched Successfully</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <User size={12} className="text-pink-500" /> Full Name
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your name"
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner placeholder:text-gray-300"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <AtSign size={12} className="text-pink-500" /> Email Address
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner placeholder:text-gray-300"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inquiry Category</label>
                  <select 
                    className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner appearance-none cursor-pointer"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option>General Inquiry</option>
                    <option>Order & Fulfillment</option>
                    <option>Product Guidance</option>
                    <option>Wholesale & Partnership</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                  <textarea 
                    required
                    placeholder="How may we assist your beauty journey today?"
                    className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner min-h-[180px] placeholder:text-gray-300"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full md:w-auto bg-gray-900 hover:bg-pink-600 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 group"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Send Message <Send size={18} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="lg:w-2/5 flex flex-col gap-8">
            <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl flex-1 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl -mb-20 -mr-20 group-hover:bg-pink-500/30 transition-all"></div>
              
              <h3 className="text-2xl font-black italic mb-12 border-b border-white/10 pb-6 flex items-center gap-3">
                <Globe className="text-pink-500" size={24} /> Headquarters
              </h3>
              
              <div className="space-y-12">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-pink-500 shadow-inner">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">Physical Atelier</p>
                    <p className="text-lg font-bold italic opacity-90 leading-relaxed">
                      15 Curated Lane,<br />Mayfair, London<br />W1K 7LU, United Kingdom
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-pink-500 shadow-inner">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">Direct Line</p>
                    <a href="tel:+447707216493" className="text-xl font-black tracking-tight hover:text-pink-400 transition-colors">+44 7707 216493</a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">Digital Concierge</p>
                    <a href="mailto:Batluxebeauty@gmail.com" className="text-lg font-black text-white hover:text-pink-400 transition-colors cursor-pointer">Batluxebeauty@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-pink-500 shadow-inner">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">Partnerships</p>
                    <a href="mailto:Batluxebeauty@gmail.com" className="text-lg font-black text-white hover:text-pink-400 transition-colors cursor-pointer">Batluxebeauty@gmail.com</a>
                  </div>
                </div>
              </div>


            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-pink-50 shadow-xl">
              <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <Clock size={12} /> Service Hours
              </h4>
              <p className="font-bold text-gray-900 italic mb-6">Our team is available for bespoke support during these hours:</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Mon — Fri</span>
                  <span className="font-black text-gray-900">09:00 — 18:00 GMT</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Saturday</span>
                  <span className="font-black text-gray-900">10:00 — 16:00 GMT</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sunday</span>
                  <span className="font-black text-pink-500 uppercase">Restricted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
