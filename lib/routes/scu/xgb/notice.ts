import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/xgb',
    categories: ['university'],
    example: '/scu/xgb',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '四川大学学工部通知',
    maintainers: ['AjaxZhan'],
    handler: async () => {
        const baseUrl = 'https://xgb.scu.edu.cn';
        const response = await ofetch(`${baseUrl}/index/tzgg.htm`);
        const $ = load(response);

        // 爬取公告列表
        const list = $('div.listContent > div.main-box > ul > li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const dateText = `${item.find('.year-month').text()}-${item.find('.date').text().trim()}`;

                return {
                    title: item.find('.title').text(),
                    link: `${baseUrl}/${a.attr('href')}`,
                    pubDate: parseDate(dateText, 'YYYY-MM-DD'), // 根据具体格式解析日期
                    description: item.find('.content').text(),
                };
            });

        // 获取详细内容
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    // 从公告详情页面选择类名为“v_news_content”的内容
                    item.description = $('.v_news_content').html();
                    return item;
                })
            )
        );
        return {
            title: '四川大学学工部 - 最新公告',
            link: `${baseUrl}/tzgg.htm`,
            item: items,
        };
    },
};
