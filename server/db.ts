import type {
  Project,
  MediaItem,
  GenerationJob,
  VideoTemplate,
  UserProfile,
  CreditUsageLog,
  Plan,
  PlanId,
  Subscription,
  PointWallet,
  PointTransaction,
  VideoGenerationRecord,
  PaymentRecord,
} from '../src/types.js';

// Kolkata / IST Timezone helper functions
export function getKolkataDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getNextKolkataMidnight(): string {
  // Current time in Kolkata
  const now = new Date();
  const kolkataFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = kolkataFormatter.formatToParts(now);
  const findPart = (t: string) => Number(parts.find((p) => p.type === t)?.value || 0);

  const year = findPart('year');
  const month = findPart('month') - 1; // 0-indexed
  const day = findPart('day');

  // Next midnight in Kolkata is tomorrow 00:00:00 IST (UTC+5:30)
  const kolkataTomorrowMidnightUTC = new Date(Date.UTC(year, month, day + 1, 0, 0, 0) - 5.5 * 3600 * 1000);
  return kolkataTomorrowMidnightUTC.toISOString();
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'INR',
    validityDays: 0,
    dailyPointLimit: 1000,
    isUnlimited: false,
    benefits: [
      '1,000 points every day',
      'Daily reset at 12:00 AM IST',
      'AI Shorts (30s = 300 pts)',
      'Text to Video & Image to Video',
      'AI Image & Script Generator',
      'Standard generation speed',
    ],
    buttonText: 'CURRENT PLAN',
  },
  {
    id: 'starter_weekly',
    name: 'Starter Weekly',
    badge: '⭐ STARTER WEEKLY',
    price: 99,
    currency: 'INR',
    validityDays: 7,
    dailyPointLimit: 10000,
    isUnlimited: false,
    benefits: [
      '10,000 points every day',
      'AI Shorts',
      'Long Video',
      'Text to Video',
      'Image to Video',
      'AI Image',
      'Script to Video',
    ],
    buttonText: 'GET STARTED',
  },
  {
    id: 'creator_monthly',
    name: 'Creator Monthly',
    badge: '👑 CREATOR MONTHLY',
    price: 150,
    currency: 'INR',
    validityDays: 30,
    dailyPointLimit: 10000,
    isUnlimited: false,
    benefits: [
      '10,000 points every day',
      'AI Shorts',
      'Long Video',
      'Text to Video',
      'Image to Video',
      'AI Image',
      'Script to Video',
    ],
    buttonText: 'GET CREATOR',
  },
  {
    id: 'unlimited_monthly',
    name: 'Unlimited Monthly',
    badge: '🔥 MOST POPULAR',
    price: 599,
    currency: 'INR',
    validityDays: 30,
    dailyPointLimit: 9999999,
    isUnlimited: true,
    benefits: [
      'Unlimited points',
      'Unlimited video generation',
      'AI Shorts',
      'Long Video',
      'Text to Video',
      'Image to Video',
      'AI Image',
      'Script to Video',
      'Priority generation',
    ],
    buttonText: 'GO UNLIMITED',
    popular: true,
  },
];

// In-Memory Database store with pre-seeded projects, media, and templates
class DatabaseStore {
  user: UserProfile = {
    id: 'usr_default_1',
    name: 'Ashish Makwana',
    email: 'makwanaashish165@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    credits: 1000,
    maxCredits: 1000,
    plan: 'Free',
    planId: 'free',
    role: 'admin',
  };

  users: UserProfile[] = [];
  plans: Plan[] = PLANS;
  subscriptions: Subscription[] = [];
  wallets: Record<string, PointWallet> = {};
  pointTransactions: PointTransaction[] = [];
  videoGenerations: VideoGenerationRecord[] = [];
  payments: PaymentRecord[] = [];

  constructor() {
    this.initPreseededData();
  }

