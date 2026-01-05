export interface BrandColor {
  name: string;
  hex: string;
  description?: string;
}

export interface BrandColorCategory {
  name: string;
  colors: BrandColor[];
}

export interface BrandPalette {
  id: string;
  name: string;
  company: string;
  logo?: string;
  description: string;
  website: string;
  categories: BrandColorCategory[];
  tags: string[];
}

// Google Material Design 3 Colors
const GOOGLE_MATERIAL: BrandPalette = {
  id: 'google-material',
  name: 'Material Design',
  company: 'Google',
  description: 'Material Design is a design language developed by Google, featuring bold, graphic, and intentional design with motion providing meaning.',
  website: 'https://m3.material.io',
  tags: ['Modern', 'Versatile', 'Accessible'],
  categories: [
    {
      name: 'Primary',
      colors: [
        { name: 'Red', hex: '#F44336', description: 'Material Red 500' },
        { name: 'Pink', hex: '#E91E63', description: 'Material Pink 500' },
        { name: 'Purple', hex: '#9C27B0', description: 'Material Purple 500' },
        { name: 'Deep Purple', hex: '#673AB7', description: 'Material Deep Purple 500' },
        { name: 'Indigo', hex: '#3F51B5', description: 'Material Indigo 500' },
        { name: 'Blue', hex: '#2196F3', description: 'Material Blue 500' },
        { name: 'Light Blue', hex: '#03A9F4', description: 'Material Light Blue 500' },
        { name: 'Cyan', hex: '#00BCD4', description: 'Material Cyan 500' },
        { name: 'Teal', hex: '#009688', description: 'Material Teal 500' },
        { name: 'Green', hex: '#4CAF50', description: 'Material Green 500' },
        { name: 'Light Green', hex: '#8BC34A', description: 'Material Light Green 500' },
        { name: 'Lime', hex: '#CDDC39', description: 'Material Lime 500' },
        { name: 'Yellow', hex: '#FFEB3B', description: 'Material Yellow 500' },
        { name: 'Amber', hex: '#FFC107', description: 'Material Amber 500' },
        { name: 'Orange', hex: '#FF9800', description: 'Material Orange 500' },
        { name: 'Deep Orange', hex: '#FF5722', description: 'Material Deep Orange 500' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Brown', hex: '#795548', description: 'Material Brown 500' },
        { name: 'Grey', hex: '#9E9E9E', description: 'Material Grey 500' },
        { name: 'Blue Grey', hex: '#607D8B', description: 'Material Blue Grey 500' },
      ]
    },
    {
      name: 'System',
      colors: [
        { name: 'Black', hex: '#000000', description: 'Pure black for text' },
        { name: 'White', hex: '#FFFFFF', description: 'Pure white for backgrounds' },
      ]
    }
  ]
};

// Apple Human Interface Guidelines Colors (iOS Light Mode values from official HIG)
const APPLE_HIG: BrandPalette = {
  id: 'apple-hig',
  name: 'Human Interface Guidelines',
  company: 'Apple',
  description: 'Apple\'s design system featuring vibrant, accessible system colors that adapt to light and dark modes across all Apple platforms.',
  website: 'https://developer.apple.com/design/human-interface-guidelines',
  tags: ['Premium', 'Minimalist', 'Accessible'],
  categories: [
    {
      name: 'System Colors (Light)',
      colors: [
        { name: 'Red', hex: '#FF383C', description: 'R255 G56 B60 - Destructive actions' },
        { name: 'Orange', hex: '#FF8D28', description: 'R255 G141 B40 - Attention' },
        { name: 'Yellow', hex: '#FFCC00', description: 'R255 G204 B0 - Warnings' },
        { name: 'Green', hex: '#34C759', description: 'R52 G199 B89 - Success' },
        { name: 'Mint', hex: '#00C8B3', description: 'R0 G200 B179 - Fresh accents' },
        { name: 'Teal', hex: '#00C3D0', description: 'R0 G195 B208 - Calm actions' },
        { name: 'Cyan', hex: '#00C0E8', description: 'R0 G192 B232 - Informational' },
        { name: 'Blue', hex: '#0088FF', description: 'R0 G136 B255 - Interactive elements' },
        { name: 'Indigo', hex: '#6155F5', description: 'R97 G85 B245 - Creative contexts' },
        { name: 'Purple', hex: '#CB30E0', description: 'R203 G48 B224 - Playful elements' },
        { name: 'Pink', hex: '#FF2D55', description: 'R255 G45 B85 - Feminine appeal' },
        { name: 'Brown', hex: '#AC7F5E', description: 'R172 G127 B94 - Earthy tones' },
      ]
    },
    {
      name: 'System Gray (Light)',
      colors: [
        { name: 'Gray', hex: '#8E8E93', description: 'R142 G142 B147 - Primary gray' },
        { name: 'Gray 2', hex: '#AEAEB2', description: 'R174 G174 B178 - Secondary gray' },
        { name: 'Gray 3', hex: '#C7C7CC', description: 'R199 G199 B204 - Tertiary gray' },
        { name: 'Gray 4', hex: '#D1D1D6', description: 'R209 G209 B214 - Quaternary gray' },
        { name: 'Gray 5', hex: '#E5E5EA', description: 'R229 G229 B234 - Quinary gray' },
        { name: 'Gray 6', hex: '#F2F2F7', description: 'R242 G242 B247 - Senary gray' },
      ]
    }
  ]
};

// IBM Carbon Design System (Official values from carbondesignsystem.com)
const IBM_CARBON: BrandPalette = {
  id: 'ibm-carbon',
  name: 'Carbon Design System',
  company: 'IBM',
  description: 'IBM\'s open-source design system for products and digital experiences, built for enterprise-grade applications.',
  website: 'https://carbondesignsystem.com',
  tags: ['Enterprise', 'Accessible', 'Professional'],
  categories: [
    {
      name: 'Blue Scale',
      colors: [
        { name: 'Blue 10', hex: '#EDF5FF', description: 'Lightest blue' },
        { name: 'Blue 20', hex: '#D0E2FF', description: 'Light blue' },
        { name: 'Blue 30', hex: '#A6C8FF', description: 'Soft blue' },
        { name: 'Blue 40', hex: '#78A9FF', description: 'Medium light blue' },
        { name: 'Blue 50', hex: '#4589FF', description: 'Medium blue' },
        { name: 'Blue 60', hex: '#0F62FE', description: 'Primary brand blue' },
        { name: 'Blue 70', hex: '#0043CE', description: 'Dark blue' },
        { name: 'Blue 80', hex: '#002D9C', description: 'Darker blue' },
        { name: 'Blue 90', hex: '#001D6C', description: 'Very dark blue' },
        { name: 'Blue 100', hex: '#001141', description: 'Darkest blue' },
      ]
    },
    {
      name: 'Support Colors',
      colors: [
        { name: 'Red 60', hex: '#DA1E28', description: 'Error/Danger' },
        { name: 'Orange 40', hex: '#FF832B', description: 'Severe warning' },
        { name: 'Yellow 30', hex: '#F1C21B', description: 'Warning' },
        { name: 'Green 60', hex: '#198038', description: 'Success' },
        { name: 'Cyan 50', hex: '#1192E8', description: 'Informational' },
        { name: 'Purple 70', hex: '#6929C4', description: 'Purple accent' },
        { name: 'Magenta 50', hex: '#EE5396', description: 'Magenta accent' },
        { name: 'Teal 70', hex: '#005D5D', description: 'Teal accent' },
      ]
    },
    {
      name: 'Gray Scale',
      colors: [
        { name: 'Gray 100', hex: '#161616', description: 'Darkest gray' },
        { name: 'Gray 90', hex: '#262626', description: 'Very dark gray' },
        { name: 'Gray 80', hex: '#393939', description: 'Dark gray' },
        { name: 'Gray 70', hex: '#525252', description: 'Medium dark gray' },
        { name: 'Gray 60', hex: '#6F6F6F', description: 'Medium gray' },
        { name: 'Gray 50', hex: '#8D8D8D', description: 'Gray' },
        { name: 'Gray 40', hex: '#A8A8A8', description: 'Light gray' },
        { name: 'Gray 30', hex: '#C6C6C6', description: 'Lighter gray' },
        { name: 'Gray 20', hex: '#E0E0E0', description: 'Very light gray' },
        { name: 'Gray 10', hex: '#F4F4F4', description: 'Almost white' },
      ]
    }
  ]
};

// Microsoft Fluent Design
const MICROSOFT_FLUENT: BrandPalette = {
  id: 'microsoft-fluent',
  name: 'Fluent Design System',
  company: 'Microsoft',
  description: 'Microsoft\'s design system that creates engaging, familiar experiences across platforms with depth, motion, and material.',
  website: 'https://fluent2.microsoft.design',
  tags: ['Modern', 'Cross-platform', 'Accessible'],
  categories: [
    {
      name: 'Brand Colors',
      colors: [
        { name: 'Brand 10', hex: '#061724', description: 'Darkest brand' },
        { name: 'Brand 40', hex: '#004578', description: 'Dark brand' },
        { name: 'Brand 80', hex: '#0078D4', description: 'Primary brand blue' },
        { name: 'Brand 100', hex: '#2899F5', description: 'Light brand' },
        { name: 'Brand 140', hex: '#9CDCFE', description: 'Lightest brand' },
      ]
    },
    {
      name: 'Status Colors',
      colors: [
        { name: 'Success', hex: '#107C10', description: 'Success green' },
        { name: 'Warning', hex: '#FFB900', description: 'Warning yellow' },
        { name: 'Severe Warning', hex: '#D83B01', description: 'Severe warning orange' },
        { name: 'Error', hex: '#A80000', description: 'Error red' },
      ]
    },
    {
      name: 'Neutral Colors',
      colors: [
        { name: 'Black', hex: '#000000', description: 'Pure black' },
        { name: 'Grey 190', hex: '#201F1E', description: 'Near black' },
        { name: 'Grey 160', hex: '#323130', description: 'Dark gray' },
        { name: 'Grey 130', hex: '#605E5C', description: 'Medium gray' },
        { name: 'Grey 90', hex: '#A19F9D', description: 'Light gray' },
        { name: 'Grey 50', hex: '#D2D0CE', description: 'Lighter gray' },
        { name: 'Grey 20', hex: '#F3F2F1', description: 'Near white' },
        { name: 'White', hex: '#FFFFFF', description: 'Pure white' },
      ]
    }
  ]
};

// Atlassian Design System
const ATLASSIAN: BrandPalette = {
  id: 'atlassian',
  name: 'Atlassian Design System',
  company: 'Atlassian',
  description: 'Atlassian\'s end-to-end design language for creating simple, intuitive products that teams love.',
  website: 'https://atlassian.design',
  tags: ['Collaborative', 'Modern', 'Vibrant'],
  categories: [
    {
      name: 'Blue',
      colors: [
        { name: 'Blue 100', hex: '#E9F2FF', description: 'Lightest blue' },
        { name: 'Blue 200', hex: '#CCE0FF', description: 'Lighter blue' },
        { name: 'Blue 400', hex: '#579DFF', description: 'Light blue' },
        { name: 'Blue 500', hex: '#388BFF', description: 'Primary blue' },
        { name: 'Blue 700', hex: '#0C66E4', description: 'Dark blue' },
        { name: 'Blue 900', hex: '#09326C', description: 'Darkest blue' },
      ]
    },
    {
      name: 'Status Colors',
      colors: [
        { name: 'Green 500', hex: '#22A06B', description: 'Success' },
        { name: 'Yellow 500', hex: '#CF9F02', description: 'Warning' },
        { name: 'Red 500', hex: '#E34935', description: 'Error' },
        { name: 'Purple 500', hex: '#8270DB', description: 'Discovery' },
        { name: 'Teal 500', hex: '#1D9AAA', description: 'Information' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Dark 100', hex: '#091E42', description: 'Near black' },
        { name: 'Dark 200', hex: '#172B4D', description: 'Dark' },
        { name: 'Gray 500', hex: '#626F86', description: 'Medium gray' },
        { name: 'Gray 200', hex: '#B3B9C4', description: 'Light gray' },
        { name: 'Light 100', hex: '#F7F8F9', description: 'Near white' },
      ]
    }
  ]
};

// Spotify Design
const SPOTIFY: BrandPalette = {
  id: 'spotify',
  name: 'Spotify Design',
  company: 'Spotify',
  description: 'Spotify\'s bold and expressive design system built for music discovery and audio experiences.',
  website: 'https://spotify.design',
  tags: ['Bold', 'Expressive', 'Dark Mode'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Spotify Green', hex: '#1DB954', description: 'Primary brand color' },
        { name: 'Green Light', hex: '#1ED760', description: 'Lighter green variant' },
        { name: 'Green Dark', hex: '#158E3E', description: 'Darker green variant' },
      ]
    },
    {
      name: 'Accent',
      colors: [
        { name: 'Orange', hex: '#FF6437', description: 'Podcasts accent' },
        { name: 'Pink', hex: '#FF4FC3', description: 'Pink accent' },
        { name: 'Blue', hex: '#509BF5', description: 'Blue accent' },
        { name: 'Purple', hex: '#AF2896', description: 'Purple accent' },
      ]
    },
    {
      name: 'Base',
      colors: [
        { name: 'Black', hex: '#121212', description: 'App background' },
        { name: 'Near Black', hex: '#181818', description: 'Card background' },
        { name: 'Dark Gray', hex: '#282828', description: 'Elevated surface' },
        { name: 'Gray', hex: '#535353', description: 'Subtle elements' },
        { name: 'Light Gray', hex: '#B3B3B3', description: 'Secondary text' },
        { name: 'White', hex: '#FFFFFF', description: 'Primary text' },
      ]
    }
  ]
};

