import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import {
  User,
  CreatorProfile,
  Category,
  Business,
  BusinessMember,
  Service,
  Review,
  Post,
  Like,
  Comment,
  WeddingPlan,
  WeddingPlanMember,
  Task,
  Expense,
  Guest,
  Collection,
  CollectionItem,
  Enquiry,
  Conversation,
  Message,
  Notification,
} from '../models/index.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedconnect';
    console.log(`[Seed] Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      CreatorProfile.deleteMany({}),
      Category.deleteMany({}),
      Business.deleteMany({}),
      BusinessMember.deleteMany({}),
      Service.deleteMany({}),
      Review.deleteMany({}),
      Post.deleteMany({}),
      Like.deleteMany({}),
      Comment.deleteMany({}),
      WeddingPlan.deleteMany({}),
      WeddingPlanMember.deleteMany({}),
      Task.deleteMany({}),
      Expense.deleteMany({}),
      Guest.deleteMany({}),
      Collection.deleteMany({}),
      CollectionItem.deleteMany({}),
      Enquiry.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Seeding categories...');
    const categoriesData = [
      {
        name: 'Photography & Cinema',
        slug: 'photography-cinema',
        description: 'Award-winning wedding photographers capturing timeless, candid emotions and cinematic film.',
        imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
        icon: 'Camera',
        type: 'both',
        order: 1,
      },
      {
        name: 'Venues & Estates',
        slug: 'venues-estates',
        description: 'Charming historic chateaus, luxury beachfront villas, and intimate vineyard estates.',
        imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
        icon: 'Building2',
        type: 'both',
        order: 2,
      },
      {
        name: 'Bridal Couture & Attire',
        slug: 'bridal-couture-attire',
        description: 'Bespoke bridal gowns, haute couture tuxedos, veil accessories and bridesmaid dresses.',
        imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
        icon: 'Sparkles',
        type: 'both',
        order: 3,
      },
      {
        name: 'Floral & Event Styling',
        slug: 'floral-event-styling',
        description: 'Ethereal floral installations, romantic ceremony arches, and luxe tablescapes.',
        imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
        icon: 'Flower2',
        type: 'both',
        order: 4,
      },
      {
        name: 'Wedding Planners',
        slug: 'wedding-planners',
        description: 'Full-service luxury wedding designers, day-of coordinators, and destination specialists.',
        imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        icon: 'Calendar',
        type: 'vendor',
        order: 5,
      },
      {
        name: 'Catering & Cake Design',
        slug: 'catering-cake-design',
        description: 'Fine dining culinary experiences, handcrafted wedding cakes, and artisanal cocktail bars.',
        imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
        icon: 'UtensilsCrossed',
        type: 'both',
        order: 6,
      },
      {
        name: 'Hair, Makeup & Beauty',
        slug: 'hair-makeup-beauty',
        description: 'Editorial bridal beauty stylists for radiant, long-lasting wedding day glam.',
        imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
        icon: 'Smile',
        type: 'vendor',
        order: 7,
      },
      {
        name: 'Music & Entertainment',
        slug: 'music-entertainment',
        description: 'Live string quartets, dynamic reception bands, and celebrated international DJs.',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        icon: 'Music',
        type: 'vendor',
        order: 8,
      },
      {
        name: 'Invitations & Calligraphy',
        slug: 'invitations-calligraphy',
        description: 'Letterpress stationery, wax-sealed save the dates, and customized calligraphy suites.',
        imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
        icon: 'Mail',
        type: 'both',
        order: 9,
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    console.log('[Seed] Seeding users with multiple capabilities...');
    const defaultPassword = 'Password123!';

    // 1. Admin User
    const adminUser = await User.create({
      firstName: 'Antigravity',
      lastName: 'Admin',
      displayName: 'WedConnect Admin',
      email: 'admin@wedconnect.com',
      passwordHash: defaultPassword,
      role: 'admin',
      capabilities: { isCreator: true, isVendor: true, isPlanner: true },
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Head of Quality and Curation at WedConnect.',
      isEmailVerified: true,
    });

    // 2. Couple User (Planner)
    const coupleUser = await User.create({
      firstName: 'Sophia',
      lastName: 'Montague',
      displayName: 'Sophia & Julian',
      email: 'couple@wedconnect.com',
      passwordHash: defaultPassword,
      role: 'user',
      capabilities: { isCreator: false, isVendor: false, isPlanner: true },
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bio: 'Planning our romantic Tuscany villa celebration for Autumn 2026.',
      location: { city: 'New York', state: 'NY', country: 'USA' },
      isEmailVerified: true,
    });

    // 3. Vendor Owner
    const vendorUser = await User.create({
      firstName: 'Marcus',
      lastName: 'Vance',
      displayName: 'Marcus Vance Studios',
      email: 'vendor@wedconnect.com',
      passwordHash: defaultPassword,
      role: 'user',
      capabilities: { isCreator: true, isVendor: true, isPlanner: false },
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Editorial destination wedding photographer based in California & available worldwide.',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      isEmailVerified: true,
    });

    // 4. Creator User
    const creatorUser = await User.create({
      firstName: 'Elena',
      lastName: 'Rostova',
      displayName: 'Elena Bridal Styling',
      email: 'creator@wedconnect.com',
      passwordHash: defaultPassword,
      role: 'user',
      capabilities: { isCreator: true, isVendor: false, isPlanner: false },
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Wedding aesthetic curator, bespoke veil designer, and bridal fashion stylist.',
      location: { city: 'Paris', country: 'France' },
      isEmailVerified: true,
    });

    // 5. Regular User
    const regularUser = await User.create({
      firstName: 'Clara',
      lastName: 'Sterling',
      displayName: 'Clara Sterling',
      email: 'user@wedconnect.com',
      passwordHash: defaultPassword,
      role: 'user',
      capabilities: { isCreator: false, isVendor: false, isPlanner: true },
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
      bio: 'Wedding enthusiast gathering color palette and floral inspirations.',
      location: { city: 'London', country: 'UK' },
      isEmailVerified: true,
    });

    console.log('[Seed] Seeding Creator profiles...');
    const creatorProfile1 = await CreatorProfile.create({
      userId: creatorUser._id,
      username: 'elenarostova',
      displayName: 'Elena Rostova Bridal',
      tagline: 'Bridal Stylist & Aesthetic Storyteller',
      bio: 'Curating modern bridal wardrobes, vintage lace veil styling, and European destination aesthetics. Featured in Vogue Weddings & Brides.',
      specialties: ['Bridal Styling', 'Veil Design', 'Color Palettes', 'Stationery'],
      coverImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      socialLinks: {
        instagram: 'https://instagram.com/elenarostovastyle',
        pinterest: 'https://pinterest.com/elenaweddings',
      },
      isVerified: true,
      stats: { followersCount: 1420, likesCount: 4890, viewsCount: 18200 },
      portfolio: [
        {
          title: 'Silk Organza & Pearl Veil Editorial',
          description: 'Handcrafted floor-length cathedral veil styled with minimalistic crepe gown.',
          imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
          category: 'Bridal Fashion',
          featured: true,
        },
        {
          title: 'Lake Como Villa Sunset Palette',
          description: 'Warm terracotta, pale blush, and vintage gold color direction.',
          imageUrl: 'https://images.unsplash.com/photo-1519225438883-7629b3528b12?auto=format&fit=crop&w=800&q=80',
          category: 'Color Palettes',
          featured: true,
        },
      ],
    });

    const creatorProfile2 = await CreatorProfile.create({
      userId: vendorUser._id,
      username: 'marcusvance',
      displayName: 'Marcus Vance Imagery',
      tagline: 'Cinematic Visual Storyteller',
      bio: 'Documenting raw, authentic romance across California coastlines and Mediterranean cliffs.',
      specialties: ['Photography', 'Cinematography', 'Drone Cinematics'],
      coverImageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      isVerified: true,
      stats: { followersCount: 3100, likesCount: 9200, viewsCount: 42000 },
      portfolio: [
        {
          title: 'Big Sur Coastal Cliff Elopement',
          description: 'Intimate vows overlooking the Pacific Ocean amidst fog and golden hour.',
          imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
          category: 'Photography',
          featured: true,
        },
      ],
    });

    console.log('[Seed] Seeding Vendor businesses...');
    const businessesData = [
      {
        ownerId: vendorUser._id,
        name: 'Vance & Co. Fine Art Photography',
        slug: 'vance-co-fine-art-photography',
        tagline: 'Timeless, light-filled wedding photography for the modern romantic.',
        description: 'Vance & Co. is a boutique photography studio specializing in editorial wedding storytelling. We combine artistic medium-format film techniques with modern digital precision to capture every tear, laughter, and subtle glance of your celebration.',
        categoryId: catMap['photography-cinema'],
        subcategories: ['Fine Art', 'Film Photography', 'Destination Weddings'],
        logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        coverImageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
        location: {
          address: '450 Sutter Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94108',
        },
        serviceAreas: ['San Francisco Bay Area', 'Napa Valley', 'Carmel-by-the-Sea', 'Worldwide'],
        contactInfo: {
          email: 'hello@vancephotography.com',
          phone: '+1 (415) 890-3421',
          website: 'https://vancephotography.com',
          instagram: 'https://instagram.com/vanceweddings',
        },
        priceRange: '$$$',
        startingPrice: 3800,
        rating: { average: 4.9, count: 24 },
        verificationStatus: 'approved',
        verifiedAt: new Date(),
        isFeatured: true,
        portfolio: [
          {
            title: 'Napa Valley Vineyard Sunset',
            imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
            featured: true,
          },
          {
            title: 'Montecito Historic Courtyard Ceremony',
            imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
            featured: true,
          },
        ],
      },
      {
        ownerId: adminUser._id,
        name: 'The Glasshouse Botanical Estate',
        slug: 'the-glasshouse-botanical-estate',
        tagline: 'Historic Conservatory & French Country Gardens',
        description: 'Nestled among rolling hills, The Glasshouse offers a breathtaking glass atrium surrounded by formal English rose gardens, candlelit limestone terraces, and a 200-guest ballroom with crystal chandeliers.',
        categoryId: catMap['venues-estates'],
        subcategories: ['Historic Estate', 'Glass Greenhouse', 'Outdoor Garden'],
        logoUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=200&q=80',
        coverImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        location: {
          address: '1200 Rosewood Lane',
          city: 'Hudson Valley',
          state: 'NY',
          country: 'USA',
          zipCode: '12534',
        },
        serviceAreas: ['New York Tri-State', 'Hudson Valley', 'New England'],
        contactInfo: {
          email: 'events@glasshouseestate.com',
          phone: '+1 (845) 555-0199',
          website: 'https://glasshouseestate.com',
        },
        priceRange: '$$$$',
        startingPrice: 12500,
        rating: { average: 5.0, count: 38 },
        verificationStatus: 'approved',
        verifiedAt: new Date(),
        isFeatured: true,
        portfolio: [
          {
            title: 'Starlight Reception under the Glasshouse',
            imageUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
            featured: true,
          },
        ],
      },
      {
        ownerId: vendorUser._id,
        name: 'Fleur de Vie Floral Artistry',
        slug: 'fleur-de-vie-floral-artistry',
        tagline: 'Organic sculptural florals and romantic botanical styling',
        description: 'We believe flowers should evoke emotion and painterly poetry. Using seasonal garden roses, trailing jasmine, and rare blooms, we design show-stopping floral installations that transform spaces.',
        categoryId: catMap['floral-event-styling'],
        subcategories: ['Luxury Florals', 'Arches & Installations', 'Tablescapes'],
        logoUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=200&q=80',
        coverImageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
        location: {
          address: '78 Mercer Street',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10012',
        },
        serviceAreas: ['Manhattan', 'Brooklyn', 'Hamptons', 'Hudson Valley'],
        contactInfo: {
          email: 'studio@fleurdevieflowers.com',
          phone: '+1 (212) 555-8912',
          website: 'https://fleurdevieflowers.com',
        },
        priceRange: '$$$',
        startingPrice: 4500,
        rating: { average: 4.8, count: 19 },
        verificationStatus: 'approved',
        verifiedAt: new Date(),
        isFeatured: true,
      },
    ];

    const businesses = await Business.insertMany(businessesData);
    const vanceBusiness = businesses[0];
    const glasshouseBusiness = businesses[1];

    console.log('[Seed] Seeding Business Packages & Services...');
    await Service.insertMany([
      {
        businessId: vanceBusiness._id,
        name: 'The Full Day Editorial Collection',
        description: 'Complete 10-hour photographic coverage by Marcus Vance + associate photographer. Includes 35mm film scans, private online proofing gallery, and fine-art linen album.',
        price: 5200,
        duration: '10 Hours',
        features: ['Lead Photographer + Associate', 'Medium Format & 35mm Film', 'Online Gallery with Full Print Rights', '800+ Hand-Edited High Res Photos', 'Custom 12x12 Linen Album'],
        order: 1,
      },
      {
        businessId: vanceBusiness._id,
        name: 'Intimate & Elopement Story',
        description: 'Curated 5-hour documentation for intimate ceremonies and luxury micro-weddings up to 50 guests.',
        price: 3400,
        duration: '5 Hours',
        features: ['5 Hours Coverage', 'Online Gallery', '400+ Hand-Edited High Res Photos', 'Pre-Wedding Consultation'],
        order: 2,
      },
      {
        businessId: glasshouseBusiness._id,
        name: 'Saturday Prime Weekend Wedding Rental',
        description: 'Exclusive 14-hour access to the entire 40-acre estate, Glass Conservatory, bridal suite, groom lounge, and garden terrace for up to 250 guests.',
        price: 16500,
        duration: '14 Hours',
        features: ['Full Estate Exclusive Access', 'Bridal & Groom Dressing Suites', 'Tables, Chiavari Chairs & Setup Included', 'Onsite Venue Manager & Security', 'Valet Parking Coordination'],
        order: 1,
      },
    ]);

    console.log('[Seed] Seeding Reviews...');
    await Review.create({
      businessId: vanceBusiness._id,
      authorId: coupleUser._id,
      rating: 5,
      title: 'Our wedding photos belong in an Italian Vogue magazine!',
      comment: 'Marcus was the calmest, kindest, and most remarkably talented vendor on our entire wedding team. He captured micro-expressions and moments we did not even realize happened. Our family has been in tears looking through the gallery.',
      weddingDate: new Date('2025-09-18'),
      reply: {
        text: 'Sophia & Julian, working with you both was an absolute dream. Thank you for welcoming me with open arms!',
        repliedAt: new Date(),
      },
    });

    console.log('[Seed] Seeding Inspiration Posts...');
    const postsData = [
      {
        authorId: vendorUser._id,
        authorType: 'vendor',
        businessId: vanceBusiness._id,
        title: 'Golden Hour at the Villa Terrace',
        content: 'There is a magical twenty-minute window when the setting sun hits stone terraces just right. Pure cinema in Tuscany. Shot on 35mm Portra 400 film.',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
            mediaType: 'image',
            aspectRatio: '4:5',
          },
        ],
        tags: ['tuscanywedding', 'destinationwedding', 'filmphotography', 'goldenhour', 'luxurybride'],
        categoryId: catMap['photography-cinema'],
        location: 'Florence, Italy',
        likesCount: 142,
        commentsCount: 12,
        savesCount: 68,
        isFeatured: true,
      },
      {
        authorId: adminUser._id,
        authorType: 'vendor',
        businessId: glasshouseBusiness._id,
        title: 'Glass Conservatory Dinner by Candlelight',
        content: 'When dusk settles and 400 taper candles illuminate the botanical glasshouse. A fairytale reception setting that transcends trends.',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
            mediaType: 'image',
            aspectRatio: '4:5',
          },
        ],
        tags: ['weddingvenue', 'glasshouse', 'candledinner', 'tablescape', 'luxurywedding'],
        categoryId: catMap['venues-estates'],
        location: 'Hudson Valley, NY',
        likesCount: 285,
        commentsCount: 24,
        savesCount: 190,
        isFeatured: true,
      },
      {
        authorId: creatorUser._id,
        authorType: 'creator',
        title: 'Modern Minimalism: Crepe Silk & Pearl Drop Veils',
        content: 'Bridal styling tip: When wearing a sleek, unembellished gown, let your veil carry the tactile detail. Delicate seed pearls catch ambient ceremony light without overpowering your silhouette.',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=80',
            mediaType: 'image',
            aspectRatio: '4:5',
          },
        ],
        tags: ['bridalstyle', 'modernbride', 'pearlveil', 'minimalistwedding', 'bridaltrends'],
        categoryId: catMap['bridal-couture-attire'],
        location: 'Paris, France',
        likesCount: 198,
        commentsCount: 15,
        savesCount: 114,
        isFeatured: true,
      },
      {
        authorId: vendorUser._id,
        authorType: 'vendor',
        title: 'Sculptural White Delphinium Ceremony Columns',
        content: 'Instead of a solid traditional arch, dual botanical pillars framed the mountain views effortlessly. Ranunculus, garden roses, and wild sweet peas.',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
            mediaType: 'image',
            aspectRatio: '4:5',
          },
        ],
        tags: ['weddingflorals', 'ceremonyarch', 'floraldesign', 'mountainwedding'],
        categoryId: catMap['floral-event-styling'],
        location: 'Aspen, Colorado',
        likesCount: 165,
        commentsCount: 8,
        savesCount: 92,
        isFeatured: false,
      },
    ];

    const posts = await Post.insertMany(postsData);

    console.log('[Seed] Seeding Likes & Comments...');
    await Like.create({
      userId: coupleUser._id,
      targetId: posts[0]._id,
      targetType: 'post',
    });
    await Like.create({
      userId: regularUser._id,
      targetId: posts[0]._id,
      targetType: 'post',
    });

    await Comment.create({
      postId: posts[0]._id,
      authorId: coupleUser._id,
      text: 'This exact tone and light is everything Julian and I are envisioning for our reception!',
    });

    console.log('[Seed] Seeding Collections & Moodboards...');
    const collection = await Collection.create({
      userId: coupleUser._id,
      title: 'Tuscany Dream & Golden Hour Moods',
      description: 'Private inspiration board for our Florence ceremony and reception design.',
      isPrivate: false,
      coverImageUrl: posts[0].media[0].url,
      itemsCount: 2,
    });

    await CollectionItem.create({
      collectionId: collection._id,
      postId: posts[0]._id,
      note: 'Reference for reception terrace portraits',
    });
    await CollectionItem.create({
      collectionId: collection._id,
      postId: posts[1]._id,
      note: 'Taper candle tablescape inspiration',
    });

    console.log('[Seed] Seeding Wedding Plan Workspace...');
    const weddingPlan = await WeddingPlan.create({
      ownerId: coupleUser._id,
      title: 'Sophia & Julian — Tuscany Villa Celebration',
      partner1Name: 'Sophia Montague',
      partner2Name: 'Julian Vance',
      weddingDate: new Date('2026-09-24'),
      city: 'Florence',
      country: 'Italy',
      venueName: 'Villa di Maiano',
      totalBudget: 45000,
      currency: 'USD',
      weddingTheme: 'Warm Mediterranean Romantic',
      estimatedGuests: 110,
      coverImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      savedVendorIds: [vanceBusiness._id, glasshouseBusiness._id],
      timelineEvents: [
        { title: 'Bridal Party & Groom Getting Ready', time: '11:00 AM', location: 'Villa Suites', order: 1 },
        { title: 'First Look & Couple Portraits', time: '02:30 PM', location: 'Cypress Garden Grove', order: 2 },
        { title: 'Guest Arrival & Welcome Spritz', time: '04:00 PM', location: 'Lower Terrace', order: 3 },
        { title: 'Ceremony with Live String Quartet', time: '04:30 PM', location: 'Villa Lawn Overlook', order: 4 },
        { title: 'Cocktail Hour & Antipasti Stations', time: '05:30 PM', location: 'Courtyard Fountain', order: 5 },
        { title: 'Al Fresco Candlelit Dinner', time: '07:00 PM', location: 'Main Villa Terrace', order: 6 },
        { title: 'First Dance & Dessert Celebration', time: '09:00 PM', location: 'Ballroom & Fireworks', order: 7 },
      ],
    });

    await WeddingPlanMember.create({
      planId: weddingPlan._id,
      userId: coupleUser._id,
      role: 'owner',
      status: 'accepted',
    });

    console.log('[Seed] Seeding Tasks...');
    await Task.insertMany([
      {
        planId: weddingPlan._id,
        title: 'Review & Sign Contract with Vance & Co. Photography',
        category: 'photography',
        priority: 'urgent',
        status: 'completed',
        dueDate: new Date('2026-04-15'),
        estimatedCost: 5200,
        actualCost: 5200,
        order: 1,
      },
      {
        planId: weddingPlan._id,
        title: 'Confirm guest room block at boutique hotels in Florence',
        category: 'venue',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date('2026-05-01'),
        order: 2,
      },
      {
        planId: weddingPlan._id,
        title: 'Bridal dress first fitting and accessory styling',
        category: 'attire',
        priority: 'medium',
        status: 'in_progress',
        dueDate: new Date('2026-06-10'),
        estimatedCost: 3500,
        order: 3,
      },
      {
        planId: weddingPlan._id,
        title: 'Finalize calligraphy wedding invitation suite & address envelopes',
        category: 'invitations',
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2026-05-20'),
        estimatedCost: 850,
        order: 4,
      },
      {
        planId: weddingPlan._id,
        title: 'Tasting of Chianti wine pairings & 4-course menu',
        category: 'catering',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2026-06-15'),
        estimatedCost: 12000,
        order: 5,
      },
    ]);

    console.log('[Seed] Seeding Expenses...');
    await Expense.insertMany([
      {
        planId: weddingPlan._id,
        title: 'Villa di Maiano Venue Rental Deposit',
        category: 'Venue',
        estimatedAmount: 14000,
        actualAmount: 14000,
        paidAmount: 7000,
        status: 'deposit_paid',
        notes: 'Final balance due 30 days prior to event.',
      },
      {
        planId: weddingPlan._id,
        title: 'Photography & Film Package — Vance & Co.',
        category: 'Photography',
        estimatedAmount: 5200,
        actualAmount: 5200,
        paidAmount: 2000,
        status: 'deposit_paid',
        vendorId: vanceBusiness._id,
      },
      {
        planId: weddingPlan._id,
        title: 'Tuscan Farm-to-Table Catering & Bar',
        category: 'Catering',
        estimatedAmount: 13500,
        actualAmount: 13200,
        paidAmount: 4000,
        status: 'deposit_paid',
      },
      {
        planId: weddingPlan._id,
        title: 'Floral Arches & Taper Candle Styling',
        category: 'Decor',
        estimatedAmount: 4500,
        actualAmount: 4200,
        paidAmount: 0,
        status: 'estimated',
      },
      {
        planId: weddingPlan._id,
        title: 'Live Acoustic String Quartet for Ceremony',
        category: 'Music',
        estimatedAmount: 1800,
        actualAmount: 1800,
        paidAmount: 1800,
        status: 'paid_in_full',
      },
    ]);

    console.log('[Seed] Seeding Guests & RSVPs...');
    await Guest.insertMany([
      {
        planId: weddingPlan._id,
        firstName: 'Alexander',
        lastName: 'Montague',
        email: 'alex.montague@example.com',
        side: 'partner1',
        group: 'wedding_party',
        invitationStatus: 'delivered',
        rsvpStatus: 'attending',
        plusOne: { allowed: true, hasPlusOne: true, name: 'Beatrice Holt' },
        tableNumber: 'Table 1',
      },
      {
        planId: weddingPlan._id,
        firstName: 'Charlotte',
        lastName: 'Duval',
        email: 'charlotte.d@example.com',
        side: 'partner1',
        group: 'wedding_party',
        invitationStatus: 'delivered',
        rsvpStatus: 'attending',
        dietaryRestrictions: 'Vegetarian',
        tableNumber: 'Table 1',
      },
      {
        planId: weddingPlan._id,
        firstName: 'Matteo',
        lastName: 'Rossi',
        email: 'matteo.rossi@example.it',
        side: 'partner2',
        group: 'friends',
        invitationStatus: 'sent',
        rsvpStatus: 'pending',
      },
      {
        planId: weddingPlan._id,
        firstName: 'Vivienne',
        lastName: 'Sinclair',
        email: 'vivienne.s@example.com',
        side: 'both',
        group: 'vip',
        invitationStatus: 'delivered',
        rsvpStatus: 'attending',
        dietaryRestrictions: 'Gluten-Free',
        tableNumber: 'Table 2',
      },
    ]);

    console.log('[Seed] Seeding Sample Enquiry & Conversation...');
    const conversation = await Conversation.create({
      type: 'business_enquiry',
      businessId: vanceBusiness._id,
      participants: [
        { userId: coupleUser._id, role: 'client' },
        { userId: vendorUser._id, role: 'vendor' },
      ],
      lastMessage: {
        text: 'Hi Sophia! Yes, we have September 24th available on our calendar for Florence.',
        senderId: vendorUser._id,
        sentAt: new Date(),
      },
    });

    await Enquiry.create({
      businessId: vanceBusiness._id,
      userId: coupleUser._id,
      serviceId: null,
      coupleNames: 'Sophia & Julian',
      weddingDate: new Date('2026-09-24'),
      guestCount: 110,
      estimatedBudget: 5000,
      message: 'Hello Marcus! We are getting married in Florence on September 24th. We love your 35mm film aesthetic and would love to check your availability.',
      contactEmail: 'couple@wedconnect.com',
      contactPhone: '+1 (555) 234-5678',
      status: 'in_discussion',
      conversationId: conversation._id,
    });

    await Message.create({
      conversationId: conversation._id,
      senderId: coupleUser._id,
      text: 'Hello Marcus! We are getting married in Florence on September 24th. We love your 35mm film aesthetic and would love to check your availability.',
    });

    await Message.create({
      conversationId: conversation._id,
      senderId: vendorUser._id,
      text: 'Hi Sophia! Yes, we have September 24th available on our calendar for Florence. The light at Villa di Maiano in late September is breathtaking.',
    });

    console.log('[Seed] Seeding Notifications...');
    await Notification.create({
      recipientId: coupleUser._id,
      senderId: vendorUser._id,
      type: 'enquiry',
      title: 'Message from Vance & Co.',
      message: 'Marcus replied to your wedding enquiry.',
      link: `/messages/${conversation._id}`,
      isRead: false,
    });

    console.log(`
=====================================================
✨ WedConnect Database Seeded Successfully! ✨
=====================================================
Demo Credentials for testing:
- Regular User:   user@wedconnect.com    / Password123!
- Couple/Planner: couple@wedconnect.com  / Password123!
- Creator:        creator@wedconnect.com / Password123!
- Vendor:         vendor@wedconnect.com  / Password123!
- Admin:          admin@wedconnect.com   / Password123!
=====================================================
    `);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
