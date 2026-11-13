import React from 'react';
import { Mail, Sparkles, Heart } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import { Link } from 'react-router-dom';

export const InvitationsPage = () => {
  const invitationSuites = [
    {
      title: 'Florentine Letterpress & Gold Foil Suite',
      designer: 'Atelier de Maiano',
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      description: 'Deckled edge handmade cotton paper with blind deboss floral motifs and antique bronze wax seal.',
    },
    {
      title: 'Botanical Glasshouse Calligraphy Suite',
      designer: 'Monroe Paperie',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      description: 'Vellum overlay jacket wrapped in silk ribbon with metallic olive ink calligraphy.',
    },
    {
      title: 'Minimalist Modern Romantic Suite',
      designer: 'Studio Serif',
      imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
      description: 'Crisp ivory stock with custom typography monogram, RSVP card, and wax seal crest.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Art of Stationery</span>
        <h1 className="font-serif text-4xl font-medium text-charcoal">Invitation Gallery & Paper Goods</h1>
        <p className="text-sm text-mutedGray">
          First impressions of your celebration. Explore bespoke letterpress suites, handcrafted calligraphy, and wax seal finishes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {invitationSuites.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-burgundy/10 shadow-soft hover:shadow-elevated transition-all">
            <div className="aspect-[4/3] bg-ivory-200 overflow-hidden">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[11px] font-semibold text-rose uppercase tracking-wider">{item.designer}</span>
              <h3 className="font-serif text-lg font-medium text-charcoal">{item.title}</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-ivory-200 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto border border-gold/30 space-y-4">
        <Mail className="w-10 h-10 text-burgundy mx-auto" />
        <h2 className="font-serif text-2xl text-charcoal">Digital RSVPs Built into WedConnect</h2>
        <p className="text-xs sm:text-sm text-mutedGray leading-relaxed">
          Manage your guests, dietary restrictions, and attendance in real time with our integrated wedding planner guestbook.
        </p>
        <Link to="/my-wedding" className="inline-block pt-2">
          <Button variant="primary">Access Wedding Planner</Button>
        </Link>
      </div>
    </div>
  );
};

export default InvitationsPage;