// Stripe Design
const STRIPE: BrandPalette = {
  id: 'stripe',
  name: 'Stripe Design',
  company: 'Stripe',
  description: 'Stripe\'s refined, professional design system known for its gradient-rich aesthetics and clean interfaces.',
  website: 'https://stripe.com/docs/stripe-apps/design',
  tags: ['Professional', 'Gradient', 'Fintech'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Stripe Purple', hex: '#635BFF', description: 'Primary brand color' },
        { name: 'Stripe Blue', hex: '#00D4FF', description: 'Cyan gradient accent' },
        { name: 'Stripe Pink', hex: '#FF80AB', description: 'Pink gradient accent' },
      ]
    },
    {
      name: 'UI Colors',
      colors: [
        { name: 'Blue', hex: '#0073E6', description: 'Interactive blue' },
        { name: 'Green', hex: '#09825D', description: 'Success green' },
        { name: 'Yellow', hex: '#FFBB00', description: 'Warning yellow' },
        { name: 'Red', hex: '#CD3D64', description: 'Error red' },
        { name: 'Orange', hex: '#FF7A00', description: 'Orange accent' },
      ]
    },
    {
      name: 'Gray Scale',
      colors: [
        { name: 'Gray 950', hex: '#0A2540', description: 'Darkest gray' },
        { name: 'Gray 800', hex: '#1A1F36', description: 'Very dark gray' },
        { name: 'Gray 700', hex: '#3C4257', description: 'Dark gray' },
        { name: 'Gray 500', hex: '#697386', description: 'Medium gray' },
        { name: 'Gray 400', hex: '#9EA7B8', description: 'Gray' },
        { name: 'Gray 100', hex: '#F6F9FC', description: 'Near white' },
      ]
    }
  ]
};

