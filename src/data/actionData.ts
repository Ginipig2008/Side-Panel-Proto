export interface ActionDataNode {
    id: string;
    name: string;
    children?: ActionDataNode[];
}

const categories = [
    {
        name: 'Daily Actions',
        subs: ['Walking', 'Running', 'Sitting', 'Standing', 'Eating', 'Drinking', 'Reading', 'Sleeping'],
    },
    {
        name: 'Combat',
        subs: ['Melee', 'Ranged', 'Magic', 'Blocking', 'Dodging', 'Getting Hit', 'Death', 'Taunt'],
    },
    {
        name: 'Sports',
        subs: ['Throwing', 'Catching', 'Jumping', 'Kicking', 'Swimming', 'Climbing', 'Gymnastics', 'Lifting'],
    },
    {
        name: 'Dance',
        subs: ['Hip Hop', 'Ballet', 'Salsa', 'Breakdance', 'K-Pop', 'Tango', 'Waltz', 'Freestyle'],
    },
    {
        name: 'Emotions',
        subs: ['Happy', 'Sad', 'Angry', 'Scared', 'Surprised', 'Disgusted', 'Confused', 'In Love'],
    },
    {
        name: 'Reaction',
        subs: ['Flinch', 'Nod', 'Shake Head', 'Shrug', 'Pointing', 'Cheering', 'Crying', 'Laughing'],
    },
    {
        name: 'Enter & Exit',
        subs: ['Walk In', 'Run In', 'Jump In', 'Sneak In', 'Walk Out', 'Run Out', 'Jump Out', 'Sneak Out'],
    },
    {
        name: 'Idle',
        subs: ['Standing Idle', 'Sitting Idle', 'Leaning', 'Waiting', 'Looking Around', 'Checking Phone', 'Stretching', 'Yawning'],
    }
];

// 3rd Depth generator (8 clips per sub-category)
const generateClips = (subName: string, catName: string): ActionDataNode[] => {
    const variations = ['Fast', 'Slow', 'Sad', 'Happy', 'Limp', 'Drunk', 'Cautious', 'Proud'];
    return variations.map((variant, index) => ({
        id: `clip-${catName.replace(/\s+/g, '').toLowerCase()}-${subName.replace(/\s+/g, '').toLowerCase()}-${index + 1}`,
        name: `${subName} ${variant}` // e.g., "Walking Fast", "Walking Slow"
    }));
};

// Map into the final robust 3-depth tree structure
export const actionData: ActionDataNode[] = categories.map((cat, cIdx) => ({
    id: `cat-${cIdx + 1}`,
    name: cat.name,
    children: cat.subs.map((sub, sIdx) => ({
        id: `sub-${cIdx + 1}-${sIdx + 1}`,
        name: sub,
        children: generateClips(sub, cat.name)
    }))
}));
