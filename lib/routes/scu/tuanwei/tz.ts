import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
// import { load } from 'cheerio';
// import cache from '@/utils/cache';
// import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tuanwei',
    categories: ['university'],
    example: '/scu/tuanwei',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '青春川大-通知公告',
    maintainers: ['AjaxZhan'],
    handler: async () => {
        // const baseUrl = '';
        const response = await ofetch(`http://localhost:8000/get_tuanwei_rss`);
        return response;
    },
};