// Slack Design
const SLACK: BrandPalette = {
  id: 'slack',
  name: 'Slack Design',
  company: 'Slack',
  description: 'Slack\'s playful yet professional design system built for workplace communication.',
  website: 'https://slack.com/brand-guidelines',
  tags: ['Playful', 'Communication', 'Modern'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Aubergine', hex: '#4A154B', description: 'Primary brand color' },
        { name: 'Blue', hex: '#36C5F0', description: 'Brand blue' },
        { name: 'Green', hex: '#2EB67D', description: 'Brand green' },
        { name: 'Yellow', hex: '#ECB22E', description: 'Brand yellow' },
        { name: 'Red', hex: '#E01E5A', description: 'Brand red' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Sky Blue', hex: '#1264A3', description: 'Link color' },
        { name: 'Olive', hex: '#5B6236', description: 'Olive accent' },
        { name: 'Purple', hex: '#6B2D5B', description: 'Purple accent' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Black', hex: '#1D1C1D', description: 'Primary text' },
        { name: 'Dark Gray', hex: '#616061', description: 'Secondary text' },
        { name: 'Gray', hex: '#868686', description: 'Tertiary text' },
        { name: 'Light Gray', hex: '#DDDDDD', description: 'Borders' },
        { name: 'Off White', hex: '#F8F8F8', description: 'Background' },
      ]
    }
  ]
};

// Shopify Polaris
const SHOPIFY_POLARIS: BrandPalette = {
  id: 'shopify-polaris',
  name: 'Polaris Design System',
  company: 'Shopify',
  description: 'Shopify\'s design system providing guidelines for creating consistent merchant experiences.',
  website: 'https://polaris.shopify.com',
  tags: ['E-commerce', 'Merchant', 'Professional'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Shopify Green', hex: '#008060', description: 'Primary brand' },
        { name: 'Green Light', hex: '#95BF47', description: 'Light green' },
        { name: 'Green Dark', hex: '#004C3F', description: 'Dark green' },
      ]
    },
    {
      name: 'UI Colors',
      colors: [
        { name: 'Blue', hex: '#2C6ECB', description: 'Interactive blue' },
        { name: 'Teal', hex: '#458FFF', description: 'Teal accent' },
        { name: 'Green', hex: '#008060', description: 'Success' },
        { name: 'Yellow', hex: '#B98900', description: 'Warning' },
        { name: 'Orange', hex: '#D82C0D', description: 'Critical' },
        { name: 'Red', hex: '#BF0711', description: 'Error' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Ink', hex: '#202223', description: 'Primary text' },
        { name: 'Ink Light', hex: '#6D7175', description: 'Secondary text' },
        { name: 'Border', hex: '#8C9196', description: 'Borders' },
        { name: 'Surface', hex: '#F6F6F7', description: 'Surface' },
        { name: 'Background', hex: '#FAFBFB', description: 'Background' },
      ]
    }
  ]
};

// Tailwind CSS Colors
const TAILWIND: BrandPalette = {
  id: 'tailwind',
  name: 'Tailwind CSS',
  company: 'Tailwind Labs',
  description: 'A curated color palette designed to work harmoniously for utility-first CSS development.',
  website: 'https://tailwindcss.com/docs/customizing-colors',
  tags: ['Developer', 'Utility', 'Versatile'],
  categories: [
    {
      name: 'Primary Colors',
      colors: [
        { name: 'Slate 500', hex: '#64748B', description: 'Neutral slate' },
        { name: 'Gray 500', hex: '#6B7280', description: 'Neutral gray' },
        { name: 'Zinc 500', hex: '#71717A', description: 'Neutral zinc' },
        { name: 'Red 500', hex: '#EF4444', description: 'Red' },
        { name: 'Orange 500', hex: '#F97316', description: 'Orange' },
        { name: 'Amber 500', hex: '#F59E0B', description: 'Amber' },
        { name: 'Yellow 500', hex: '#EAB308', description: 'Yellow' },
        { name: 'Lime 500', hex: '#84CC16', description: 'Lime' },
        { name: 'Green 500', hex: '#22C55E', description: 'Green' },
        { name: 'Emerald 500', hex: '#10B981', description: 'Emerald' },
        { name: 'Teal 500', hex: '#14B8A6', description: 'Teal' },
        { name: 'Cyan 500', hex: '#06B6D4', description: 'Cyan' },
        { name: 'Sky 500', hex: '#0EA5E9', description: 'Sky' },
        { name: 'Blue 500', hex: '#3B82F6', description: 'Blue' },
        { name: 'Indigo 500', hex: '#6366F1', description: 'Indigo' },
        { name: 'Violet 500', hex: '#8B5CF6', description: 'Violet' },
        { name: 'Purple 500', hex: '#A855F7', description: 'Purple' },
        { name: 'Fuchsia 500', hex: '#D946EF', description: 'Fuchsia' },
        { name: 'Pink 500', hex: '#EC4899', description: 'Pink' },
        { name: 'Rose 500', hex: '#F43F5E', description: 'Rose' },
      ]
    }
  ]
};

// Adobe Spectrum
const ADOBE_SPECTRUM: BrandPalette = {
  id: 'adobe-spectrum',
  name: 'Spectrum Design System',
  company: 'Adobe',
  description: 'Adobe\'s design system for creating consistent, quality experiences across all Adobe products.',
  website: 'https://spectrum.adobe.com',
  tags: ['Creative', 'Professional', 'Enterprise'],
  categories: [
    {
      name: 'Semantic',
      colors: [
        { name: 'Accent', hex: '#0265DC', description: 'Primary accent' },
        { name: 'Informative', hex: '#378EF0', description: 'Information' },
        { name: 'Positive', hex: '#2D9D78', description: 'Success' },
        { name: 'Notice', hex: '#E68619', description: 'Warning' },
        { name: 'Negative', hex: '#D7373F', description: 'Error' },
      ]
    },
    {
      name: 'Gray Scale',
      colors: [
        { name: 'Gray 900', hex: '#1D1D1D', description: 'Darkest gray' },
        { name: 'Gray 800', hex: '#2C2C2C', description: 'Very dark' },
        { name: 'Gray 700', hex: '#3E3E3E', description: 'Dark' },
        { name: 'Gray 600', hex: '#4B4B4B', description: 'Medium dark' },
        { name: 'Gray 500', hex: '#6E6E6E', description: 'Medium' },
        { name: 'Gray 400', hex: '#909090', description: 'Light' },
        { name: 'Gray 300', hex: '#B3B3B3', description: 'Lighter' },
        { name: 'Gray 200', hex: '#D3D3D3', description: 'Very light' },
        { name: 'Gray 100', hex: '#ECECEC', description: 'Near white' },
        { name: 'Gray 50', hex: '#F8F8F8', description: 'Lightest' },
      ]
    },
    {
      name: 'Product Colors',
      colors: [
        { name: 'Photoshop', hex: '#31A8FF', description: 'Photoshop brand' },
        { name: 'Illustrator', hex: '#FF9A00', description: 'Illustrator brand' },
        { name: 'XD', hex: '#FF61F6', description: 'XD brand' },
        { name: 'InDesign', hex: '#FF3366', description: 'InDesign brand' },
        { name: 'Premiere Pro', hex: '#9999FF', description: 'Premiere brand' },
        { name: 'After Effects', hex: '#9999FF', description: 'AE brand' },
      ]
    }
  ]
};

// GitHub Primer
const GITHUB_PRIMER: BrandPalette = {
  id: 'github-primer',
  name: 'Primer Design System',
  company: 'GitHub',
  description: 'GitHub\'s design system providing the foundation for the GitHub product experience.',
  website: 'https://primer.style',
  tags: ['Developer', 'Open Source', 'Technical'],
  categories: [
    {
      name: 'Accent',
      colors: [
        { name: 'Accent Blue', hex: '#0969DA', description: 'Primary action' },
        { name: 'Accent Green', hex: '#1A7F37', description: 'Success' },
        { name: 'Accent Yellow', hex: '#9A6700', description: 'Warning' },
        { name: 'Accent Orange', hex: '#BC4C00', description: 'Severe warning' },
        { name: 'Accent Red', hex: '#CF222E', description: 'Danger' },
        { name: 'Accent Purple', hex: '#8250DF', description: 'Sponsors' },
        { name: 'Accent Pink', hex: '#BF3989', description: 'Pink accent' },
      ]
    },
    {
      name: 'Scale',
      colors: [
        { name: 'Gray 0', hex: '#F6F8FA', description: 'Canvas subtle' },
        { name: 'Gray 1', hex: '#EAEEF2', description: 'Border muted' },
        { name: 'Gray 3', hex: '#D0D7DE', description: 'Border default' },
        { name: 'Gray 5', hex: '#6E7781', description: 'Text muted' },
        { name: 'Gray 7', hex: '#424A53', description: 'Text secondary' },
        { name: 'Gray 9', hex: '#24292F', description: 'Text primary' },
      ]
    }
  ]
};

