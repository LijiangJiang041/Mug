import type { Intent } from './intentMap';

const DEEPSEEK_API_KEY = 'sk-69dd17681ab240848d46ad0e9aa49ce2';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

const SYSTEM_PROMPT =
    'You are an intent classifier. Given a user message, respond with ONLY one of these exact labels (no punctuation, no other text):\n' +
    'greeting\ncomplain\nprocrastinate\nask_help\npraise\nrandom\n\n' +
    'greeting = hello/hi/hey type messages\n' +
    'complain = expressing frustration or complaints\n' +
    'procrastinate = asking for a break or avoiding work\n' +
    'ask_help = requesting advice or assistance\n' +
    'praise = complimenting or expressing happiness\n' +
    'random = anything else\n' +
    'Respond with only the single label word.';

const VALID_INTENTS: Intent[] = [
    'greeting',
    'complain',
    'procrastinate',
    'ask_help',
    'praise',
    'random',
];

export function detectIntent(text: string): Promise<Intent> {
    return new Promise(resolve => {
        wx.request({
            url: DEEPSEEK_URL,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            },
            data: {
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: text },
                ],
                max_tokens: 10,
                temperature: 0,
            },
            success(res) {
                try {
                    const raw = res.data as {
                        choices: Array<{ message: { content: string } }>;
                    };
                    const content = raw.choices[0].message.content
                        .trim()
                        .toLowerCase();
                    const matched = VALID_INTENTS.find(i =>
                        content.includes(i),
                    );
                    resolve(matched ?? 'random');
                } catch {
                    resolve('random');
                }
            },
            fail() {
                resolve('random');
            },
        });
    });
}
