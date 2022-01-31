import { idb } from "./index";
import type { StoreNames } from "idb/src/entry";
import type { LeagueDB } from "./connectLeague";
import { compileDocumentSelector } from "minimongo/src/selector";
import { helpers } from "../util";
import type { GetCopyType } from "../../common/types";
import { unwrap } from "idb";
import { mergeByPk } from "./getCopies/helpers";

class MiniDb {
	private _idb: typeof idb;

	constructor(db: typeof idb) {
		this._idb = db;
	}

	async find(storeName: StoreNames<LeagueDB>, selector: any) {
		const store = this._idb.league
			.transaction(storeName)
			.objectStore(storeName);
		const documents = await store.getAll();
		return documents.filter(compileDocumentSelector(selector));
	}

	async findOne(storeName: StoreNames<LeagueDB>, selector: any) {
		const results = await this.find(storeName, selector);
		return results.length > 0 ? results[0] : null;
	}

	async get(
		storeName: StoreNames<LeagueDB>,
		ids: number | number[],
		type?: GetCopyType,
	) {
		if (!Array.isArray(ids)) {
			return await this.getByPk(storeName, ids, type);
		} else if (ids.length === 1) {
			return await this.getByPk(storeName, ids[0], type);
		} else {
			return await this.getByPks(storeName, ids, type);
		}
	}

	protected async getByPk(
		storeName: StoreNames<LeagueDB>,
		id: number,
		type?: GetCopyType,
	) {
		// @ts-ignore
		const doc = await this._idb.cache[storeName].get(id);
		if (doc) {
			return [type === "noCopyCache" ? doc : await helpers.deepCopy(doc)];
		}

		const doc2 = await idb.league.get(storeName, id);
		if (doc2) {
			return [doc2];
		}

		return [];
	}

	protected async getByPks(
		storeName: StoreNames<LeagueDB>,
		ids: number[],
		type?: GetCopyType,
	) {
		if (ids.length === 0) {
			return [];
		}
		const pkName = this._idb.cache.storeInfos[storeName].pk;
		const sortedIds = [...ids].sort((a, b) => a - b);
		const fromDB = await new Promise<any[]>((resolve, reject) => {
			const transaction = idb.league.transaction(storeName);

			const records: any[] = [];

			// Because backboard doesn't support passing an argument to cursor.continue
			const objectStore = unwrap(transaction.objectStore(storeName));
			const range = IDBKeyRange.bound(sortedIds[0], sortedIds.at(-1));
			let i = 0;
			const request = objectStore.openCursor(range);

			request.onerror = (e: any) => {
				reject(e.target.error);
			};

			request.onsuccess = (e: any) => {
				const cursor = e.target.result;

				if (!cursor) {
					resolve(records);
					return;
				}

				const d = cursor.value;

				// https://gist.github.com/inexorabletash/704e9688f99ac12dd336
				if (sortedIds.includes(d.pid)) {
					records.push(d);
				}

				i += 1;

				if (i > sortedIds.length) {
					resolve(records);
					return;
				}

				cursor.continue(sortedIds[i]);
			};
		});

		const merged = mergeByPk(
			fromDB,
			(await idb.cache[storeName].getAll()).filter(p =>
				ids.includes(p[pkName]),
			),
			storeName,
			type,
		);

		const sorted = [];
		for (const id of ids) {
			const p = merged.find(p2 => p2[pkName] === id);
			if (p) {
				sorted.push(p);
			}
		}

		return sorted;
	}

	async runTest() {
		const currentPerformance =
			[
				await this.test(),
				await this.test(),
				await this.test(),
				await this.test(),
				await this.test(),
			].reduce((a, b) => a + b, 0) / 5;

		console.log("Current Performance", currentPerformance);

		const miniPerformance =
			[
				await this.testMini(),
				await this.testMini(),
				await this.testMini(),
				await this.testMini(),
				await this.testMini(),
			].reduce((a, b) => a + b, 0) / 5;

		console.log("Mini Performance", miniPerformance);
	}

	async test() {
		const start = performance.now();
		await this._idb.getCopies.players({ activeSeason: 2022 });
		return performance.now() - start;
	}

	async testMini() {
		const start = performance.now();
		await this.find("players", { activeSeason: 2022 });
		return performance.now() - start;
	}
}

export default MiniDb;