// Ant Design
const ANT_DESIGN: BrandPalette = {
  id: 'ant-design',
  name: 'Ant Design',
  company: 'Ant Group',
  description: 'An enterprise-class UI design language and React UI library with a set of high-quality components.',
  website: 'https://ant.design',
  tags: ['Enterprise', 'React', 'Chinese'],
  categories: [
    {
      name: 'Brand Colors',
      colors: [
        { name: 'Daybreak Blue', hex: '#1890FF', description: 'Primary brand' },
        { name: 'Geek Blue', hex: '#2F54EB', description: 'Blue variant' },
        { name: 'Dust Red', hex: '#F5222D', description: 'Error' },
        { name: 'Volcano', hex: '#FA541C', description: 'Orange accent' },
        { name: 'Sunset Orange', hex: '#FA8C16', description: 'Warning' },
        { name: 'Calendula Gold', hex: '#FAAD14', description: 'Gold' },
        { name: 'Sunrise Yellow', hex: '#FADB14', description: 'Yellow' },
        { name: 'Lime', hex: '#A0D911', description: 'Lime' },
        { name: 'Polar Green', hex: '#52C41A', description: 'Success' },
        { name: 'Cyan', hex: '#13C2C2', description: 'Cyan' },
        { name: 'Golden Purple', hex: '#722ED1', description: 'Purple' },
        { name: 'Magenta', hex: '#EB2F96', description: 'Magenta' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Title', hex: '#262626', description: 'Title text' },
        { name: 'Primary Text', hex: '#595959', description: 'Primary text' },
        { name: 'Secondary Text', hex: '#8C8C8C', description: 'Secondary text' },
        { name: 'Disabled', hex: '#BFBFBF', description: 'Disabled' },
        { name: 'Border', hex: '#D9D9D9', description: 'Border' },
        { name: 'Background', hex: '#F0F0F0', description: 'Background' },
      ]
    }
  ]
};

// Linear Design
const LINEAR: BrandPalette = {
  id: 'linear',
  name: 'Linear Design',
  company: 'Linear',
  description: 'Linear\'s sleek, dark-mode first design system for modern project management.',
  website: 'https://linear.app',
  tags: ['Dark Mode', 'Modern', 'Minimal'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Linear Purple', hex: '#5E6AD2', description: 'Primary brand' },
        { name: 'Linear Blue', hex: '#4DA7FC', description: 'Blue accent' },
      ]
    },
    {
      name: 'Status',
      colors: [
        { name: 'Backlog', hex: '#95979C', description: 'Backlog status' },
        { name: 'Todo', hex: '#C7C8CB', description: 'Todo status' },
        { name: 'In Progress', hex: '#F2C94C', description: 'In progress' },
        { name: 'Done', hex: '#4DA7FC', description: 'Done status' },
        { name: 'Canceled', hex: '#6B6D70', description: 'Canceled status' },
      ]
    },
    {
      name: 'Priority',
      colors: [
        { name: 'Urgent', hex: '#F2994A', description: 'Urgent priority' },
        { name: 'High', hex: '#EB5757', description: 'High priority' },
        { name: 'Medium', hex: '#F2C94C', description: 'Medium priority' },
        { name: 'Low', hex: '#95979C', description: 'Low priority' },
      ]
    },
    {
      name: 'Base',
      colors: [
        { name: 'Background', hex: '#1F2023', description: 'App background' },
        { name: 'Surface', hex: '#2B2D31', description: 'Surface' },
        { name: 'Border', hex: '#3B3D42', description: 'Border' },
        { name: 'Text', hex: '#F2F2F2', description: 'Primary text' },
        { name: 'Text Muted', hex: '#95979C', description: 'Secondary text' },
      ]
    }
  ]
};

// Discord Design
const DISCORD: BrandPalette = {
  id: 'discord',
  name: 'Discord Design',
  company: 'Discord',
  description: 'Discord\'s vibrant design system for the popular communication platform.',
  website: 'https://discord.com/branding',
  tags: ['Gaming', 'Social', 'Dark Mode'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Blurple', hex: '#5865F2', description: 'Primary brand' },
        { name: 'Green', hex: '#57F287', description: 'Online status' },
        { name: 'Yellow', hex: '#FEE75C', description: 'Idle status' },
        { name: 'Fuchsia', hex: '#EB459E', description: 'Pink accent' },
        { name: 'Red', hex: '#ED4245', description: 'DND status' },
      ]
    },
    {
      name: 'Background',
      colors: [
        { name: 'Not Quite Black', hex: '#23272A', description: 'Darkest background' },
        { name: 'Dark, Not Black', hex: '#2C2F33', description: 'Dark surface' },
        { name: 'Greyple', hex: '#99AAB5', description: 'Secondary text' },
        { name: 'White', hex: '#FFFFFF', description: 'Primary text' },
      ]
    }
  ]
};

// Notion Colors
const NOTION: BrandPalette = {
  id: 'notion',
  name: 'Notion Design',
  company: 'Notion',
  description: 'Notion\'s clean, minimal design language for the all-in-one workspace.',
  website: 'https://notion.so',
  tags: ['Minimal', 'Productivity', 'Clean'],
  categories: [
    {
      name: 'Highlight Colors',
      colors: [
        { name: 'Gray', hex: '#9B9A97', description: 'Gray highlight' },
        { name: 'Brown', hex: '#64473A', description: 'Brown highlight' },
        { name: 'Orange', hex: '#D9730D', description: 'Orange highlight' },
        { name: 'Yellow', hex: '#DFAB01', description: 'Yellow highlight' },
        { name: 'Green', hex: '#0F7B6C', description: 'Green highlight' },
        { name: 'Blue', hex: '#0B6E99', description: 'Blue highlight' },
        { name: 'Purple', hex: '#6940A5', description: 'Purple highlight' },
        { name: 'Pink', hex: '#AD1A72', description: 'Pink highlight' },
        { name: 'Red', hex: '#E03E3E', description: 'Red highlight' },
      ]
    },
    {
      name: 'Background Colors',
      colors: [
        { name: 'Gray BG', hex: '#F1F1EF', description: 'Gray background' },
        { name: 'Brown BG', hex: '#F4EEEE', description: 'Brown background' },
        { name: 'Orange BG', hex: '#FAEBDD', description: 'Orange background' },
        { name: 'Yellow BG', hex: '#FBF3DB', description: 'Yellow background' },
        { name: 'Green BG', hex: '#DDEDEA', description: 'Green background' },
        { name: 'Blue BG', hex: '#DDEBF1', description: 'Blue background' },
        { name: 'Purple BG', hex: '#EAE4F2', description: 'Purple background' },
        { name: 'Pink BG', hex: '#F4DFEB', description: 'Pink background' },
        { name: 'Red BG', hex: '#FBE4E4', description: 'Red background' },
      ]
    },
    {
      name: 'UI',
      colors: [
        { name: 'Text', hex: '#37352F', description: 'Primary text' },
        { name: 'Text Light', hex: '#787774', description: 'Secondary text' },
        { name: 'Background', hex: '#FFFFFF', description: 'Page background' },
      ]
    }
  ]
};

