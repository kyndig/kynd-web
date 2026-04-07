import { WebClient } from '@slack/web-api';
import { defineAction } from 'astro:actions';
import { SLACK_TOKEN, SLACK_CHANNEL_ID } from 'astro:env/server';
import { z } from 'astro/zod';

const web = new WebClient(SLACK_TOKEN);

export const contactUs = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().optional(),
    email: z.email('Ugyldig e-post'),
    message: z.string(),
  }),
  handler: async (input) => {
    await web.chat.postMessage({
      channel: SLACK_CHANNEL_ID,
      text: `<!channel>\n${input.name ? `Navn: ${input.name}\n` : ''}Email: ${input.email}\nMessage: ${input.message}`,
    });
  },
});