  private initPreseededData() {
    const todayKolkata = getKolkataDateString();

    // Default primary user
    this.users = [
      this.user,
      {
        id: 'usr_rohan',
        name: 'Rohan Verma',
        email: 'rohan.creations@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        credits: 7500,
        maxCredits: 10000,
        plan: 'Starter Weekly',
        planId: 'starter_weekly',
        role: 'user',
      },
      {
        id: 'usr_priya',
        name: 'Priya Sharma',
        email: 'priya.ai@outlook.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        credits: 8200,
        maxCredits: 10000,
        plan: 'Creator Monthly',
        planId: 'creator_monthly',
        role: 'user',
      },
      {
        id: 'usr_vikram',
        name: 'Vikram Singhania',
        email: 'vikram.media@studio.in',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        credits: 999999,
        maxCredits: 999999,
        plan: 'Unlimited Monthly',
        planId: 'unlimited_monthly',
        role: 'user',
      },
      {
        id: 'usr_ananya',
        name: 'Ananya Patel',
        email: 'ananya.tech@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
        credits: 1000,
        maxCredits: 1000,
        plan: 'Free',
        planId: 'free',
        role: 'user',
      },
    ];

    // Seed wallets
    this.wallets['usr_default_1'] = {
      userId: 'usr_default_1',
      dailyLimit: 1000,
      remainingPoints: 1000,
      usedToday: 0,
      lastResetDate: todayKolkata,
      nextResetTime: getNextKolkataMidnight(),
      isUnlimited: false,
    };

    this.wallets['usr_rohan'] = {
      userId: 'usr_rohan',
      dailyLimit: 10000,
      remainingPoints: 7500,
      usedToday: 2500,
      lastResetDate: todayKolkata,
      nextResetTime: getNextKolkataMidnight(),
      isUnlimited: false,
    };

    this.wallets['usr_priya'] = {
      userId: 'usr_priya',
      dailyLimit: 10000,
      remainingPoints: 8200,
      usedToday: 1800,
      lastResetDate: todayKolkata,
      nextResetTime: getNextKolkataMidnight(),
      isUnlimited: false,
    };

    this.wallets['usr_vikram'] = {
      userId: 'usr_vikram',
      dailyLimit: 9999999,
      remainingPoints: 999999,
      usedToday: 1200,
      lastResetDate: todayKolkata,
      nextResetTime: getNextKolkataMidnight(),
      isUnlimited: true,
    };

    this.wallets['usr_ananya'] = {
      userId: 'usr_ananya',
      dailyLimit: 1000,
      remainingPoints: 1000,
      usedToday: 0,
      lastResetDate: todayKolkata,
      nextResetTime: getNextKolkataMidnight(),
      isUnlimited: false,
    };

    // Pre-seed sample transactions
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const fourHoursAgo = new Date(Date.now() - 4 * 3600 * 1000).toISOString();

    this.pointTransactions = [
      {
        id: `tx_${Date.now()}_1`,
        userId: 'usr_default_1',
        type: 'daily_reset',
        amount: 1000,
        balanceAfter: 1000,
        description: 'Daily Points Reset (12:00 AM IST)',
        createdAt: todayKolkata + 'T00:00:00.000Z',
      },
      {
        id: `tx_${Date.now()}_2`,
        userId: 'usr_default_1',
        type: 'generation',
        amount: -100,
        balanceAfter: 900,
        videoDuration: 10,
        description: 'AI Video Generated (10 sec)',
        createdAt: fourHoursAgo,
      },
      {
        id: `tx_${Date.now()}_3`,
        userId: 'usr_default_1',
        type: 'generation',
        amount: -200,
        balanceAfter: 700,
        videoDuration: 20,
        description: 'AI Video Generated (20 sec)',
        createdAt: twoHoursAgo,
      },
      {
        id: `tx_${Date.now()}_4`,
        userId: 'usr_default_1',
        type: 'refund',
        amount: 100,
        balanceAfter: 800,
        description: 'Generation Failed (+100 Refund)',
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
    ];

    // Align user.credits with wallet remaining points
    this.user.credits = this.wallets['usr_default_1'].remainingPoints;
  }

  projects: Project[] = [
    {
      id: 'proj_1',
      title: 'The 1% Morning Routine That Changed My Life',
      description: 'Viral motivational short on how billionaire habits rewire cognitive stamina in 15 minutes.',
      platform: 'YouTube Shorts',
      aspectRatio: '9:16',
      duration: 30,
      style: 'Cinematic',
      language: 'English',
      voiceName: 'Zephyr',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      hook: '99% of people wake up wrong every single day.',
      cta: 'Follow for the daily cognitive upgrade.',
      hashtags: ['#MorningRoutine', '#Success', '#Productivity', '#Shorts', '#Mindset'],
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      scenes: [
        {
          id: 'sc_1',
          sceneNumber: 1,
          duration: 5,
          narration: '99% of people wake up wrong every single day, sabotaging their brain chemistry before their feet hit the floor.',
          visualPrompt: 'Cinematic slow-motion shot of a shadowy bedroom at dawn, soft golden sun rays piercing through blinds, ultra photorealistic 8k.',
          cameraDirection: 'Slow Zoom',
          style: 'Cinematic',
          transition: 'fade',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'sc_2',
          sceneNumber: 2,
          duration: 6,
          narration: 'The top 1% never touch their phones for the first 30 minutes. Instead, they expose their eyes to natural light.',
          visualPrompt: 'Extreme close up of an eye dilating as morning sunlight reflects in the iris, cinematic lens flare, anamorphic 35mm.',
          cameraDirection: 'Dolly Shot',
          style: 'Cinematic',
          transition: 'cut',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'sc_3',
          sceneNumber: 3,
          duration: 6,
          narration: 'Next: 500 milliliters of cold water with a pinch of Himalayan salt to ignite cellular hydration.',
          visualPrompt: 'High speed macro capture of pure crystal water droplets splashing into a glass tumbler, dynamic lighting, dark background.',
          cameraDirection: 'Handheld',
          style: 'Cinematic',
          transition: 'zoom',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'sc_4',
          sceneNumber: 4,
          duration: 7,
          narration: 'Then, 10 minutes of deep physiological sighs. This resets cortisol levels and unlocks superhuman focus.',
          visualPrompt: 'Solitary figure standing atop a misty mountain ridge overlooking a sunrise valley, majestic wide shot, epic scale.',
          cameraDirection: 'Orbit',
          style: 'Cinematic',
          transition: 'dissolve',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'sc_5',
          sceneNumber: 5,
          duration: 6,
          narration: 'Start tomorrow morning. Save this video right now so you do not forget.',
          visualPrompt: 'Fast hyperlapse of city skyscrapers at twilight with glowing amber car trails, cinematic grading, bold energy.',
          cameraDirection: 'Tracking Shot',
          style: 'Cinematic',
          transition: 'fade',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      id: 'proj_2',
      title: 'AI in 2030: What Silicon Valley Hides From You',
      description: 'High-octane documentary short uncovering autonomous humanoid robotics and neural interfaces.',
      platform: 'TikTok',
      aspectRatio: '9:16',
      duration: 30,
      style: 'Cyberpunk',
      language: 'English',
      voiceName: 'Fenrir',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      hook: 'Artificial General Intelligence is closer than you think.',
      cta: 'Subscribe for daily future tech insights.',
      hashtags: ['#ArtificialIntelligence', '#Cyberpunk', '#Future', '#Tech', '#AI'],
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      scenes: [
        {
          id: 'sc_21',
          sceneNumber: 1,
          duration: 6,
          narration: 'Behind closed lab doors in Zurich and San Francisco, AI models are no longer just predicting text.',
          visualPrompt: 'Glowing holographic quantum computer core in a sterile black laboratory, neon cyan and magenta reflections, 8k render.',
          cameraDirection: 'Slow Zoom',
          style: 'Cyberpunk',
          transition: 'cut',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'sc_22',
          sceneNumber: 2,
          duration: 6,
          narration: 'They are redesigning microchips, writing their own operating systems, and controlling physical humanoid units.',
          visualPrompt: 'Sleek matte-white humanoid robot walking gracefully in an automated factory, cinematic volumetric fog, hyper-detailed.',
          cameraDirection: 'Tracking Shot',
          style: 'Cyberpunk',
          transition: 'slide',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'sc_23',
          sceneNumber: 3,
          duration: 6,
          narration: 'By 2030, the divide won’t be between the rich and poor, but between those who command AI and those replaced by it.',
          visualPrompt: 'Futuristic megacity skyline at night with flying vehicles and towering neon holo-advertisements, Blade Runner aesthetic.',
          cameraDirection: 'Pan Left',
          style: 'Cyberpunk',
          transition: 'zoom',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'sc_24',
          sceneNumber: 4,
          duration: 6,
          narration: 'Are you preparing for the shift, or waiting for it to happen to you?',
          visualPrompt: 'Dramatic silhouette of a human standing face-to-face with a glowing AI entity, cinematic teal rim light.',
          cameraDirection: 'Dolly Shot',
          style: 'Cyberpunk',
          transition: 'fade',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      id: 'proj_3',
      title: 'The Deep Sea Creature That Defies Biology',
      description: 'Curious ocean documentary on the immortal jellyfish and deep hydrothermal vent ecosystems.',
      platform: 'Instagram Reels',
      aspectRatio: '9:16',
      duration: 30,
      style: 'Documentary',
      language: 'English',
      voiceName: 'Kore',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
      hook: 'There is an animal on Earth that literally cannot die of old age.',
      cta: 'Share with someone who loves ocean mysteries.',
      hashtags: ['#DeepSea', '#Documentary', '#Science', '#Nature', '#Shorts'],
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 80).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      scenes: [
        {
          id: 'sc_31',
          sceneNumber: 1,
          duration: 7,
          narration: 'Deep in the abyssal ocean, under crushing pressure, lives the Turritopsis dohrnii.',
          visualPrompt: 'Bioluminescent jellyfish floating in midnight ocean waters, glowing tentacles, macro underwater photography.',
          cameraDirection: 'Slow Zoom',
          style: 'Documentary',
          transition: 'fade',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'sc_32',
          sceneNumber: 2,
          duration: 8,
          narration: 'When damaged or starving, it doesn’t die. It reverts its adult cells back into baby polyps, restarting its lifecycle forever.',
          visualPrompt: 'Microscopic cell transformation glowing with golden biological luminescence, dark microscope background.',
          cameraDirection: 'Orbit',
          style: 'Documentary',
          transition: 'dissolve',
          mediaType: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80',
        },
      ],
    },
  ];

  media: MediaItem[] = [
    {
      id: 'med_1',
      name: 'Cyberpunk Drone Cityscape',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
      size: 1420000,
      category: 'Generated Assets',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'med_2',
      name: 'Sunrise Mist Mountain Peak',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
      size: 2180000,
      category: 'Uploaded Files',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'med_3',
      name: 'Humanoid Robot Portrait',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80',
      size: 1980000,
      category: 'Generated Assets',
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    },
    {
      id: 'med_4',
      name: 'Bioluminescent Abyss',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&auto=format&fit=crop&q=80',
      size: 2540000,
      category: 'Stock',
      createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    },
    {
      id: 'med_5',
      name: 'Cinematic Ambient Audio',
      type: 'audio',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cinematic-atmosphere-score-112191.mp3',
      duration: 32,
      size: 980000,
      category: 'Stock',
      createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    },
  ];

  generations: GenerationJob[] = [
    {
      id: 'gen_101',
      type: 'shorts',
      status: 'completed',
      progress: 100,
      currentStep: 'Render complete',
      steps: ['Idea Analyzed', 'Viral Hook & Script Created', 'Scenes & Visual Prompts Planned', 'Media Generated', 'Voiceover Synced', 'Render Complete'],
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 3 + 24000).toISOString(),
    },
    {
      id: 'gen_102',
      type: 'image',
      status: 'completed',
      progress: 100,
      currentStep: 'High-res generation ready',
      steps: ['Prompt enhanced', 'Rendering 4K frame', 'Complete'],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 12 + 6000).toISOString(),
    },
  ];

  usageLogs: CreditUsageLog[] = [
    {
      id: 'usg_1',
      type: 'Video Generation',
      amount: 50,
      projectTitle: 'The 1% Morning Routine',
      timestamp: '2 hours ago',
    },
    {
      id: 'usg_2',
      type: 'Image Generation',
      amount: 10,
      projectTitle: 'Cyberpunk Drone Cityscape',
      timestamp: '4 hours ago',
    },
    {
      id: 'usg_3',
      type: 'Text Generation',
      amount: 5,
      projectTitle: 'AI in 2030 Script',
      timestamp: '12 hours ago',
    },
    {
      id: 'usg_4',
      type: 'Voice Generation',
      amount: 15,
      projectTitle: 'Deep Sea Biological Voiceover',
      timestamp: 'Yesterday',
    },
  ];

  templates: VideoTemplate[] = [
    {
      id: 'tpl_1',
      title: 'Viral Luxury Motivation',
      description: 'High-status aesthetics with motivational storytelling, dark minimalist grading, and bold kinetic typography.',
      category: 'Motivation',
      duration: 30,
      aspectRatio: '9:16',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
      scenesCount: 5,
      style: 'Luxury',
      samplePrompt: 'Create a motivational short about why working in silence produces deafening success.',
    },
    {
      id: 'tpl_2',
      title: 'Dark History & Mysteries',
      description: 'Haunting historical deep-dives with atmospheric noir lighting, tense pacing, and eerie cliffhangers.',
      category: 'Storytelling',
      duration: 45,
      aspectRatio: '9:16',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      scenesCount: 6,
      style: 'Documentary',
      samplePrompt: 'The true story of the ghost ship Mary Celeste and what was found on the breakfast table.',
    },
    {
      id: 'tpl_3',
      title: 'Mind-Blowing Science Facts',
      description: 'Rapid-fire cognitive hooks with macro visuals, animated captions, and high sensory retention.',
      category: 'Facts',
      duration: 30,
      aspectRatio: '9:16',
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      scenesCount: 5,
      style: 'Cinematic',
      samplePrompt: '3 physics facts that prove reality is completely different from what your eyes show you.',
    },
    {
      id: 'tpl_4',
      title: 'Tech & AI Breakthroughs',
      description: 'Silicon Valley insider tone with neon cyberpunk visual direction and forward-looking analysis.',
      category: 'Business',
      duration: 60,
      aspectRatio: '9:16',
      thumbnailUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80',
      scenesCount: 7,
      style: 'Cyberpunk',
      samplePrompt: 'How autonomous AI agents are quietly replacing 40% of corporate middle management.',
    },
    {
      id: 'tpl_5',
      title: 'E-Commerce Product Ad',
      description: 'High-converting product showcase with punchy value propositions, crisp macro zooms, and urgent call-to-actions.',
      category: 'Product Ads',
      duration: 20,
      aspectRatio: '9:16',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      scenesCount: 4,
      style: 'Realistic',
      samplePrompt: 'An irresistible 20-second commercial for premium matte-black noise-cancelling headphones.',
    },
    {
      id: 'tpl_6',
      title: 'Epic Gaming Moments & Lore',
      description: 'Vibrant anime/3D gaming storytelling with dynamic camera transitions and cinematic energy.',
      category: 'Gaming',
      duration: 45,
      aspectRatio: '9:16',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      scenesCount: 6,
      style: 'Anime',
      samplePrompt: 'The legendary player who defeated an unbeatable boss using only a wooden shield.',
    },
  ];

  // Helper methods & Points/Subscription Engine
  getUser(userId: string = this.user.id): UserProfile {
    const found = this.users.find((u) => u.id === userId);
    return found || this.user;
  }

  getUserSubscription(userId: string = this.user.id): Subscription | undefined {
    return this.subscriptions.find((s) => s.userId === userId && s.status === 'active');
  }

  checkSubscriptionExpiry(userId: string = this.user.id): void {
    const sub = this.getUserSubscription(userId);
    if (sub && sub.expiryDate) {
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      if (now > expiry) {
        sub.status = 'expired';
        const user = this.getUser(userId);
        user.plan = 'Free';
        user.planId = 'free';

        const wallet = this.wallets[userId];
        if (wallet) {
          wallet.dailyLimit = 1000;
          wallet.isUnlimited = false;
        }

        this.pointTransactions.unshift({
          id: `tx_${Date.now()}_exp`,
          userId,
          type: 'admin_adjustment',
          amount: 0,
          balanceAfter: wallet ? wallet.remainingPoints : 1000,
          description: `Subscription expired (${sub.planName}). Reverted to Free plan (1,000 pts/day).`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  checkAndApplyDailyReset(userId: string = this.user.id): PointWallet {
    this.checkSubscriptionExpiry(userId);

    const todayKolkata = getKolkataDateString();
    let wallet = this.wallets[userId];

    if (!wallet) {
      wallet = {
        userId,
        dailyLimit: 1000,
        remainingPoints: 1000,
        usedToday: 0,
        lastResetDate: todayKolkata,
        nextResetTime: getNextKolkataMidnight(),
        isUnlimited: false,
      };
      this.wallets[userId] = wallet;
    }

    wallet.nextResetTime = getNextKolkataMidnight();

    // Check if a new day has arrived in Asia/Kolkata
    if (wallet.lastResetDate !== todayKolkata) {
      const previousBalance = wallet.remainingPoints;
      // Daily reset: Points do NOT carry over to the next day!
      wallet.remainingPoints = wallet.isUnlimited ? 999999 : wallet.dailyLimit;
      wallet.usedToday = 0;
      wallet.lastResetDate = todayKolkata;

      // Record daily reset transaction
      this.pointTransactions.unshift({
        id: `tx_reset_${Date.now()}`,
        userId,
        type: 'daily_reset',
        amount: wallet.dailyLimit,
        balanceAfter: wallet.remainingPoints,
        description: `Daily Points Reset (12:00 AM IST) - ${wallet.isUnlimited ? 'Unlimited' : wallet.dailyLimit.toLocaleString()} Points Restocked`,
        createdAt: new Date().toISOString(),
      });
    }

    // Sync user credits display
    const user = this.getUser(userId);
    user.credits = wallet.remainingPoints;
    user.maxCredits = wallet.dailyLimit;
    if (userId === this.user.id) {
      this.user.credits = wallet.remainingPoints;
      this.user.maxCredits = wallet.dailyLimit;
    }

    return wallet;
  }

  getUserWallet(userId: string = this.user.id): PointWallet {
    return this.checkAndApplyDailyReset(userId);
  }

  calculateVideoPointCost(durationInSeconds: number, isUnlimited: boolean = false): number {
    if (isUnlimited) return 0;
    // Formula: cost = videoDurationInSeconds * 10 (minimum 10s = 100 pts)
    const effectiveSecs = Math.max(10, Math.round(durationInSeconds || 10));
    return effectiveSecs * 10;
  }

  deductPointsForVideo(
    userId: string = this.user.id,
    durationInSeconds: number,
    videoType: VideoGenerationRecord['type'],
    title: string = 'AI Video'
  ): {
    success: boolean;
    cost: number;
    remainingPoints: number;
    isUnlimited: boolean;
    generationId?: string;
    error?: string;
    requiredPoints?: number;
    balance?: number;
  } {
    const wallet = this.checkAndApplyDailyReset(userId);
    const cost = this.calculateVideoPointCost(durationInSeconds, wallet.isUnlimited);

    if (!wallet.isUnlimited && wallet.remainingPoints < cost) {
      return {
        success: false,
        cost,
        remainingPoints: wallet.remainingPoints,
        isUnlimited: false,
        error: `Insufficient Points. This video requires ${cost.toLocaleString()} Points, but your balance is ${wallet.remainingPoints.toLocaleString()} Points.`,
        requiredPoints: cost,
        balance: wallet.remainingPoints,
      };
    }

    // Deduct points safely
    if (!wallet.isUnlimited) {
      wallet.remainingPoints = Math.max(0, wallet.remainingPoints - cost);
      wallet.usedToday += cost;
    }

    const generationId = `vgen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveDuration = Math.max(10, Math.round(durationInSeconds || 10));

    // Record video generation
    this.videoGenerations.unshift({
      id: generationId,
      userId,
      type: videoType,
      title,
      duration: effectiveDuration,
      pointsCost: cost,
      status: 'started',
      createdAt: new Date().toISOString(),
    });

    // Record point transaction
    this.pointTransactions.unshift({
      id: `tx_${Date.now()}`,
      userId,
      type: 'generation',
      amount: -cost,
      balanceAfter: wallet.remainingPoints,
      videoGenerationId: generationId,
      videoDuration: effectiveDuration,
      description: `${title} (${effectiveDuration} sec)`,
      createdAt: new Date().toISOString(),
    });

    // Sync legacy credit logs & user model
    const user = this.getUser(userId);
    user.credits = wallet.remainingPoints;
    if (userId === this.user.id) {
      this.user.credits = wallet.remainingPoints;
    }

    this.usageLogs.unshift({
      id: `usg_${Date.now()}`,
      type: 'Video Generation',
      amount: cost,
      projectTitle: `${title} (${effectiveDuration}s)`,
      timestamp: 'Just now',
    });

    return {
      success: true,
      cost,
      remainingPoints: wallet.remainingPoints,
      isUnlimited: wallet.isUnlimited,
      generationId,
    };
  }

  refundVideoPoints(userId: string = this.user.id, generationId: string, reason: string = 'Generation Error'): boolean {
    const gen = this.videoGenerations.find((g) => g.id === generationId);
    if (!gen) return false;

    gen.status = 'failed';
    const wallet = this.checkAndApplyDailyReset(userId);

    if (!wallet.isUnlimited && gen.pointsCost > 0) {
      wallet.remainingPoints += gen.pointsCost;
      wallet.usedToday = Math.max(0, wallet.usedToday - gen.pointsCost);

      this.pointTransactions.unshift({
        id: `tx_rf_${Date.now()}`,
        userId,
        type: 'refund',
        amount: gen.pointsCost,
        balanceAfter: wallet.remainingPoints,
        videoGenerationId: generationId,
        videoDuration: gen.duration,
        description: `Generation Failed (+${gen.pointsCost} Refund)`,
        createdAt: new Date().toISOString(),
      });

      const user = this.getUser(userId);
      user.credits = wallet.remainingPoints;
      if (userId === this.user.id) {
        this.user.credits = wallet.remainingPoints;
      }
    }

    return true;
  }

  completeVideoGeneration(generationId: string): void {
    const gen = this.videoGenerations.find((g) => g.id === generationId);
    if (gen) {
      gen.status = 'completed';
    }
  }

  activateSubscription(
    userId: string = this.user.id,
    planId: PlanId,
    paymentDetails: {
      orderId: string;
      paymentId: string;
      signature?: string;
      amount: number;
    }
  ): {
    subscription: Subscription;
    wallet: PointWallet;
    user: UserProfile;
  } {
    const plan = PLANS.find((p) => p.id === planId) || PLANS[1];
    const user = this.getUser(userId);

    const now = new Date();
    const expiryDate = new Date(now.getTime() + plan.validityDays * 24 * 3600 * 1000).toISOString();

    // Deactivate previous active subscriptions
    this.subscriptions.forEach((s) => {
      if (s.userId === userId && s.status === 'active') {
        s.status = 'cancelled';
      }
    });

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      planId: plan.id,
      planName: plan.name,
      status: 'active',
      startDate: now.toISOString(),
      expiryDate,
      dailyPointLimit: plan.dailyPointLimit,
      isUnlimited: plan.isUnlimited,
    };
    this.subscriptions.unshift(subscription);

    // Record payment
    const paymentRecord: PaymentRecord = {
      id: `pay_${Date.now()}`,
      userId,
      planId: plan.id,
      planName: plan.name,
      orderId: paymentDetails.orderId,
      paymentId: paymentDetails.paymentId,
      signature: paymentDetails.signature,
      amount: paymentDetails.amount,
      currency: 'INR',
      status: 'paid',
      createdAt: now.toISOString(),
    };
    this.payments.unshift(paymentRecord);

    // Update user profile
    user.plan = plan.name;
    user.planId = plan.id;
    user.subscription = subscription;

    // Update point wallet
    const wallet = this.checkAndApplyDailyReset(userId);
    wallet.dailyLimit = plan.dailyPointLimit;
    wallet.isUnlimited = plan.isUnlimited;
    wallet.remainingPoints = plan.isUnlimited ? 999999 : plan.dailyPointLimit;
    wallet.usedToday = 0;

    user.credits = wallet.remainingPoints;
    user.maxCredits = wallet.dailyLimit;
    user.wallet = wallet;

    if (userId === this.user.id) {
      this.user.plan = plan.name;
      this.user.planId = plan.id;
      this.user.credits = wallet.remainingPoints;
      this.user.maxCredits = wallet.dailyLimit;
      this.user.subscription = subscription;
      this.user.wallet = wallet;
    }

    // Record transaction
    this.pointTransactions.unshift({
      id: `tx_sub_${Date.now()}`,
      userId,
      type: 'subscription_bonus',
      amount: plan.isUnlimited ? 999999 : plan.dailyPointLimit,
      balanceAfter: wallet.remainingPoints,
      description: `Activated ${plan.name} Plan (${plan.validityDays} Days) - Daily Limit Set to ${plan.isUnlimited ? 'Unlimited' : plan.dailyPointLimit.toLocaleString()} Points`,
      createdAt: now.toISOString(),
    });

    return { subscription, wallet, user };
  }

  getAdminStats() {
    const totalUsers = this.users.length;
    const premiumUsers = this.users.filter((u) => u.planId && u.planId !== 'free').length;
    const freeUsers = totalUsers - premiumUsers;
    const activeSubscriptions = this.subscriptions.filter((s) => s.status === 'active').length;

    const todayKolkata = getKolkataDateString();
    const todayGenerations = this.videoGenerations.filter((g) => g.createdAt.startsWith(todayKolkata)).length;
    const todayPointsUsed = Object.values(this.wallets).reduce((sum, w) => sum + (w.usedToday || 0), 0);
    const totalRevenue = this.payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const userSummaries = this.users.map((u) => {
      const w = this.checkAndApplyDailyReset(u.id);
      const sub = this.subscriptions.find((s) => s.userId === u.id && s.status === 'active');
      const gensCount = this.videoGenerations.filter((g) => g.userId === u.id).length;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        plan: u.plan,
        planId: u.planId || 'free',
        remainingPoints: w.remainingPoints,
        dailyLimit: w.dailyLimit,
        isUnlimited: w.isUnlimited,
        usedToday: w.usedToday,
        subscriptionStatus: sub ? 'Active' : 'Free / Inactive',
        expiryDate: sub ? sub.expiryDate : 'N/A',
        generationsCount: gensCount,
        role: u.role || 'user',
      };
    });

    return {
      totalUsers,
      freeUsers,
      premiumUsers,
      activeSubscriptions,
      todayGenerations,
      todayPointsUsed,
      totalRevenue,
      users: userSummaries,
    };
  }

  // Legacy helper method for small text/voice tools
  deductCredits(amount: number, type: CreditUsageLog['type'], projectTitle: string = 'AI Creation'): boolean {
    const wallet = this.checkAndApplyDailyReset(this.user.id);
    if (wallet.isUnlimited) return true;
    if (wallet.remainingPoints < amount) {
      return false;
    }
    wallet.remainingPoints -= amount;
    wallet.usedToday += amount;
    this.user.credits = wallet.remainingPoints;

    this.usageLogs.unshift({
      id: `usg_${Date.now()}`,
      type,
      amount,
      projectTitle,
      timestamp: 'Just now',
    });
    return true;
  }
}

export const db = new DatabaseStore();
