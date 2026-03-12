export interface ArticleSection {
  title: string;
  content: string;
  tips?: string[];
  warnings?: string[];
}

export interface RelatedArticle {
  title: string;
  link: string;
}

export interface Article {
  title: string;
  readTime: string;
  lastUpdated: string;
  introduction: string;
  sections: ArticleSection[];
  relatedArticles?: RelatedArticle[];
}

export type ArticleCategory = Record<string, Article>;

export const articlesData: Record<string, ArticleCategory> = {
  // ==================== GETTING STARTED ====================
  "getting-started": {
    "creating-account": {
      title: "Creating Your Account",
      readTime: "3 min",
      lastUpdated: "March 2026",
      introduction: "Welcome to LumiAI! This guide will walk you through creating your account and getting started with our platform. Whether you're a creator looking to grow your brand or a company seeking influencers, we've got you covered.",
      sections: [
        {
          title: "Step 1: Choose Your Account Type",
          content: `First, decide which type of account suits your needs:

• Creator Account: For influencers, content creators, and social media personalities who want to connect with brands and monetize their content.

• Brand/Company Account: For businesses looking to find creators, run campaigns, and manage partnerships.

• Admin Account: For platform administrators (restricted access).

Each account type has tailored features and dashboards designed for your specific needs.`,
          tips: ["You can switch account types later, but you'll need to contact support", "Creator accounts get access to AI tools for content creation"]
        },
        {
          title: "Step 2: Sign Up with Email",
          content: `To create your account:

1. Visit the LumiAI homepage and click "Get Started"
2. Enter your email address
3. Create a strong password (at least 8 characters with numbers and symbols)
4. Confirm your email by clicking the verification link sent to your inbox
5. Complete your profile setup

Alternatively, you can sign up using your Google, Instagram, or TikTok account for faster onboarding.`,
          warnings: ["Use an email you have regular access to - important notifications go here", "Never share your login credentials with anyone"]
        },
        {
          title: "Step 3: Verify Your Identity",
          content: `To maintain platform security and trust:

• Creators: Connect at least one social media account to verify your online presence
• Brands: Provide business registration details or official company email
• All users: Complete the CAPTCHA verification

This helps us ensure a safe community for all users and prevents fake accounts.`,
          tips: ["Connecting social accounts also unlocks analytics features", "Verification typically takes less than 5 minutes"]
        }
      ],
      relatedArticles: [
        { title: "Setting up your profile", link: "/help/article/getting-started/setting-up-profile" },
        { title: "Connecting social accounts", link: "/help/article/getting-started/connecting-social" }
      ]
    },
    "setting-up-profile": {
      title: "Setting Up Your Profile",
      readTime: "5 min",
      lastUpdated: "March 2026",
      introduction: "Your LumiAI profile is your digital storefront. A complete, professional profile helps you stand out to brands (if you're a creator) or attract quality creators (if you're a brand). Let's make yours shine!",
      sections: [
        {
          title: "Profile Photo & Cover Image",
          content: `First impressions matter! Upload:

• Profile Photo: A clear, professional headshot or logo (500x500px recommended)
• Cover Image: A banner that represents your brand or personality (1500x500px)

For creators: Use a friendly, approachable photo that shows your personality
For brands: Use your official logo and brand colors consistently`,
          tips: ["Use the same profile photo across all your social platforms for consistency", "Update your cover image seasonally or for special campaigns"]
        },
        {
          title: "Bio & Description",
          content: `Craft a compelling bio (max 500 characters for creators, 1000 for brands):

For Creators:
• Your niche and content focus
• What makes you unique
• Notable achievements or metrics
• Contact preferences

For Brands:
• Company overview
• Types of creators you work with
• Campaign preferences
• Brand values and mission`,
          tips: ["Include relevant keywords to improve searchability", "Update your bio when you hit milestone numbers (followers, views, etc.)"]
        },
        {
          title: "Portfolio & Media Kit",
          content: `Showcase your best work:

Creators can add:
• Best content samples (photos, videos, links)
• Previous brand collaborations
• Audience demographics
• Rate cards

Brands can add:
• Past campaign examples
• Product catalogs
• Brand guidelines
• Success stories`,
          warnings: ["Only upload content you own or have permission to share", "Keep your portfolio updated with recent work"]
        },
        {
          title: "Account Settings & Preferences",
          content: `Configure your account for optimal use:

• Notifications: Choose email and push notification preferences
• Privacy: Control what information is publicly visible
• Payment: Set up payment methods for marketplace transactions
• Security: Enable two-factor authentication (2FA)
• Languages: Select your preferred language

Take time to review each section to ensure your account works exactly how you want it to.`,
          tips: ["Enable 2FA for maximum security", "Review privacy settings monthly to ensure they still match your preferences"]
        }
      ],
      relatedArticles: [
        { title: "Creating your media kit", link: "/help/article/marketplace/media-kit" },
        { title: "Understanding your dashboard", link: "/help/article/getting-started/understanding-dashboard" }
      ]
    },
    "understanding-dashboard": {
      title: "Understanding Your Dashboard",
      readTime: "4 min",
      lastUpdated: "March 2026",
      introduction: "Your dashboard is command central for everything you do on LumiAI. This guide breaks down each section so you can navigate like a pro and make the most of our platform's features.",
      sections: [
        {
          title: "Dashboard Overview",
          content: `When you log in, you'll see:

• Quick Stats: Follower growth, engagement rate, earnings (creators) or campaign performance (brands)
• Recent Activity: New messages, partnership requests, notifications
• Recommended: Suggested campaigns, creators to follow, or trending content
• Action Items: Pending tasks requiring your attention

The dashboard is customizable - drag and drop widgets to arrange them how you prefer.`,
          tips: ["Pin your most-used widgets to the top for quick access", "Use the 'Compact View' toggle if you prefer a denser layout"]
        },
        {
          title: "Navigation Menu",
          content: `The sidebar menu gives you access to all features:

For Creators:
• AI Hub: Access Storyboard AI, Caption AI, and Market Advisor
• Marketplace: Browse and apply to brand campaigns
• My Partnerships: Track active collaborations
• Equipment: Rent gear or list your own
• Analytics: View detailed performance metrics

For Brands:
• Creator Search: Find influencers by niche, location, or metrics
• Campaigns: Create and manage marketing campaigns
• Partnerships: Track ongoing creator relationships
• Analytics: Measure campaign ROI and performance`,
          tips: ["Use keyboard shortcuts (shown in tooltips) for faster navigation", "Collapse the sidebar for more workspace when creating content"]
        },
        {
          title: "Notifications Center",
          content: `Stay on top of everything:

• Messages: Direct messages from partners
• Alerts: Campaign updates, application status changes
• System: Platform updates, maintenance notices
• Reminders: Upcoming deadlines, scheduled posts

Click the bell icon to see all notifications. Mark items as read or archive them to keep your inbox organized.`,
          warnings: ["Important security alerts cannot be turned off", "Check your notification settings if you're receiving too many emails"]
        }
      ],
      relatedArticles: [
        { title: "Reading your analytics", link: "/help/article/analytics/reading-analytics" },
        { title: "Using Storyboard AI", link: "/help/article/ai-tools/storyboard-guide" }
      ]
    },
    "connecting-social": {
      title: "Connecting Social Accounts",
      readTime: "3 min",
      lastUpdated: "March 2026",
      introduction: "Linking your social media accounts unlocks powerful features like cross-platform analytics, automated content posting, and verified metrics that brands trust. Here's how to connect them securely.",
      sections: [
        {
          title: "Supported Platforms",
          content: `LumiAI supports connections with:

• Instagram: Business and Creator accounts (required for full features)
• TikTok: Personal and Business accounts
• YouTube: Channels with public statistics
• Twitter/X: Public accounts
• LinkedIn: Personal profiles and Company pages
• Pinterest: Business accounts

Each platform provides different data points to enhance your LumiAI experience.`,
          tips: ["Connect as many platforms as possible for the best analytics", "Business/Creator accounts provide more detailed metrics than personal accounts"]
        },
        {
          title: "How to Connect",
          content: `Connecting your accounts:

1. Go to Settings → Connected Accounts
2. Click "Add Account" next to the platform you want to connect
3. You'll be redirected to the platform to authorize LumiAI
4. Grant the requested permissions (we only ask for what's necessary)
5. You'll be returned to LumiAI with the connection confirmed

The process takes about 2 minutes per platform and is completely secure.`,
          warnings: ["Never enter your social media passwords directly on LumiAI", "We use official OAuth connections - you'll always be on the platform's website to login"]
        },
        {
          title: "Managing Permissions",
          content: `Control what LumiAI can access:

• Read-only access: We can view metrics and content (default)
• Publishing access: Allows posting content from LumiAI (optional)
• Messaging access: For unified inbox features (optional)

You can modify permissions anytime from Settings → Connected Accounts → Manage. Revoking permissions won't delete your LumiAI data, but some features may become limited.`,
          tips: ["Start with read-only access and add more permissions as you get comfortable", "Review connected accounts monthly to remove any you no longer use"]
        }
      ],
      relatedArticles: [
        { title: "Understanding audience insights", link: "/help/article/analytics/audience-insights" },
        { title: "Reading your analytics", link: "/help/article/analytics/reading-analytics" }
      ]
    }
  },

  // ==================== AI TOOLS ====================
  "ai-tools": {
    "storyboard-guide": {
      title: "Using Storyboard AI",
      readTime: "5 min",
      lastUpdated: "March 2026",
      introduction: "Storyboard AI helps you visualize your content before you create it. Generate scene-by-scene storyboards, get shot suggestions, and plan your content like a professional filmmaker - all with AI assistance.",
      sections: [
        {
          title: "Getting Started with Storyboard AI",
          content: `Access Storyboard AI from the AI Hub or directly at /ai-hub/storyboard. You'll see:

• Project Input: Describe your video idea, brand requirements, or campaign brief
• Style Selection: Choose from cinematic, vlog-style, product-focused, or tutorial formats
• Duration: Set your target video length (affects scene count)
• Platform: Optimize for Instagram Reels, TikTok, YouTube, etc.

The AI will generate a complete visual storyboard with scene descriptions, camera angles, and timing suggestions.`,
          tips: ["Be specific in your description for better results", "Mention any brand guidelines or must-include elements upfront"]
        },
        {
          title: "Understanding Your Storyboard",
          content: `Each generated storyboard includes:

• Scene Cards: Visual representations of each shot with AI-generated imagery
• Shot Details: Camera angle, movement, and framing notes
• Script Suggestions: Dialogue or voiceover text for each scene
• Timing: Recommended duration per scene
• Equipment: Suggested gear for each shot

You can drag and drop scenes to reorder them, edit descriptions, or regenerate individual scenes if needed.`,
          tips: ["Export your storyboard as PDF to share with clients or collaborators", "Use the 'Variations' button to see alternative takes on the same scene"]
        },
        {
          title: "Advanced Features",
          content: `Take your storyboards further:

• Reference Upload: Add reference images or brand assets to guide the AI
• Mood Board: Attach color palettes or style references
• Voiceover Integration: Sync with Caption AI for complete scripts
• Shot List Export: Generate equipment checklists and shooting schedules
• Collaboration: Share storyboards with team members for feedback

Pro users can generate up to 10 scene variations per project and access premium visual styles.`,
          warnings: ["AI-generated storyboards are guides, not strict requirements - feel free to improvise on set", "Complex scenes may need manual refinement for professional productions"]
        }
      ],
      relatedArticles: [
        { title: "Writing captions with AI", link: "/help/article/ai-tools/caption-guide" },
        { title: "Market Advisor guide", link: "/help/article/ai-tools/market-advisor" }
      ]
    },
    "caption-guide": {
      title: "Writing Captions with AI",
      readTime: "4 min",
      lastUpdated: "March 2026",
      introduction: "Caption AI crafts engaging, platform-optimized captions that match your voice and drive engagement. Whether you need something witty, professional, or promotional, our AI has you covered.",
      sections: [
        {
          title: "How Caption AI Works",
          content: `Access Caption AI from the AI Hub or /ai-hub/caption. The tool analyzes:

• Your content: Upload an image/video or describe what you're posting
• Your brand voice: Casual, professional, funny, inspirational, etc.
• Platform: Instagram, TikTok, LinkedIn, Twitter (each has different best practices)
• Goal: Engagement, sales, awareness, or education
• Hashtag preferences: Trending, niche-specific, or branded hashtags

The AI generates 3-5 caption variations for you to choose from or edit.`,
          tips: ["Include your key message or CTA in the content description", "Try different voice settings to see what resonates with your audience"]
        },
        {
          title: "Voice & Tone Settings",
          content: `Match captions to your brand personality:

• Casual: "Just dropped this look and I'm obsessed ✨"
• Professional: "Introducing our latest collection, designed for modern professionals."
• Humorous: "When you try to take a serious photo but your cat has other plans 😹"
• Inspirational: "Your journey is unique. Embrace every step."
• Sales-focused: "Limited time offer - 24 hours only!"

You can save custom voice profiles for consistent branding across posts.`,
          warnings: ["Always review AI-generated captions before posting", "Some humorous captions may not translate well across all cultures - know your audience"]
        },
        {
          title: "Hashtags & Optimization",
          content: `Maximize reach with smart hashtags:

• Auto-Hashtags: AI suggests relevant tags based on your content
• Trending: Incorporates currently popular hashtags (when relevant)
• Niche: Includes specialized tags for your specific community
• Branded: Your custom branded hashtags
• Quantity: Optimized count per platform (Instagram: 3-5, LinkedIn: 2-3, etc.)

The AI avoids banned or spam-associated hashtags and focuses on those most likely to increase your content's discoverability.`,
          tips: ["Create a saved hashtag set for common post types", "Rotate hashtags rather than using the exact same set every time"]
        }
      ],
      relatedArticles: [
        { title: "Using Storyboard AI", link: "/help/article/ai-tools/storyboard-guide" },
        { title: "Market Advisor guide", link: "/help/article/ai-tools/market-advisor" }
      ]
    },
    "market-advisor": {
      title: "Market Advisor Guide",
      readTime: "6 min",
      lastUpdated: "March 2026",
      introduction: "Market Advisor is your personal AI consultant for influencer marketing. Get rate recommendations, contract analysis, message templates, project planning, and market insights - all tailored to your specific situation.",
      sections: [
        {
          title: "Rate Calculator",
          content: `Know your worth with data-driven rate recommendations:

• Input your metrics: Follower count, engagement rate, niche
• Select deliverables: Posts, stories, reels, long-form videos
• Get rate ranges: Minimum, recommended, and premium rates
• Compare benchmarks: See how your rates compare to similar creators
• Platform-specific: Different rates for Instagram vs TikTok vs YouTube

The calculator considers your experience, content quality, and current market trends.`,
          tips: ["Update your metrics monthly for accurate rate suggestions", "Use the premium rate for rush jobs or exclusive partnerships"]
        },
        {
          title: "Job Quote Assistant",
          content: `Generate professional quotes for brand inquiries:

• Project scope: Define deliverables, timeline, and revisions
• Rate calculation: Automatically applies your rates to the project
• Quote preview: See your quote before sending
• Export options: PDF, email template, or direct copy
• Follow-up reminders: Track sent quotes and get reminded to follow up

The assistant also suggests when to offer package discounts or add premium services.`,
          tips: ["Always customize the AI-generated quote with project-specific details", "Save successful quote templates for similar future projects"]
        },
        {
          title: "Message Assistant",
          content: `Craft professional brand communications:

• Response templates: Reply to brand inquiries professionally
• Follow-up sequences: Nurture leads without being pushy
• Negotiation scripts: Handle rate discussions confidently
• Rejection messages: Decline opportunities gracefully
• Introduction messages: Reach out to brands you want to work with

Choose your tone: friendly, formal, or assertive depending on the situation.`,
          warnings: ["Personalize AI-generated messages before sending - brands can tell", "Always double-check names and specific details before hitting send"]
        },
        {
          title: "Contract Scanner",
          content: `Analyze partnership agreements before signing:

• Upload contracts: PDF or image formats accepted
• AI analysis: Identifies key terms, red flags, and missing clauses
• Risk assessment: Highlights potentially problematic sections
• Comparison: See how terms compare to industry standards
• Questions to ask: Suggested clarifications before signing

The scanner checks for exclusivity clauses, payment terms, usage rights, and cancellation policies.`,
          warnings: ["This is not legal advice - consult a lawyer for complex contracts", "Always read the full contract yourself, even after AI analysis"]
        }
      ],
      relatedArticles: [
        { title: "Negotiating deals", link: "/help/article/marketplace/negotiating-deals" },
        { title: "Contract scanner explained", link: "/help/article/ai-tools/contract-scanner" }
      ]
    },
    "contract-scanner": {
      title: "Contract Scanner Explained",
      readTime: "7 min",
      lastUpdated: "March 2026",
      introduction: "The Contract Scanner uses AI to analyze your brand partnership agreements, highlighting key terms, potential risks, and areas that may need negotiation. Think of it as a first line of defense before involving legal counsel.",
      sections: [
        {
          title: "How It Works",
          content: `Using the Contract Scanner:

1. Upload your contract (PDF, JPG, or PNG)
2. The AI extracts and analyzes all text
3. Review the color-coded analysis:
   • Green: Standard, favorable terms
   • Yellow: Unusual or negotiable terms
   • Red: Potential red flags requiring attention
4. Read the summary report with explanations
5. Download or share the analysis

Processing typically takes 30-60 seconds depending on contract length.`,
          tips: ["Ensure the uploaded document is clear and readable for best results", "You can scan contracts at any stage - draft, initial offer, or final version"]
        },
        {
          title: "What It Analyzes",
          content: `The scanner reviews these key areas:

• Compensation: Payment amount, schedule, and method
• Deliverables: Specific content requirements and deadlines
• Usage Rights: How long and where brand can use your content
• Exclusivity: Restrictions on working with competitors
• Cancellation: Termination clauses and penalties
• Revisions: How many rounds of edits are included
• Content Approval: Who has final say on published content
• Morality Clauses: Behavior restrictions during partnership
• Payment Protection: Late payment terms and remedies`,
          tips: ["Pay special attention to yellow highlights - these are negotiable points", "Red flags don't always mean reject the contract - they're discussion points"]
        },
        {
          title: "Understanding the Report",
          content: `Your analysis report includes:

• Executive Summary: Overall contract assessment
• Key Terms: Important dates, numbers, and obligations
• Risk Analysis: Potential issues explained in plain English
• Comparison: How terms compare to industry standards
• Questions to Ask: Suggested clarifications for the brand
• Missing Clauses: Important protections not present

Each section includes actionable advice you can use in negotiations.`,
          warnings: ["The AI may miss nuances that a human lawyer would catch", "Contracts vary by jurisdiction - local laws may affect interpretation"]
        },
        {
          title: "Privacy & Security",
          content: `Your contract data is protected:

• Encryption: All uploads use bank-level encryption
• No Storage: Contracts are processed and immediately deleted
• No Training: Your contracts are never used to train our AI
• Confidential: Even our staff cannot access your uploaded documents

For extra security, you can redact sensitive information (like specific dollar amounts) before uploading - the AI can still analyze the contract structure.`,
          tips: ["Use the redaction feature for highly sensitive deals", "Save your analysis report securely - we don't store it either"]
        }
      ],
      relatedArticles: [
        { title: "Market Advisor guide", link: "/help/article/ai-tools/market-advisor" },
        { title: "Negotiating deals", link: "/help/article/marketplace/negotiating-deals" }
      ]
    }
  },

  // ==================== MARKETPLACE ====================
  "marketplace": {
    "applying-campaigns": {
      title: "Applying to Campaigns",
      readTime: "4 min",
      lastUpdated: "March 2026",
      introduction: "The Brand Marketplace connects creators with exciting partnership opportunities. Learn how to find campaigns that match your niche, submit winning applications, and increase your chances of getting selected by brands.",
      sections: [
        {
          title: "Finding the Right Campaigns",
          content: `Browse campaigns that fit you:

• Filters: Narrow by category, budget, platform, or location
• Match Score: See how well you fit based on your profile
• Saved Searches: Get notified when new campaigns match your criteria
• Trending: See popular opportunities other creators are applying to
• Direct Invites: Check for brands who've specifically invited you

Focus on campaigns that align with your content style and audience interests for the best results.`,
          tips: ["Set up keyword alerts for your niche (e.g., 'beauty', 'fitness', 'tech')", "Don't ignore small brands - they often offer better long-term partnerships"]
        },
        {
          title: "Crafting Your Application",
          content: `Stand out with a great pitch:

• Personalize: Reference specific details from the campaign brief
• Show relevance: Explain why your audience is perfect for this brand
• Provide examples: Link to similar content you've created
• Be specific: Detail exactly what you'll deliver
• Include metrics: Share relevant engagement data
• Ask questions: Show genuine interest in the partnership

Keep your application concise but compelling - brand managers review many applications.`,
          tips: ["Use the AI Message Assistant to polish your application text", "Follow the brand's application instructions exactly as specified"]
        },
        {
          title: "After You Apply",
          content: `What happens next:

• Confirmation: You'll receive an email confirming your application
• Timeline: Most brands respond within 5-10 business days
• Status Tracking: Check your application status in "My Applications"
• Follow-up: You can send one polite follow-up if you haven't heard back
• Feedback: Some brands provide feedback on declined applications

If selected, you'll receive a detailed brief and contract to review before starting.`,
          warnings: ["Never start creating content until the contract is signed", "Avoid applying to competing campaigns simultaneously - brands may notice"]
        }
      ],
      relatedArticles: [
        { title: "Negotiating deals", link: "/help/article/marketplace/negotiating-deals" },
        { title: "Creating your media kit", link: "/help/article/marketplace/media-kit" }
      ]
    },
    "media-kit": {
      title: "Creating Your Media Kit",
      readTime: "6 min",
      lastUpdated: "March 2026",
      introduction: "Your media kit is your professional resume for brand partnerships. A well-crafted media kit showcases your value, audience demographics, and past successes - making it easy for brands to say yes to working with you.",
      sections: [
        {
          title: "Essential Media Kit Components",
          content: `Every media kit should include:

• About You: Brief bio highlighting your niche and unique value
• Audience Demographics: Age, gender, location, interests of your followers
• Social Media Stats: Follower counts, engagement rates, growth trends
• Content Examples: Best-performing posts showcasing your style
• Past Collaborations: Logos of brands you've worked with
• Services & Rates: What you offer and your pricing structure
• Contact Information: How brands can reach you

LumiAI auto-generates a media kit from your connected accounts - start there and customize.`,
          tips: ["Update your media kit monthly with fresh stats and recent work", "Include both high-level metrics and specific post performance examples"]
        },
        {
          title: "Design & Presentation",
          content: `Make it visually appealing:

• Brand Colors: Use colors consistent with your social presence
• High-Quality Images: Include professional photos of yourself
• Clean Layout: Use whitespace - don't overcrowd
• PDF Format: Easy to download and share
• One-Page Summary: Busy brand managers appreciate conciseness
• Full Version: Have a detailed version available on request

Your media kit should reflect the quality of content you'll deliver to brands.`,
          tips: ["Use Canva or similar tools if you don't have design software", "Include a QR code linking to your LumiAI profile"]
        },
        {
          title: "Highlighting Your Value",
          content: `Show brands why they need you:

• Unique Selling Points: What makes you different from similar creators
• Audience Quality: Engagement > follower count - emphasize real connections
• Content Quality: Showcase your best, most professional work
• Results: Share metrics from past campaigns (with permission)
• Versatility: Show range across different content types
• Professionalism: Highlight reliability and communication skills

Remember: Brands invest in creators who can deliver real business results.`,
          warnings: ["Never falsify metrics - brands can verify and it destroys trust", "Don't include content you don't own or have rights to showcase"]
        }
      ],
      relatedArticles: [
        { title: "Applying to campaigns", link: "/help/article/marketplace/applying-campaigns" },
        { title: "Setting up your profile", link: "/help/article/getting-started/setting-up-profile" }
      ]
    },
    "negotiating-deals": {
      title: "Negotiating Deals",
      readTime: "5 min",
      lastUpdated: "March 2026",
      introduction: "Negotiation is a crucial skill for maximizing your earnings and protecting your interests. Learn how to confidently discuss rates, deliverables, and terms to create win-win partnerships with brands.",
      sections: [
        {
          title: "Preparation Before Negotiating",
          content: `Set yourself up for success:

• Know Your Worth: Use the Rate Calculator to establish baseline rates
• Research the Brand: Understand their budget range and past partnerships
• Define Your Limits: Know your minimum acceptable rate and walk-away point
• Prepare Justification: Have data ready to support your rate requests
• Identify Flexibility: Know which terms you're willing to adjust
• Timeline Considerations: Rush jobs command premium rates

The more prepared you are, the more confident you'll be in negotiations.`,
          tips: ["Create a rate sheet for different types of deliverables", "Track your time on projects to ensure your rates are profitable"]
        },
        {
          title: "The Negotiation Process",
          content: `Navigate the conversation:

• Start High: Begin with your premium rate - you can always come down
• Anchor Value: Reference your metrics and past successful campaigns
• Ask Questions: Understand the brand's goals and constraints
• Offer Packages: Bundle services for better value perception
• Be Professional: Maintain a collaborative, not adversarial, tone
• Get It In Writing: Confirm all agreed terms before proceeding

Remember: Negotiation is about finding mutual benefit, not winning at the other's expense.`,
          tips: ["Use the Message Assistant to draft professional negotiation responses", "Silence is powerful - don't rush to fill pauses in conversation"]
        },
        {
          title: "Common Negotiation Points",
          content: `What you can negotiate beyond rates:

• Usage Rights: Limit how long/widely brand can use your content
• Exclusivity: Reduce restrictions on competitor partnerships
• Payment Terms: Request partial upfront payment for large projects
• Revision Rounds: Limit free revisions to protect your time
• Timeline: Extend deadlines if needed for quality work
• Deliverables: Adjust scope to fit the budget
• Performance Bonuses: Add incentives for exceeding targets

Know which points matter most to you and prioritize accordingly.`,
          warnings: ["Don't negotiate just to negotiate - know your goals", "Be wary of 'exposure' offers - real partnerships involve real payment"]
        }
      ],
      relatedArticles: [
        { title: "Contract scanner explained", link: "/help/article/ai-tools/contract-scanner" },
        { title: "Market Advisor guide", link: "/help/article/ai-tools/market-advisor" }
      ]
    },
    "posting-campaigns": {
      title: "For Brands: Posting Campaigns",
      readTime: "5 min",
      lastUpdated: "March 2026",
      introduction: "Creating an effective campaign posting attracts quality creator applications and sets the foundation for successful partnerships. Here's how to craft compelling campaign briefs that get results.",
      sections: [
        {
          title: "Campaign Basics",
          content: `Essential information to include:

• Campaign Name: Clear, descriptive title
• Brand Overview: Who you are and what you do
• Campaign Goals: Awareness, sales, app installs, etc.
• Target Audience: Who you want to reach
• Platforms: Where content should be posted
• Timeline: Application deadline, content due date, posting window
• Budget Range: Be transparent about available compensation
• Deliverables: Exactly what you expect creators to produce

The more detail you provide, the better matched your applications will be.`,
          tips: ["Include your brand guidelines as an attachment", "Mention if you're open to creative input from creators"]
        },
        {
          title: "Writing the Brief",
          content: `Create a compelling campaign description:

• Hook: Start with what makes this campaign exciting
• Requirements: Be clear about must-haves vs. nice-to-haves
• Inspiration: Share examples of content you love
• Messaging: Key talking points (without being too prescriptive)
• Creative Freedom: Indicate where creators can improvise
• Success Metrics: How you'll measure campaign performance
• Long-term Potential: Mention if this could lead to ongoing partnerships

Your brief should attract creators who genuinely fit your brand, not just anyone who applies.`,
          tips: ["Use bullet points for easy scanning", "Include a FAQ section for common questions"]
        },
        {
          title: "Selecting Creators",
          content: `Review and choose the right partners:

• Profile Review: Check their content quality and brand alignment
• Audience Analysis: Verify their followers match your target
• Engagement Check: Look beyond follower count to real engagement
• Past Work: Review previous brand partnerships
• Professionalism: Assess communication in their application
• Rate Evaluation: Consider value, not just cost

Take your time - the right creator partnerships significantly impact campaign success.`,
          warnings: ["Don't select solely based on follower count", "Check that creators' values align with your brand values"]
        }
      ],
      relatedArticles: [
        { title: "Company analytics guide", link: "/help/article/analytics/company-analytics" },
        { title: "Negotiating deals", link: "/help/article/marketplace/negotiating-deals" }
      ]
    }
  },

  // ==================== EQUIPMENT ====================
  "equipment": {
    "booking-equipment": {
      title: "How to Book Equipment",
      readTime: "4 min",
      lastUpdated: "March 2026",
      introduction: "LumiAI's Equipment Rental marketplace connects creators with quality gear at affordable prices. Whether you need a camera for a shoot or lighting for your studio, here's how to book equipment safely and easily.",
      sections: [
        {
          title: "Finding Equipment",
          content: `Search and discover gear:

• Search: Enter equipment name, brand, or type
• Filters: Narrow by location, price range, availability dates
• Categories: Browse cameras, lenses, lighting, audio, drones, etc.
• Verified Owners: Look for badges indicating trusted renters
• Reviews: Check ratings from previous renters
• Nearby: Find equipment available in your area for pickup

Save searches to get notified when equipment you need becomes available.`,
          tips: ["Book well in advance for popular items", "Consider bundling multiple items from the same owner for discounts"]
        },
        {
          title: "The Booking Process",
          content: `Reserve your gear:

1. Select dates: Choose your rental period
2. Review pricing: See daily/weekly rates and total cost
3. Check availability: Ensure gear is free for your dates
4. Message owner: Introduce yourself and confirm details
5. Submit request: Send booking request to owner
6. Wait for approval: Owner has 24 hours to respond
7. Payment: Pay once approved (held until pickup)
8. Arrange pickup: Coordinate time and location

Most bookings are confirmed within a few hours.`,
          warnings: ["Never pay outside the LumiAI platform - you lose protection", "Confirm pickup details in writing before meeting"]
        },
        {
          title: "During Your Rental",
          content: `Take care of the equipment:

• Inspection: Document condition with photos at pickup
• Care: Treat the gear as if it were your own
• Communication: Keep owner updated on any issues
• Return On Time: Late returns incur additional fees
• Condition: Return in the same condition as received
• Review: Leave honest feedback about your experience

Most owners are fellow creators who understand the importance of reliable gear.`,
          tips: ["Take photos/video of equipment condition at pickup and return", "Ask the owner for a quick tutorial if you're unfamiliar with the gear"]
        }
      ],
      relatedArticles: [
        { title: "Rental insurance explained", link: "/help/article/equipment/rental-insurance" },
        { title: "Messaging owners", link: "/help/article/equipment/messaging-owners" }
      ]
    },
    "messaging-owners": {
      title: "Messaging Owners",
      readTime: "3 min",
      lastUpdated: "March 2026",
      introduction: "Clear communication with equipment owners ensures smooth rentals and helps build trust in the community. Learn the best practices for messaging before, during, and after your rental.",
      sections: [
        {
          title: "Initial Contact",
          content: `Make a good first impression:

• Introduce yourself: Brief background and what you're shooting
• Confirm availability: Verify the dates work before booking
• Ask questions: About condition, accessories, compatibility
• Share details: Your experience level with similar equipment
• Be specific: Exact pickup/return times that work for you
• Professional tone: Remember this is a business transaction

A well-crafted initial message increases your chances of booking approval.`,
          tips: ["Reference specific equipment features you're excited about", "Mention if you've rented similar gear before"]
        },
        {
          title: "During the Rental",
          content: `Keep communication open:

• Confirm pickup: Message when you're on the way
• Report issues: Immediately if something isn't working
• Ask for help: Owners often know their gear best
• Provide updates: If your shoot runs long or plans change
• Share results: Owners love seeing what you create with their gear

Quick, clear communication prevents misunderstandings and builds relationships.`,
          warnings: ["Don't wait until the last minute to report problems", "Keep all communication on-platform for your protection"]
        },
        {
          title: "After the Rental",
          content: `Close the loop professionally:

• Confirm return: Message when you've dropped off the gear
• Express thanks: A quick thank you goes a long way
• Share your work: Send links to content you created
• Leave a review: Honest feedback helps future renters
• Stay connected: Follow owners for future rental opportunities

Positive experiences often lead to repeat rentals and referrals.`,
          tips: ["Tag owners in your posts if you share gear-related content", "Build a list of favorite owners for quick future bookings"]
        }
      ],
      relatedArticles: [
        { title: "How to book equipment", link: "/help/article/equipment/booking-equipment" },
        { title: "Listing your gear", link: "/help/article/equipment/listing-gear" }
      ]
    },
    "rental-insurance": {
      title: "Rental Insurance Explained",
      readTime: "5 min",
      lastUpdated: "March 2026",
      introduction: "Understanding rental insurance protects you from unexpected costs and gives you peace of mind when using expensive equipment. Here's everything you need to know about coverage options on LumiAI.",
      sections: [
        {
          title: "Basic Coverage (Included)",
          content: `Every rental includes basic protection:

• Normal Wear: Minor scratches, dust, expected usage marks
• Manufacturing Defects: Issues not caused by user error
• Transit Damage: Damage occurring during shipping
• Theft Protection: Coverage if gear is stolen (police report required)
• Deductible: $100-500 depending on equipment value

This coverage is automatic - no additional purchase required.`,
          tips: ["Document equipment condition thoroughly at pickup", "Report any damage immediately, even if covered"]
        },
        {
          title: "Full Coverage (Optional Add-on)",
          content: `Enhanced protection for expensive gear:

• Accidental Damage: Drops, spills, user error
• Water Damage: Protection against liquid exposure
• Sand/Dust: Coverage for environmental damage
• Loss: Equipment that goes missing (not stolen)
• Lower Deductible: $50-250 depending on value
• Priority Support: Faster claims processing

Cost is typically 10-15% of rental fee - worth it for peace of mind with expensive gear.`,
          warnings: ["Full coverage must be purchased before pickup", "Some intentional damage is still not covered"]
        },
        {
          title: "What's Not Covered",
          content: `Exclusions to be aware of:

• Intentional Damage: Deliberate misuse or destruction
• Unauthorized Users: Damage caused by someone other than renter
• Unreported Incidents: Damage not reported within 24 hours
• Normal Consumables: Batteries, bulbs, filters that deplete with use
• Modifications: Damage from unauthorized alterations
• Negligence: Leaving equipment in unsafe conditions

Understanding exclusions helps you avoid surprise charges.`,
          tips: ["Read the full policy before renting high-value items", "When in doubt, choose full coverage for expensive equipment"]
        }
      ],
      relatedArticles: [
        { title: "How to book equipment", link: "/help/article/equipment/booking-equipment" },
        { title: "Listing your gear", link: "/help/article/equipment/listing-gear" }
      ]
    },
    "listing-gear": {
      title: "Listing Your Gear",
      readTime: "6 min",
      lastUpdated: "March 2026",
      introduction: "Turn your unused equipment into income by listing it on LumiAI. Whether you have a professional camera sitting idle or extra lighting gear, here's how to create listings that attract renters and generate revenue.",
      sections: [
        {
          title: "Creating Your Listing",
          content: `Set up an attractive listing:

• Title: Be specific - "Sony A7IV with 24-70mm f/2.8 GM" not "Camera"
• Photos: High-quality images showing all angles and condition
• Description: Detailed specs, condition, what's included
• Pricing: Competitive daily/weekly rates (check similar listings)
• Availability: Set your calendar to avoid conflicts
• Location: Pickup address or delivery options
• Requirements: Minimum renter age, experience level, etc.

The more detail you provide, the fewer questions you'll need to answer.`,
          tips: ["Include photos of the actual item, not stock photos", "List all accessories included - batteries, chargers, cases, etc."]
        },
        {
          title: "Setting Prices",
          content: `Price competitively for your market:

• Research: Check what similar gear rents for in your area
• Value: Price at 2-5% of retail value per day for most gear
• Discounts: Offer weekly (20% off) and monthly (40% off) rates
• Seasonality: Adjust prices for high-demand periods
• Bundles: Offer package deals for multiple items
• Security Deposit: Set appropriate amount based on item value

Your gear will rent more often at fair prices than sitting empty at premium rates.`,
          tips: ["Start slightly lower to build reviews, then increase", "Consider offering pickup/delivery as a paid add-on"]
        },
        {
          title: "Managing Rentals",
          content: "Be a great owner:",
          tips: ["Respond to inquiries quickly - within an hour if possible", "Keep your gear clean and ready between rentals"]
        },
        {
          title: "Managing Rentals",
          content: `Be a great owner:

• Quick Response: Answer inquiries within a few hours
• Clear Communication: Confirm all details before pickup
• Clean Gear: Present equipment in excellent condition
• Tutorials: Offer brief instructions for complex equipment
• Flexibility: Accommodate reasonable schedule requests
• Follow-up: Check in during longer rentals

Great owners get repeat customers and glowing reviews.`,
          warnings: ["Verify renter identity at pickup - check ID matches booking", "Document condition with photos before every handoff"]
        }
      ],
      relatedArticles: [
        { title: "Rental insurance explained", link: "/help/article/equipment/rental-insurance" },
        { title: "Messaging owners", link: "/help/article/equipment/messaging-owners" }
      ]
    }
  },

  // ==================== ANALYTICS ====================
  "analytics": {
    "reading-analytics": {
      title: "Reading Your Analytics",
      readTime: "4 min",
      lastUpdated: "March 2026",
      introduction: "LumiAI's analytics dashboard consolidates data from all your connected platforms, giving you a comprehensive view of your growth, engagement, and earning potential. Learn how to read and act on these insights.",
      sections: [
        {
          title: "Dashboard Overview",
          content: `Your main analytics page shows:

• Growth Metrics: Follower growth across platforms over time
• Engagement Rate: Likes, comments, shares relative to follower count
• Content Performance: Best and worst performing posts
• Audience Insights: Demographics, active times, interests
• Earnings Tracking: Partnership income and rate trends
• Benchmarking: How you compare to similar creators

Toggle between daily, weekly, and monthly views for different perspectives.`,
          tips: ["Set date ranges to analyze specific campaign periods", "Export reports to share with brands or your team"]
        },
        {
          title: "Key Metrics Explained",
          content: `Understand what matters:

• Engagement Rate: (Likes + Comments + Shares) / Followers. 3-6% is good, 6%+ is excellent.
• Reach: Unique accounts who saw your content
• Impressions: Total times your content was viewed (can exceed reach)
• Saves: Content saved for later - indicates high value
• Shares: Content shared to others - indicates viral potential
• Profile Visits: People checking out your full profile
• Click-through Rate: Link clicks relative to impressions

Focus on engagement rate over raw follower numbers for measuring true influence.`,
          tips: ["Track month-over-month trends rather than daily fluctuations", "Compare your metrics against industry benchmarks in your niche"]
        },
        {
          title: "Using Insights to Improve",
          content: `Turn data into action:

• Content Type: Double down on what gets the best engagement
• Posting Times: Share when your audience is most active
• Hashtag Performance: See which tags drive discovery
• Audience Growth: Understand what drives new followers
• Partnership ROI: Track which collaborations perform best

Analytics help you work smarter, not just harder.`,
          warnings: ["Don't obsess over daily numbers - focus on long-term trends", "Avoid changing your content strategy based on single post performance"]
        }
      ],
      relatedArticles: [
        { title: "Understanding audience insights", link: "/help/article/analytics/audience-insights" },
        { title: "Company analytics guide", link: "/help/article/analytics/company-analytics" }
      ]
    },
    "audience-insights": {
      title: "Understanding Audience Insights",
      readTime: "5 min",
      lastUpdated: "March 2026",
      introduction: "Knowing your audience is key to creating content that resonates and attracts the right brand partnerships. LumiAI aggregates demographic and behavioral data to help you understand who's actually watching.",
      sections: [
        {
          title: "Demographics",
          content: `Who follows you:

• Age Range: Breakdown by age groups (13-17, 18-24, 25-34, etc.)
• Gender: Male/female/non-binary distribution
• Location: Countries, cities, time zones
• Languages: Primary languages spoken by your audience

This data helps you create content appropriate for your audience and shows brands who they'll reach through you.`,
          tips: ["If your audience differs from what brands expect, address this proactively", "Consider creating content that appeals to your largest demographic segments"]
        },
        {
          title: "Behavior & Interests",
          content: `What your audience cares about:

• Top Interests: Categories your followers engage with most
• Active Times: When they're online and engaging
• Content Preferences: Video vs. photo, long vs. short form
• Follow Patterns: Other accounts they commonly follow
• Shopping Behavior: Interest in products and services

Use this to align your content with audience interests and timing.`,
          tips: ["Post during your audience's peak active hours", "Reference popular interests in your content for better engagement"]
        },
        {
          title: "Audience Quality",
          content: `Assess follower authenticity:

• Growth Patterns: Steady growth is healthier than sudden spikes
• Engagement Ratios: Authentic accounts have consistent engagement
• Comment Quality: Real conversations vs. generic emojis
• Save & Share Rates: Indicates genuine interest in content
• Follower Overlap: Percentage of followers across your platforms

High-quality audiences are more valuable to brands than large but disengaged followings.`,
          warnings: ["Sudden drops in engagement may indicate algorithm changes or content issues", "Don't buy followers - it destroys your authentic metrics"]
        }
      ],
      relatedArticles: [
        { title: "Reading your analytics", link: "/help/article/analytics/reading-analytics" },
        { title: "Applying to campaigns", link: "/help/article/marketplace/applying-campaigns" }
      ]
    },
    "company-analytics": {
      title: "Company Analytics Guide",
      readTime: "5 min",
      lastUpdated: "March 2026",
      introduction: "For brands using LumiAI, our analytics provide deep insights into campaign performance, creator ROI, and audience engagement. Make data-driven decisions to optimize your influencer marketing strategy.",
      sections: [
        {
          title: "Campaign Performance",
          content: `Track your marketing efforts:

• Reach & Impressions: How many people saw your campaign
• Engagement: Total likes, comments, shares across all creators
• Click-through Rate: Traffic driven to your website/store
• Conversions: Sales or sign-ups attributed to campaigns
• Cost per Result: Efficiency metrics for budget optimization
• Sentiment Analysis: Positive/negative reactions to content

Compare performance across different campaigns and creator tiers.`,
          tips: ["Set up proper UTM tracking for accurate attribution", "Compare performance against previous campaigns and industry benchmarks"]
        },
        {
          title: "Creator Performance",
          content: `Evaluate individual partnerships:

• Content Quality: Assess delivered posts against briefs
• Engagement Rate: How well their audience responded
• Audience Alignment: Demographic match with your target
• ROI per Creator: Revenue generated vs. cost
• Professionalism: On-time delivery, communication quality
• Partnership Potential: Fit for long-term collaboration

Identify your top-performing creators for future campaigns.`,
          tips: ["Consider engagement quality, not just quantity", "Track performance across multiple campaigns for trend analysis"]
        },
        {
          title: "Strategic Insights",
          content: `Optimize your strategy:

• Platform Mix: Which social platforms deliver best results
• Content Types: What formats perform best for your brand
• Timing: Optimal campaign launch and duration
• Budget Allocation: How to distribute spend across creators
• Long-term Value: Customer lifetime value from influencer referrals

Use these insights to refine your influencer marketing playbook.`,
          warnings: ["Don't judge campaigns solely on immediate sales - brand awareness has long-term value", "Allow sufficient time for accurate attribution tracking"]
        }
      ],
      relatedArticles: [
        { title: "Reading your analytics", link: "/help/article/analytics/reading-analytics" },
        { title: "For brands: Posting campaigns", link: "/help/article/marketplace/posting-campaigns" }
      ]
    }
  }
};