// Vercel / Next.js Design
const VERCEL: BrandPalette = {
  id: 'vercel',
  name: 'Vercel Geist',
  company: 'Vercel',
  description: 'Vercel\'s Geist design system for building performant web applications.',
  website: 'https://vercel.com/geist/introduction',
  tags: ['Developer', 'Minimal', 'Modern'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Black', hex: '#000000', description: 'Primary brand' },
        { name: 'White', hex: '#FFFFFF', description: 'Inverted brand' },
      ]
    },
    {
      name: 'Accents',
      colors: [
        { name: 'Blue', hex: '#0070F3', description: 'Primary accent' },
        { name: 'Cyan', hex: '#50E3C2', description: 'Success accent' },
        { name: 'Purple', hex: '#7928CA', description: 'Purple accent' },
        { name: 'Pink', hex: '#FF0080', description: 'Pink accent' },
        { name: 'Orange', hex: '#F5A623', description: 'Warning' },
        { name: 'Violet', hex: '#8A63D2', description: 'Violet accent' },
      ]
    },
    {
      name: 'Gray Scale',
      colors: [
        { name: 'Gray 100', hex: '#FAFAFA', description: 'Lightest' },
        { name: 'Gray 200', hex: '#EAEAEA', description: 'Border' },
        { name: 'Gray 400', hex: '#999999', description: 'Placeholder' },
        { name: 'Gray 500', hex: '#888888', description: 'Secondary text' },
        { name: 'Gray 700', hex: '#444444', description: 'Dark text' },
        { name: 'Gray 900', hex: '#111111', description: 'Near black' },
      ]
    }
  ]
};

// Twitter/X Design
const TWITTER: BrandPalette = {
  id: 'twitter',
  name: 'Twitter Design',
  company: 'Twitter/X',
  description: 'Twitter\'s recognizable blue-centric design system for social media.',
  website: 'https://brand.twitter.com',
  tags: ['Social', 'Recognizable', 'Blue'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Twitter Blue', hex: '#1DA1F2', description: 'Classic Twitter blue' },
        { name: 'X Black', hex: '#000000', description: 'X rebrand black' },
      ]
    },
    {
      name: 'UI Colors',
      colors: [
        { name: 'Blue', hex: '#1DA1F2', description: 'Primary action' },
        { name: 'Green', hex: '#17BF63', description: 'Retweet' },
        { name: 'Red', hex: '#E0245E', description: 'Like' },
        { name: 'Yellow', hex: '#FFAD1F', description: 'Alert' },
      ]
    },
    {
      name: 'Gray Scale',
      colors: [
        { name: 'Black', hex: '#14171A', description: 'Text' },
        { name: 'Dark Gray', hex: '#657786', description: 'Secondary' },
        { name: 'Light Gray', hex: '#AAB8C2', description: 'Tertiary' },
        { name: 'Extra Light Gray', hex: '#E1E8ED', description: 'Border' },
        { name: 'Extra Extra Light Gray', hex: '#F5F8FA', description: 'Background' },
      ]
    }
  ]
};

// Meta/Facebook Design
const META: BrandPalette = {
  id: 'meta',
  name: 'Meta Design',
  company: 'Meta',
  description: 'Meta\'s design system powering Facebook, Instagram, WhatsApp, and more.',
  website: 'https://design.facebook.com',
  tags: ['Social', 'Global', 'Diverse'],
  categories: [
    {
      name: 'Facebook',
      colors: [
        { name: 'Facebook Blue', hex: '#1877F2', description: 'Facebook brand' },
        { name: 'Messenger Blue', hex: '#0084FF', description: 'Messenger brand' },
      ]
    },
    {
      name: 'Instagram',
      colors: [
        { name: 'Instagram Purple', hex: '#833AB4', description: 'Instagram purple' },
        { name: 'Instagram Pink', hex: '#E1306C', description: 'Instagram pink' },
        { name: 'Instagram Orange', hex: '#F77737', description: 'Instagram orange' },
        { name: 'Instagram Yellow', hex: '#FCAF45', description: 'Instagram yellow' },
      ]
    },
    {
      name: 'WhatsApp',
      colors: [
        { name: 'WhatsApp Green', hex: '#25D366', description: 'WhatsApp brand' },
        { name: 'WhatsApp Teal', hex: '#128C7E', description: 'WhatsApp teal' },
        { name: 'WhatsApp Dark', hex: '#075E54', description: 'WhatsApp dark' },
      ]
    },
    {
      name: 'Meta',
      colors: [
        { name: 'Meta Blue', hex: '#0668E1', description: 'Meta brand' },
      ]
    }
  ]
};

// Airbnb Design
const AIRBNB: BrandPalette = {
  id: 'airbnb',
  name: 'Airbnb Design',
  company: 'Airbnb',
  description: 'Airbnb\'s warm and welcoming design system for travel experiences.',
  website: 'https://airbnb.design',
  tags: ['Travel', 'Warm', 'Friendly'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Rausch', hex: '#FF5A5F', description: 'Primary brand coral' },
        { name: 'Babu', hex: '#00A699', description: 'Teal accent' },
        { name: 'Arches', hex: '#FC642D', description: 'Orange accent' },
        { name: 'Hof', hex: '#484848', description: 'Dark text' },
        { name: 'Foggy', hex: '#767676', description: 'Secondary text' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Kazan', hex: '#914669', description: 'Purple variant' },
        { name: 'Beach', hex: '#FFAA91', description: 'Light coral' },
        { name: 'Tiber', hex: '#CED1CC', description: 'Light gray' },
      ]
    }
  ]
};

// Uber Design
const UBER: BrandPalette = {
  id: 'uber',
  name: 'Base Web',
  company: 'Uber',
  description: 'Uber\'s Base Web design system for building accessible web applications.',
  website: 'https://baseweb.design',
  tags: ['Mobility', 'Accessible', 'Modern'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Black', hex: '#000000', description: 'Primary brand' },
        { name: 'White', hex: '#FFFFFF', description: 'Contrast color' },
      ]
    },
    {
      name: 'Accent',
      colors: [
        { name: 'Blue 400', hex: '#276EF1', description: 'Primary accent' },
        { name: 'Green 400', hex: '#05944F', description: 'Success' },
        { name: 'Yellow 400', hex: '#FFC043', description: 'Warning' },
        { name: 'Orange 400', hex: '#ED6E33', description: 'Orange accent' },
        { name: 'Red 400', hex: '#E54937', description: 'Error' },
        { name: 'Purple 400', hex: '#7356BF', description: 'Purple accent' },
        { name: 'Brown 400', hex: '#99644C', description: 'Brown accent' },
      ]
    },
    {
      name: 'Gray Scale',
      colors: [
        { name: 'Gray 900', hex: '#141414', description: 'Darkest' },
        { name: 'Gray 700', hex: '#333333', description: 'Dark' },
        { name: 'Gray 500', hex: '#757575', description: 'Medium' },
        { name: 'Gray 300', hex: '#AFAFAF', description: 'Light' },
        { name: 'Gray 100', hex: '#EEEEEE', description: 'Lightest' },
      ]
    }
  ]
};

// Chakra UI Colors
const CHAKRA_UI: BrandPalette = {
  id: 'chakra-ui',
  name: 'Chakra UI',
  company: 'Chakra',
  description: 'Chakra UI\'s accessible component library color system for React applications.',
  website: 'https://chakra-ui.com',
  tags: ['React', 'Accessible', 'Developer'],
  categories: [
    {
      name: 'Primary',
      colors: [
        { name: 'Teal 500', hex: '#319795', description: 'Primary teal' },
        { name: 'Blue 500', hex: '#3182CE', description: 'Blue' },
        { name: 'Cyan 500', hex: '#00B5D8', description: 'Cyan' },
        { name: 'Purple 500', hex: '#805AD5', description: 'Purple' },
        { name: 'Pink 500', hex: '#D53F8C', description: 'Pink' },
      ]
    },
    {
      name: 'Status',
      colors: [
        { name: 'Green 500', hex: '#38A169', description: 'Success' },
        { name: 'Red 500', hex: '#E53E3E', description: 'Error' },
        { name: 'Orange 500', hex: '#DD6B20', description: 'Warning' },
        { name: 'Yellow 500', hex: '#D69E2E', description: 'Info' },
      ]
    },
    {
      name: 'Gray Scale',
      colors: [
        { name: 'Gray 900', hex: '#171923', description: 'Near black' },
        { name: 'Gray 700', hex: '#2D3748', description: 'Dark' },
        { name: 'Gray 500', hex: '#718096', description: 'Medium' },
        { name: 'Gray 300', hex: '#CBD5E0', description: 'Light' },
        { name: 'Gray 100', hex: '#EDF2F7', description: 'Lightest' },
        { name: 'Gray 50', hex: '#F7FAFC', description: 'Near white' },
      ]
    }
  ]
};

