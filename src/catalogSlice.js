import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_PLANTS = [
  {
    id: 'snake-plant',
    name: "Snake Plant",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop",
    description: "Produces oxygen at night, perfect for your bedroom.",
    cost: "$15",
    category: "Air Purifying",
    sunlight: "Indirect Light / Partial Shade",
    water: "Once every 2-3 weeks",
    difficulty: "Beginner",
    size: "12-18 inches tall",
    benefit: "Cleans benzene, formaldehyde, trichloroethylene, xylene, and toluene from the air.",
    rating: 4.8
  },
  {
    id: 'spider-plant',
    name: "Spider Plant",
    image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?q=80&w=600&auto=format&fit=crop",
    description: "Highly effective at filtering indoor air toxins.",
    cost: "$12",
    category: "Air Purifying",
    sunlight: "Bright Indirect Light",
    water: "Once a week",
    difficulty: "Easy",
    size: "8-12 inches tall",
    benefit: "Thrives in humid conditions; safely non-toxic for cats and dogs.",
    rating: 4.5
  },
  {
    id: 'peace-lily',
    name: "Peace Lily",
    image: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=600&auto=format&fit=crop",
    description: "Stunning white blooms that filter harmful chemicals.",
    cost: "$18",
    category: "Air Purifying",
    sunlight: "Low to Medium Light",
    water: "Keep soil damp, mist leaves weekly",
    difficulty: "Medium",
    size: "18-24 inches tall",
    benefit: "Produces beautiful white spathes that signal hydration status clearly.",
    rating: 4.6
  },
  {
    id: 'lavender',
    name: "Lavender",
    image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=600&auto=format&fit=crop",
    description: "Calming scent that reduces stress and improves sleep.",
    cost: "$20",
    category: "Aromatic Fragrant",
    sunlight: "Full Sun (6+ hours daily)",
    water: "Only when soil is completely dry",
    difficulty: "Medium",
    size: "12-16 inches tall",
    benefit: "Releases therapeutic essential oils that naturally induce relaxation.",
    rating: 4.9
  },
  {
    id: 'jasmine',
    name: "Jasmine",
    image: "https://images.unsplash.com/photo-1595165651634-b3b4826f4f6e?q=80&w=600&auto=format&fit=crop",
    description: "Sweet fragrance that uplifts mood and relieves anxiety.",
    cost: "$22",
    category: "Aromatic Fragrant",
    sunlight: "Bright Light, Direct Morning Sun",
    water: "Keep evenly moist but not waterlogged",
    difficulty: "Intermediate",
    size: "24-36 inches (climbing vine)",
    benefit: "Intensely fragrant star-shaped white blossoms that bloom cyclically.",
    rating: 4.7
  },
  {
    id: 'rosemary',
    name: "Rosemary",
    image: "https://images.unsplash.com/photo-1594313080370-fd83905a0d02?q=80&w=600&auto=format&fit=crop",
    description: "Delicious culinary herb with a fresh, piney aroma.",
    cost: "$10",
    category: "Aromatic Fragrant",
    sunlight: "Full, Direct Sun",
    water: "Low water requirements; drought-tolerant",
    difficulty: "Easy",
    size: "10-15 inches tall",
    benefit: "Double-duty garden herb: perfect for roast recipes and repelling insects.",
    rating: 4.4
  },
  {
    id: 'aloe-vera',
    name: "Aloe Vera",
    image: "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?q=80&w=600&auto=format&fit=crop",
    description: "Requires very little watering; contains soothing gel.",
    cost: "$14",
    category: "Low Maintenance",
    sunlight: "Bright Indirect Sunlight",
    water: "Once every 3 weeks",
    difficulty: "Beginner",
    size: "10-14 inches tall",
    benefit: "Gel can be harvested to naturally treat minor kitchen burns and skin dryness.",
    rating: 4.8
  },
  {
    id: 'cast-iron-plant',
    name: "Cast Iron Plant",
    image: "https://images.unsplash.com/photo-1597055181300-e3633a207518?q=80&w=600&auto=format&fit=crop",
    description: "Extremely hardy, thrives in low light and neglect.",
    cost: "$25",
    category: "Low Maintenance",
    sunlight: "Low light to Deep Shade",
    water: "Allow soil to dry fully between waterings",
    difficulty: "Beginner",
    size: "20-28 inches tall",
    benefit: "Famous for survival in extreme drafts, poor soil quality, and low light.",
    rating: 4.3
  },
  {
    id: 'zz-plant',
    name: "ZZ Plant",
    image: "https://images.unsplash.com/photo-1632207691143-643c2a9a9361?q=80&w=600&auto=format&fit=crop",
    description: "Waxy, shiny leaves that store water for dry periods.",
    cost: "$19",
    category: "Low Maintenance",
    sunlight: "Low to Bright Indirect Light",
    water: "Once a month (highly drought-tolerant)",
    difficulty: "Beginner",
    size: "18-24 inches tall",
    benefit: "Stores moisture in underground rhizomes, making it perfect for travelers.",
    rating: 4.7
  }
];

const loadInitialCatalog = () => {
  try {
    const savedCatalog = localStorage.getItem('ep_catalog');
    if (savedCatalog) {
      const parsed = JSON.parse(savedCatalog);
      // If it contains the old broken Unsplash links, force-overwrite with updated plant photos
      const hasOldBrokenImages = parsed.some(item => 
        item.image && (
          item.image.includes('photo-1509440159596-0249088772ff') || // bread
          item.image.includes('photo-1528183429752-a97d0bf99b5a') || // japan forest path for lavender
          item.image.includes('photo-1508780709619-79562169bc51') || // desk cup/notebook for jasmine
          item.image.includes('photo-1614594975525-e45190c55d0b')    // green render tubes for cast iron
        )
      );
      if (!hasOldBrokenImages) {
        return parsed;
      }
    }
    localStorage.setItem('ep_catalog', JSON.stringify(DEFAULT_PLANTS));
    return DEFAULT_PLANTS;
  } catch (error) {
    console.error('Failed to load catalog from localStorage:', error);
    return DEFAULT_PLANTS;
  }
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    items: loadInitialCatalog(),
  },
  reducers: {
    addProduct: (state, action) => {
      const newProduct = {
        ...action.payload,
        id: action.payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        rating: action.payload.rating || 5.0,
      };
      state.items.push(newProduct);
      localStorage.setItem('ep_catalog', JSON.stringify(state.items));
    },
    updateProduct: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
        localStorage.setItem('ep_catalog', JSON.stringify(state.items));
      }
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem('ep_catalog', JSON.stringify(state.items));
    },
    resetCatalog: (state) => {
      state.items = DEFAULT_PLANTS;
      localStorage.setItem('ep_catalog', JSON.stringify(DEFAULT_PLANTS));
    }
  }
});

export const { addProduct, updateProduct, deleteProduct, resetCatalog } = catalogSlice.actions;
export default catalogSlice.reducer;
