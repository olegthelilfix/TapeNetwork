import { HTTPClient, HTTPClient1, HTTPClient2 } from '../client/client';
import {
	articleControllerController,
	ArticleControllerController,
	ArticleControllerController1,
	ArticleControllerController2,
} from './ArticleControllerController';
import {
	catalogControllerController,
	CatalogControllerController,
	CatalogControllerController1,
	CatalogControllerController2,
} from './CatalogControllerController';
import {
	healthControllerController,
	HealthControllerController,
	HealthControllerController1,
	HealthControllerController2,
} from './HealthControllerController';
import {
	homeControllerController,
	HomeControllerController,
	HomeControllerController1,
	HomeControllerController2,
} from './HomeControllerController';
import {
	scheduleControllerController,
	ScheduleControllerController,
	ScheduleControllerController1,
	ScheduleControllerController2,
} from './ScheduleControllerController';
import {
	searchControllerController,
	SearchControllerController,
	SearchControllerController1,
	SearchControllerController2,
} from './SearchControllerController';
import {
	showControllerController,
	ShowControllerController,
	ShowControllerController1,
	ShowControllerController2,
} from './ShowControllerController';
import {
	sitemapControllerController,
	SitemapControllerController,
	SitemapControllerController1,
	SitemapControllerController2,
} from './SitemapControllerController';
import {
	tickerControllerController,
	TickerControllerController,
	TickerControllerController1,
	TickerControllerController2,
} from './TickerControllerController';
import {
	watchControllerController,
	WatchControllerController,
	WatchControllerController1,
	WatchControllerController2,
} from './WatchControllerController';
import { URIS, URIS2 } from 'fp-ts/lib/HKT';

export interface Controllers<F> {
	articleControllerController: ArticleControllerController<F>;
	catalogControllerController: CatalogControllerController<F>;
	healthControllerController: HealthControllerController<F>;
	homeControllerController: HomeControllerController<F>;
	scheduleControllerController: ScheduleControllerController<F>;
	searchControllerController: SearchControllerController<F>;
	showControllerController: ShowControllerController<F>;
	sitemapControllerController: SitemapControllerController<F>;
	tickerControllerController: TickerControllerController<F>;
	watchControllerController: WatchControllerController<F>;
}
export interface Controllers1<F extends URIS> {
	articleControllerController: ArticleControllerController1<F>;
	catalogControllerController: CatalogControllerController1<F>;
	healthControllerController: HealthControllerController1<F>;
	homeControllerController: HomeControllerController1<F>;
	scheduleControllerController: ScheduleControllerController1<F>;
	searchControllerController: SearchControllerController1<F>;
	showControllerController: ShowControllerController1<F>;
	sitemapControllerController: SitemapControllerController1<F>;
	tickerControllerController: TickerControllerController1<F>;
	watchControllerController: WatchControllerController1<F>;
}
export interface Controllers2<F extends URIS2> {
	articleControllerController: ArticleControllerController2<F>;
	catalogControllerController: CatalogControllerController2<F>;
	healthControllerController: HealthControllerController2<F>;
	homeControllerController: HomeControllerController2<F>;
	scheduleControllerController: ScheduleControllerController2<F>;
	searchControllerController: SearchControllerController2<F>;
	showControllerController: ShowControllerController2<F>;
	sitemapControllerController: SitemapControllerController2<F>;
	tickerControllerController: TickerControllerController2<F>;
	watchControllerController: WatchControllerController2<F>;
}

export function controllers<F extends URIS2>(e: { httpClient: HTTPClient2<F> }): Controllers2<F>;
export function controllers<F extends URIS>(e: { httpClient: HTTPClient1<F> }): Controllers1<F>;
export function controllers<F>(e: { httpClient: HTTPClient<F> }): Controllers<F>;
export function controllers<F>(e: { httpClient: HTTPClient<F> }): Controllers<F> {
	return {
		articleControllerController: articleControllerController(e),
		catalogControllerController: catalogControllerController(e),
		healthControllerController: healthControllerController(e),
		homeControllerController: homeControllerController(e),
		scheduleControllerController: scheduleControllerController(e),
		searchControllerController: searchControllerController(e),
		showControllerController: showControllerController(e),
		sitemapControllerController: sitemapControllerController(e),
		tickerControllerController: tickerControllerController(e),
		watchControllerController: watchControllerController(e),
	};
}