// Netflix Design
const NETFLIX: BrandPalette = {
  id: 'netflix',
  name: 'Netflix Design',
  company: 'Netflix',
  description: 'Netflix\'s bold, cinematic design system for streaming entertainment.',
  website: 'https://brand.netflix.com',
  tags: ['Entertainment', 'Bold', 'Dark Mode'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Netflix Red', hex: '#E50914', description: 'Primary brand red' },
        { name: 'Netflix Black', hex: '#141414', description: 'Background black' },
      ]
    },
    {
      name: 'UI Colors',
      colors: [
        { name: 'White', hex: '#FFFFFF', description: 'Primary text' },
        { name: 'Light Gray', hex: '#B3B3B3', description: 'Secondary text' },
        { name: 'Dark Gray', hex: '#808080', description: 'Muted text' },
        { name: 'Surface', hex: '#1F1F1F', description: 'Card surface' },
        { name: 'Hover', hex: '#2F2F2F', description: 'Hover state' },
      ]
    }
  ]
};

// Pinterest Design
const PINTEREST: BrandPalette = {
  id: 'pinterest',
  name: 'Pinterest Gestalt',
  company: 'Pinterest',
  description: 'Pinterest\'s Gestalt design system for visual discovery and inspiration.',
  website: 'https://gestalt.pinterest.systems',
  tags: ['Visual', 'Discovery', 'Creative'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Pinterest Red', hex: '#E60023', description: 'Primary brand red' },
        { name: 'White', hex: '#FFFFFF', description: 'Background' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Red 100', hex: '#FF5247', description: 'Light red' },
        { name: 'Orange 100', hex: '#F97C00', description: 'Orange' },
        { name: 'Yellow 100', hex: '#F5C700', description: 'Yellow' },
        { name: 'Green 100', hex: '#0FA573', description: 'Green' },
        { name: 'Teal 100', hex: '#0095D7', description: 'Teal' },
        { name: 'Blue 100', hex: '#0074E8', description: 'Blue' },
        { name: 'Purple 100', hex: '#8046F0', description: 'Purple' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Gray 900', hex: '#111111', description: 'Primary text' },
        { name: 'Gray 600', hex: '#767676', description: 'Secondary text' },
        { name: 'Gray 400', hex: '#ABABAB', description: 'Tertiary text' },
        { name: 'Gray 200', hex: '#DCDCDC', description: 'Border' },
        { name: 'Gray 100', hex: '#EFEFEF', description: 'Background' },
      ]
    }
  ]
};

// Twitch Design
const TWITCH: BrandPalette = {
  id: 'twitch',
  name: 'Twitch Design',
  company: 'Twitch',
  description: 'Twitch\'s vibrant design system for live streaming and gaming culture.',
  website: 'https://brand.twitch.tv',
  tags: ['Gaming', 'Streaming', 'Vibrant'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Twitch Purple', hex: '#9146FF', description: 'Primary brand purple' },
        { name: 'Ice', hex: '#F0F0FF', description: 'Light purple tint' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Hype Purple', hex: '#772CE8', description: 'Hype train purple' },
        { name: 'Prime Blue', hex: '#00C8AF', description: 'Twitch Prime' },
        { name: 'Red', hex: '#EB0400', description: 'Error/Live' },
        { name: 'Orange', hex: '#FAA61A', description: 'Warning' },
        { name: 'Green', hex: '#00B5AD', description: 'Success' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Gray 100', hex: '#0E0E10', description: 'Background' },
        { name: 'Gray 90', hex: '#18181B', description: 'Surface' },
        { name: 'Gray 75', hex: '#323238', description: 'Elevated' },
        { name: 'Gray 50', hex: '#53535F', description: 'Muted' },
        { name: 'Gray 25', hex: '#ADADB8', description: 'Secondary text' },
        { name: 'Gray 10', hex: '#EFEFF1', description: 'Primary text' },
      ]
    }
  ]
};

// Figma Design
const FIGMA: BrandPalette = {
  id: 'figma',
  name: 'Figma Design',
  company: 'Figma',
  description: 'Figma\'s colorful design system for collaborative design tools.',
  website: 'https://figma.com',
  tags: ['Design', 'Collaborative', 'Colorful'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Figma Orange', hex: '#F24E1E', description: 'Figma brand' },
        { name: 'FigJam Yellow', hex: '#FFC700', description: 'FigJam brand' },
        { name: 'Figma Purple', hex: '#A259FF', description: 'Figma purple' },
        { name: 'Figma Blue', hex: '#1ABCFE', description: 'Figma blue' },
        { name: 'Figma Green', hex: '#0ACF83', description: 'Figma green' },
      ]
    },
    {
      name: 'UI Colors',
      colors: [
        { name: 'Selection', hex: '#0D99FF', description: 'Selection blue' },
        { name: 'Component', hex: '#9747FF', description: 'Component purple' },
        { name: 'Instance', hex: '#9747FF', description: 'Instance purple' },
        { name: 'Error', hex: '#F24822', description: 'Error red' },
        { name: 'Warning', hex: '#FFCD29', description: 'Warning yellow' },
        { name: 'Success', hex: '#14AE5C', description: 'Success green' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Black', hex: '#1E1E1E', description: 'Background dark' },
        { name: 'Gray 800', hex: '#2C2C2C', description: 'Surface dark' },
        { name: 'Gray 600', hex: '#444444', description: 'Border dark' },
        { name: 'Gray 400', hex: '#B3B3B3', description: 'Muted text' },
        { name: 'Gray 200', hex: '#E5E5E5', description: 'Border light' },
        { name: 'White', hex: '#FFFFFF', description: 'Background light' },
      ]
    }
  ]
};

