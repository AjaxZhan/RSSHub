import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/wchscu/teaching_news',
    categories: ['university'],
    example: '/scu/wchscu/teaching_news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '四川大学华西医院-教学新闻',
    maintainers: ['AjaxZhan'],
    handler: async () => {
        const baseUrl = 'https://www.wchscu.cn';
        const response = await ofetch(`${baseUrl}/public/teaching_news.html`);
        const $ = load(response);

        // 爬取公告列表
        const list = $('div.x-container > div.xwzx3.xsxw1.mg50 > div.x-wrap > div.list > div.item')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('.tit a').first();
                const dateText = item.find('.date1').text().trim();

                return {
                    title: a.text(),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: parseDate(dateText, 'YYYY.MM.DD'), // 根据具体格式解析日期
                    description: item.find('.desc').text().trim() || '无描述信息',
                };
            });

        // 获取详细内容
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    // 从公告详情页面选择类名为“v_news_content”的内容
                    item.description = $('.xxy3').html();
                    return item;
                })
            )
        );
        return {
            title: '四川大学华西医院-教学新闻',
            link: `${baseUrl}/public/teaching_news.html`,
            item: items,
        };
    },
};
