import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/scu/jwc',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '四川大学教务处通知',
    maintainers: ['AjaxZhan'],
    handler: async () => {
        const baseUrl = 'https://jwc.scu.edu.cn';
        const response = await ofetch(`${baseUrl}/tzgg.htm`);
        const $ = load(response);

        // 爬取公告列表
        const list = $('div.ny-main > div.ny > div.tz-list > ul > li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const dateText = item.find('.date').text().trim().replaceAll(/\s+/g, ' ');

                return {
                    title: item.find('.text > p').text(),
                    link: `${baseUrl}/${a.attr('href')}`,
                    pubDate: parseDate(dateText, 'MM/DD YYYY'), // 根据具体格式解析日期
                    description: '查看公告详情',
                };
            });

        // 获取详细内容
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    // 从公告详情页面选择类名为“v_news_content”的内容
                    item.description = $('.v_news_content').html() + `<hr>` + $('.fjxz').html();
                    return item;
                })
            )
        );
        return {
            title: '四川大学教务处 - 最新公告',
            link: `${baseUrl}/tzgg.htm`,
            item: items,
        };
    },
};
