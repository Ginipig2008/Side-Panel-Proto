export interface FacialDataNode {
    id: string;
    name: string;
    children?: FacialDataNode[];
}

export const facialData: FacialDataNode[] = [
    {
        id: 'f-happy',
        name: 'Happy',
        children: [
            { id: 'f-happy-1', name: 'Smile' },
            { id: 'f-happy-2', name: 'Laugh' },
            { id: 'f-happy-3', name: 'Grin' },
            { id: 'f-happy-4', name: 'Chuckle' },
            { id: 'f-happy-5', name: 'Giggle' },
            { id: 'f-happy-6', name: 'Smirk' },
            { id: 'f-happy-7', name: 'Joy' },
            { id: 'f-happy-8', name: 'Beaming' }
        ]
    },
    {
        id: 'f-sad',
        name: 'Sad',
        children: [
            { id: 'f-sad-1', name: 'Cry' },
            { id: 'f-sad-2', name: 'Frown' },
            { id: 'f-sad-3', name: 'Teary' },
            { id: 'f-sad-4', name: 'Depressed' },
            { id: 'f-sad-5', name: 'Sigh' },
            { id: 'f-sad-6', name: 'Sob' },
            { id: 'f-sad-7', name: 'Gloomy' },
            { id: 'f-sad-8', name: 'Heartbroken' }
        ]
    },
    {
        id: 'f-angry',
        name: 'Angry',
        children: [
            { id: 'f-angry-1', name: 'Furious' },
            { id: 'f-angry-2', name: 'Mad' },
            { id: 'f-angry-3', name: 'Enraged' },
            { id: 'f-angry-4', name: 'Annoyed' },
            { id: 'f-angry-5', name: 'Glare' },
            { id: 'f-angry-6', name: 'Scowl' },
            { id: 'f-angry-7', name: 'Outraged' },
            { id: 'f-angry-8', name: 'Frustrated' }
        ]
    },
    {
        id: 'f-surprised',
        name: 'Surprised',
        children: [
            { id: 'f-sur-1', name: 'Shocked' },
            { id: 'f-sur-2', name: 'Gasp' },
            { id: 'f-sur-3', name: 'Amazed' },
            { id: 'f-sur-4', name: 'Startled' },
            { id: 'f-sur-5', name: 'Astonished' },
            { id: 'f-sur-6', name: 'Wide Eyes' },
            { id: 'f-sur-7', name: 'Speechless' },
            { id: 'f-sur-8', name: 'Awestruck' }
        ]
    },
    {
        id: 'f-fear',
        name: 'Fear',
        children: [
            { id: 'f-fear-1', name: 'Scared' },
            { id: 'f-fear-2', name: 'Terrified' },
            { id: 'f-fear-3', name: 'Panicked' },
            { id: 'f-fear-4', name: 'Horrified' },
            { id: 'f-fear-5', name: 'Trembling' },
            { id: 'f-fear-6', name: 'Anxious' },
            { id: 'f-fear-7', name: 'Nervous' },
            { id: 'f-fear-8', name: 'Petrified' }
        ]
    },
    {
        id: 'f-disgust',
        name: 'Disgust',
        children: [
            { id: 'f-dis-1', name: 'Eww' },
            { id: 'f-dis-2', name: 'Grossed Out' },
            { id: 'f-dis-3', name: 'Repulsed' },
            { id: 'f-dis-4', name: 'Nauseated' },
            { id: 'f-dis-5', name: 'Grimace' },
            { id: 'f-dis-6', name: 'Cringe' },
            { id: 'f-dis-7', name: 'Offended' },
            { id: 'f-dis-8', name: 'Vomit' }
        ]
    },
    {
        id: 'f-neutral',
        name: 'Neutral',
        children: [
            { id: 'f-neu-1', name: 'Calm' },
            { id: 'f-neu-2', name: 'Blank' },
            { id: 'f-neu-3', name: 'Serious' },
            { id: 'f-neu-4', name: 'Bored' },
            { id: 'f-neu-5', name: 'Thinking' },
            { id: 'f-neu-6', name: 'Listening' },
            { id: 'f-neu-7', name: 'Stare' },
            { id: 'f-neu-8', name: 'Relaxed' }
        ]
    },
    {
        id: 'f-special',
        name: 'Special',
        children: [
            { id: 'f-spc-1', name: 'Wink' },
            { id: 'f-spc-2', name: 'Kiss' },
            { id: 'f-spc-3', name: 'Yawn' },
            { id: 'f-spc-4', name: 'Sneeze' },
            { id: 'f-spc-5', name: 'Blink' },
            { id: 'f-spc-6', name: 'Chew' },
            { id: 'f-spc-7', name: 'Whistle' },
            { id: 'f-spc-8', name: 'Puff' }
        ]
    }
];