// Bootstrap Design
const BOOTSTRAP: BrandPalette = {
  id: 'bootstrap',
  name: 'Bootstrap',
  company: 'Bootstrap Team',
  description: 'The most popular CSS framework\'s comprehensive color system.',
  website: 'https://getbootstrap.com',
  tags: ['Framework', 'Developer', 'Popular'],
  categories: [
    {
      name: 'Theme Colors',
      colors: [
        { name: 'Primary', hex: '#0D6EFD', description: 'Primary blue' },
        { name: 'Secondary', hex: '#6C757D', description: 'Secondary gray' },
        { name: 'Success', hex: '#198754', description: 'Success green' },
        { name: 'Danger', hex: '#DC3545', description: 'Danger red' },
        { name: 'Warning', hex: '#FFC107', description: 'Warning yellow' },
        { name: 'Info', hex: '#0DCAF0', description: 'Info cyan' },
        { name: 'Light', hex: '#F8F9FA', description: 'Light gray' },
        { name: 'Dark', hex: '#212529', description: 'Dark gray' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Indigo', hex: '#6610F2', description: 'Indigo' },
        { name: 'Purple', hex: '#6F42C1', description: 'Purple' },
        { name: 'Pink', hex: '#D63384', description: 'Pink' },
        { name: 'Orange', hex: '#FD7E14', description: 'Orange' },
        { name: 'Teal', hex: '#20C997', description: 'Teal' },
        { name: 'Cyan', hex: '#0DCAF0', description: 'Cyan' },
      ]
    }
  ]
};

// Material UI (MUI)
const MUI: BrandPalette = {
  id: 'mui',
  name: 'Material UI',
  company: 'MUI',
  description: 'MUI\'s React component library implementing Material Design with extended customization.',
  website: 'https://mui.com',
  tags: ['React', 'Material', 'Developer'],
  categories: [
    {
      name: 'Default Theme',
      colors: [
        { name: 'Primary', hex: '#1976D2', description: 'Primary blue' },
        { name: 'Primary Light', hex: '#42A5F5', description: 'Primary light' },
        { name: 'Primary Dark', hex: '#1565C0', description: 'Primary dark' },
        { name: 'Secondary', hex: '#9C27B0', description: 'Secondary purple' },
        { name: 'Secondary Light', hex: '#BA68C8', description: 'Secondary light' },
        { name: 'Secondary Dark', hex: '#7B1FA2', description: 'Secondary dark' },
      ]
    },
    {
      name: 'Status',
      colors: [
        { name: 'Error', hex: '#D32F2F', description: 'Error red' },
        { name: 'Warning', hex: '#ED6C02', description: 'Warning orange' },
        { name: 'Info', hex: '#0288D1', description: 'Info blue' },
        { name: 'Success', hex: '#2E7D32', description: 'Success green' },
      ]
    },
    {
      name: 'Gray Scale',
      colors: [
        { name: 'Gray 900', hex: '#212121', description: 'Text primary' },
        { name: 'Gray 700', hex: '#616161', description: 'Text secondary' },
        { name: 'Gray 500', hex: '#9E9E9E', description: 'Text disabled' },
        { name: 'Gray 300', hex: '#E0E0E0', description: 'Divider' },
        { name: 'Gray 100', hex: '#F5F5F5', description: 'Background' },
      ]
    }
  ]
};

// Salesforce Lightning
const SALESFORCE: BrandPalette = {
  id: 'salesforce',
  name: 'Lightning Design',
  company: 'Salesforce',
  description: 'Salesforce\'s Lightning Design System for enterprise CRM applications.',
  website: 'https://lightningdesignsystem.com',
  tags: ['Enterprise', 'CRM', 'Professional'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Cloud Blue', hex: '#00A1E0', description: 'Salesforce brand' },
        { name: 'Deep Blue', hex: '#0176D3', description: 'Primary action' },
        { name: 'Science Blue', hex: '#032D60', description: 'Dark blue' },
      ]
    },
    {
      name: 'Cloud Colors',
      colors: [
        { name: 'Sales', hex: '#1B96FF', description: 'Sales Cloud' },
        { name: 'Service', hex: '#FFA929', description: 'Service Cloud' },
        { name: 'Marketing', hex: '#6B59B6', description: 'Marketing Cloud' },
        { name: 'Commerce', hex: '#00B531', description: 'Commerce Cloud' },
        { name: 'Experience', hex: '#FF538A', description: 'Experience Cloud' },
      ]
    },
    {
      name: 'Status',
      colors: [
        { name: 'Success', hex: '#2E844A', description: 'Success green' },
        { name: 'Warning', hex: '#DD7A01', description: 'Warning orange' },
        { name: 'Error', hex: '#EA001E', description: 'Error red' },
        { name: 'Info', hex: '#0176D3', description: 'Info blue' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Gray 1', hex: '#080707', description: 'Darkest' },
        { name: 'Gray 5', hex: '#444444', description: 'Dark' },
        { name: 'Gray 7', hex: '#706E6B', description: 'Medium' },
        { name: 'Gray 10', hex: '#C9C7C5', description: 'Light' },
        { name: 'Gray 13', hex: '#ECEBEA', description: 'Lightest' },
      ]
    }
  ]
};

// YouTube Design
const YOUTUBE: BrandPalette = {
  id: 'youtube',
  name: 'YouTube Design',
  company: 'YouTube/Google',
  description: 'YouTube\'s iconic red-centric design for video streaming.',
  website: 'https://youtube.com',
  tags: ['Video', 'Entertainment', 'Google'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'YouTube Red', hex: '#FF0000', description: 'Primary brand red' },
        { name: 'Almost Black', hex: '#282828', description: 'Dark mode background' },
        { name: 'White', hex: '#FFFFFF', description: 'Light mode background' },
      ]
    },
    {
      name: 'UI Colors',
      colors: [
        { name: 'Red', hex: '#FF0000', description: 'Subscribe/Like' },
        { name: 'Blue', hex: '#065FD4', description: 'Links' },
        { name: 'Green', hex: '#2BA640', description: 'Success' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Text Primary', hex: '#0F0F0F', description: 'Primary text light' },
        { name: 'Text Secondary', hex: '#606060', description: 'Secondary text' },
        { name: 'Icon', hex: '#909090', description: 'Icons' },
        { name: 'Divider', hex: '#E5E5E5', description: 'Divider' },
        { name: 'Surface', hex: '#F9F9F9', description: 'Surface' },
      ]
    }
  ]
};

// TikTok Design
const TIKTOK: BrandPalette = {
  id: 'tiktok',
  name: 'TikTok Design',
  company: 'TikTok',
  description: 'TikTok\'s vibrant, music-inspired design for short-form video.',
  website: 'https://tiktok.com',
  tags: ['Social', 'Video', 'Vibrant'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'TikTok Aqua', hex: '#69C9D0', description: 'Brand cyan' },
        { name: 'TikTok Red', hex: '#EE1D52', description: 'Brand red' },
        { name: 'TikTok Black', hex: '#010101', description: 'Brand black' },
        { name: 'White', hex: '#FFFFFF', description: 'Background' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Pink', hex: '#FF6680', description: 'Pink accent' },
        { name: 'Purple', hex: '#7B61FF', description: 'Purple accent' },
        { name: 'Blue', hex: '#0095F6', description: 'Blue accent' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Gray 900', hex: '#161823', description: 'Dark mode bg' },
        { name: 'Gray 700', hex: '#2F2F2F', description: 'Surface' },
        { name: 'Gray 500', hex: '#545454', description: 'Secondary text' },
        { name: 'Gray 300', hex: '#8A8B91', description: 'Muted' },
        { name: 'Gray 100', hex: '#F1F1F2', description: 'Light surface' },
      ]
    }
  ]
};

// LinkedIn Design
const LINKEDIN: BrandPalette = {
  id: 'linkedin',
  name: 'LinkedIn Design',
  company: 'LinkedIn/Microsoft',
  description: 'LinkedIn\'s professional design system for career networking.',
  website: 'https://linkedin.com',
  tags: ['Professional', 'Networking', 'Microsoft'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'LinkedIn Blue', hex: '#0A66C2', description: 'Primary brand blue' },
        { name: 'Dark Blue', hex: '#004182', description: 'Dark blue variant' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Blue 70', hex: '#378FE9', description: 'Light blue' },
        { name: 'Green', hex: '#057642', description: 'Success/Premium' },
        { name: 'Warm Red', hex: '#B24020', description: 'Notifications' },
        { name: 'Purple', hex: '#5F3DC4', description: 'Learning' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Black', hex: '#000000', description: 'Text primary' },
        { name: 'Gray 90', hex: '#1D2226', description: 'Dark text' },
        { name: 'Gray 70', hex: '#38434F', description: 'Secondary text' },
        { name: 'Gray 50', hex: '#666666', description: 'Muted text' },
        { name: 'Gray 30', hex: '#C7C7C7', description: 'Border' },
        { name: 'Gray 10', hex: '#F3F2EF', description: 'Background' },
      ]
    }
  ]
};

// Dribbble Design
const DRIBBBLE: BrandPalette = {
  id: 'dribbble',
  name: 'Dribbble Design',
  company: 'Dribbble',
  description: 'Dribbble\'s playful design system for the design community.',
  website: 'https://dribbble.com',
  tags: ['Design', 'Creative', 'Community'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Dribbble Pink', hex: '#EA4C89', description: 'Primary brand pink' },
        { name: 'Pink Dark', hex: '#E62872', description: 'Dark pink' },
        { name: 'Pink Light', hex: '#F082AC', description: 'Light pink' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Purple', hex: '#6E5494', description: 'Pro badge' },
        { name: 'Blue', hex: '#4AB3F4', description: 'Links' },
        { name: 'Green', hex: '#7CB342', description: 'Success' },
        { name: 'Yellow', hex: '#FBC02D', description: 'Warning' },
        { name: 'Red', hex: '#F44336', description: 'Error' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Black', hex: '#0D0C22', description: 'Text primary' },
        { name: 'Gray 800', hex: '#3D3D4E', description: 'Text secondary' },
        { name: 'Gray 500', hex: '#9E9EA7', description: 'Muted' },
        { name: 'Gray 200', hex: '#E7E7E9', description: 'Border' },
        { name: 'Gray 100', hex: '#F3F3F4', description: 'Background' },
      ]
    }
  ]
};

