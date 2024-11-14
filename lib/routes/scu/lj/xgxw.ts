import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/lj/xyxw',
    categories: ['university'],
    example: '/scu/lj/xyxw',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '四川大学文学与新闻学院-学院新闻',
    maintainers: ['AjaxZhan'],
    handler: async () => {
        const baseUrl = 'https://lj.scu.edu.cn';
        const response = await ofetch(`${baseUrl}/xzgl/xyxw.htm`);
        const $ = load(response);

        // 爬取公告列表
        const list = $('li[id^="line_u"]')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const dateText = item.find('font').text().trim();

                return {
                    title: a.attr('title'),
                    link: `${baseUrl}/${a.attr('href')}`,
                    pubDate: parseDate(dateText, 'MM-DD'), // 根据具体格式解析日期
                    description: item.find('p').text(),
                };
            });

        // 获取详细内容
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    // 从公告详情页面选择类名为“v_news_content”的内容
                    item.description = $('.v_news_content').html() + '<hr>' + $('.sMid ul');
                    return item;
                })
            )
        );
        return {
            title: '四川大学文学与新闻学院 - 学院新闻',
            link: `${baseUrl}/xzgl/xyxw.htm`,
            item: items,
        };
    },
};
