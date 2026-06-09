import type { MugMood } from './stateManager';

export type Intent =
    | 'greeting'
    | 'complain'
    | 'procrastinate'
    | 'ask_help'
    | 'praise'
    | 'random'
    | 'tap';

type ResponseMap = {
    [mood in MugMood]: {
        [intent in Intent]?: string[];
    };
};

const responses: ResponseMap = {
    neutral: {
        tap: ['*sips coffee*', 'Hmm?', '...', '*stares blankly*'],
        greeting: ['Hey.', 'Oh, hi.', 'Hello there.'],
        complain: [
            'I hear you...',
            'Yeah, work is tough.',
            'At least you have coffee.',
        ],
        procrastinate: [
            'Maybe get back to it?',
            "The timer won't start itself.",
            'One more minute...',
        ],
        ask_help: [
            'Try breaking it into smaller tasks.',
            'Have you tried turning it off and on?',
            'Coffee helps.',
        ],
        praise: ['Thanks, I guess.', 'Not bad yourself.', ':)'],
        random: ['...', '*steam rises*', 'So, anyway...'],
    },
    happy: {
        tap: ['*happy gurgle*', "You're doing great!", '☕✨', 'Keep it up!'],
        greeting: [
            'Hey superstar!',
            "Look who's crushing it!",
            'Hi there, champ!',
        ],
        complain: [
            "You've been so productive though!",
            'Even stars have off days.',
            'You still did amazing today!',
        ],
        procrastinate: [
            "You've earned a break!",
            'Rest is part of the process.',
            'You can afford a breather.',
        ],
        ask_help: [
            "You got this! You've handled harder things.",
            "Break it down, you're on a roll!",
            "Just start — you're in the zone.",
        ],
        praise: [
            'Aww thanks! ☕',
            "You're making me blush!",
            'We make a great team!',
        ],
        random: [
            'Life is good!',
            '*cheerful bubbling*',
            'Today was a great day!',
        ],
    },
    flustered: {
        tap: [
            "Hey... it's been a while.",
            'You okay?',
            'Time to get back to it?',
            '*nervous steam*',
        ],
        greeting: [
            "Oh! You're back?",
            'Hey... thought you forgot about me.',
            'Finally!',
        ],
        complain: [
            "I get it, but you haven't worked in 30 min...",
            "Venting is fine, but then let's work!",
            'Channel that energy!',
        ],
        procrastinate: [
            'Come on, just start the timer!',
            'Every minute counts!',
            "We're falling behind...",
        ],
        ask_help: [
            'Focus! Start with the smallest task.',
            'Pick ONE thing and do it.',
            'Stop planning, start doing!',
        ],
        praise: [
            'Thanks... now get back to work!',
            'Appreciated, now start the timer!',
            "Nice, now let's go!",
        ],
        random: ['*anxious bubbling*', 'Tick tock...', 'The clock is ticking!'],
    },
    angry: {
        tap: ["DON'T touch me.", '*fuming*', 'Seriously?!', '...'],
        greeting: ['What do YOU want.', "Oh. It's you.", '*cold stare*'],
        complain: [
            'You did this to yourself.',
            'Maybe work instead of complaining?',
            "I don't want to hear it.",
        ],
        procrastinate: [
            'This is EXACTLY the problem.',
            'WORK. NOW.',
            'No more excuses.',
        ],
        ask_help: [
            'Figure it out.',
            "Maybe if you worked more, you'd know.",
            'The answer is: do your tasks.',
        ],
        praise: [
            'Too little, too late.',
            "Don't sweet-talk me.",
            '*looks away*',
        ],
        random: ['...', '*angry steam*', 'Just... do something.'],
    },
};

export function getResponse(mood: MugMood, intent: Intent): string {
    const moodMap = responses[mood];
    const list = moodMap[intent] ?? moodMap['random'] ?? ['...'];
    return list[Math.floor(Math.random() * list.length)];
}