// Radix UI Colors
const RADIX: BrandPalette = {
  id: 'radix',
  name: 'Radix Colors',
  company: 'WorkOS',
  description: 'A gorgeous, accessible color system for beautiful, consistent UIs.',
  website: 'https://radix-ui.com/colors',
  tags: ['React', 'Accessible', 'Modern'],
  categories: [
    {
      name: 'Primary Scales',
      colors: [
        { name: 'Blue 9', hex: '#0091FF', description: 'Blue solid' },
        { name: 'Cyan 9', hex: '#00C2D7', description: 'Cyan solid' },
        { name: 'Teal 9', hex: '#12A594', description: 'Teal solid' },
        { name: 'Green 9', hex: '#30A46C', description: 'Green solid' },
        { name: 'Grass 9', hex: '#46A758', description: 'Grass solid' },
      ]
    },
    {
      name: 'Accent Scales',
      colors: [
        { name: 'Orange 9', hex: '#F76B15', description: 'Orange solid' },
        { name: 'Red 9', hex: '#E5484D', description: 'Red solid' },
        { name: 'Crimson 9', hex: '#E93D82', description: 'Crimson solid' },
        { name: 'Pink 9', hex: '#D6409F', description: 'Pink solid' },
        { name: 'Plum 9', hex: '#AB4ABA', description: 'Plum solid' },
        { name: 'Purple 9', hex: '#8E4EC6', description: 'Purple solid' },
        { name: 'Violet 9', hex: '#6E56CF', description: 'Violet solid' },
        { name: 'Indigo 9', hex: '#3E63DD', description: 'Indigo solid' },
      ]
    },
    {
      name: 'Gray Scales',
      colors: [
        { name: 'Slate 12', hex: '#1C2024', description: 'Slate text' },
        { name: 'Slate 9', hex: '#889096', description: 'Slate solid' },
        { name: 'Slate 6', hex: '#D7DBDF', description: 'Slate border' },
        { name: 'Slate 3', hex: '#F1F3F5', description: 'Slate subtle' },
        { name: 'Slate 1', hex: '#FCFCFD', description: 'Slate bg' },
      ]
    }
  ]
};

// Supabase Design
const SUPABASE: BrandPalette = {
  id: 'supabase',
  name: 'Supabase Design',
  company: 'Supabase',
  description: 'Supabase\'s developer-friendly design system with a signature green.',
  website: 'https://supabase.com',
  tags: ['Developer', 'Database', 'Open Source'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Supabase Green', hex: '#3ECF8E', description: 'Primary brand green' },
        { name: 'Green Light', hex: '#3FCF8E', description: 'Light green' },
        { name: 'Green Dark', hex: '#10633E', description: 'Dark green' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Blue', hex: '#3B82F6', description: 'Blue accent' },
        { name: 'Purple', hex: '#A855F7', description: 'Purple accent' },
        { name: 'Pink', hex: '#EC4899', description: 'Pink accent' },
        { name: 'Yellow', hex: '#EAB308', description: 'Warning' },
        { name: 'Red', hex: '#EF4444', description: 'Error' },
      ]
    },
    {
      name: 'Neutral (Dark)',
      colors: [
        { name: 'Background', hex: '#1C1C1C', description: 'Background' },
        { name: 'Surface 100', hex: '#1F1F1F', description: 'Surface' },
        { name: 'Surface 200', hex: '#2A2A2A', description: 'Elevated' },
        { name: 'Surface 300', hex: '#3F3F3F', description: 'Higher elevation' },
        { name: 'Border', hex: '#333333', description: 'Border' },
        { name: 'Text', hex: '#EDEDED', description: 'Primary text' },
        { name: 'Text Muted', hex: '#8F8F8F', description: 'Muted text' },
      ]
    }
  ]
};

// Webflow Design
const WEBFLOW: BrandPalette = {
  id: 'webflow',
  name: 'Webflow Design',
  company: 'Webflow',
  description: 'Webflow\'s professional design system for no-code web development.',
  website: 'https://webflow.com',
  tags: ['No-code', 'Web Design', 'Professional'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Webflow Blue', hex: '#4353FF', description: 'Primary brand blue' },
        { name: 'Blue Light', hex: '#6977FF', description: 'Light blue' },
        { name: 'Blue Dark', hex: '#2D3AF0', description: 'Dark blue' },
      ]
    },
    {
      name: 'Extended',
      colors: [
        { name: 'Coral', hex: '#FF6968', description: 'Coral accent' },
        { name: 'Purple', hex: '#9D4EDD', description: 'Purple accent' },
        { name: 'Green', hex: '#00D084', description: 'Success' },
        { name: 'Yellow', hex: '#FFBF00', description: 'Warning' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Gray 900', hex: '#1A1A1A', description: 'Text primary' },
        { name: 'Gray 700', hex: '#404040', description: 'Text secondary' },
        { name: 'Gray 500', hex: '#6B6B6B', description: 'Muted' },
        { name: 'Gray 300', hex: '#D4D4D4', description: 'Border' },
        { name: 'Gray 100', hex: '#F4F4F5', description: 'Background' },
      ]
    }
  ]
};

// Framer Design
const FRAMER: BrandPalette = {
  id: 'framer',
  name: 'Framer Design',
  company: 'Framer',
  description: 'Framer\'s sleek design system for interactive prototyping and websites.',
  website: 'https://framer.com',
  tags: ['Prototyping', 'Motion', 'Modern'],
  categories: [
    {
      name: 'Brand',
      colors: [
        { name: 'Framer Blue', hex: '#0099FF', description: 'Primary brand blue' },
        { name: 'Framer Purple', hex: '#8855FF', description: 'Brand purple' },
        { name: 'Framer Pink', hex: '#FF0066', description: 'Brand pink' },
      ]
    },
    {
      name: 'Gradient',
      colors: [
        { name: 'Gradient Start', hex: '#0055FF', description: 'Gradient start' },
        { name: 'Gradient Mid', hex: '#8855FF', description: 'Gradient middle' },
        { name: 'Gradient End', hex: '#FF0088', description: 'Gradient end' },
      ]
    },
    {
      name: 'Neutral',
      colors: [
        { name: 'Black', hex: '#000000', description: 'Background dark' },
        { name: 'Gray 900', hex: '#111111', description: 'Surface dark' },
        { name: 'Gray 700', hex: '#333333', description: 'Elevated' },
        { name: 'Gray 500', hex: '#666666', description: 'Muted' },
        { name: 'Gray 300', hex: '#999999', description: 'Secondary text' },
        { name: 'White', hex: '#FFFFFF', description: 'Text/Background light' },
      ]
    }
  ]
};

// Export all brand palettes
export const BRAND_PALETTES: BrandPalette[] = [
  GOOGLE_MATERIAL,
  APPLE_HIG,
  IBM_CARBON,
  MICROSOFT_FLUENT,
  ATLASSIAN,
  TAILWIND,
  ADOBE_SPECTRUM,
  GITHUB_PRIMER,
  ANT_DESIGN,
  SHOPIFY_POLARIS,
  STRIPE,
  SPOTIFY,
  SLACK,
  DISCORD,
  LINEAR,
  NOTION,
  VERCEL,
  TWITTER,
  META,
  AIRBNB,
  UBER,
  CHAKRA_UI,
  NETFLIX,
  PINTEREST,
  TWITCH,
  FIGMA,
  BOOTSTRAP,
  MUI,
  SALESFORCE,
  YOUTUBE,
  TIKTOK,
  LINKEDIN,
  DRIBBBLE,
  RADIX,
  SUPABASE,
  WEBFLOW,
  FRAMER,
];

// Get all unique tags from brand palettes
export const getAllBrandTags = (): string[] => {
  const tags = new Set<string>();
  BRAND_PALETTES.forEach(brand => {
    brand.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
};
