// import minimongo from "minimongo";
//
// const IndexedDb = minimongo.IndexedDb;
// const mdb = new IndexedDb({namespace: "local1"});
// mdb.addCollection('players');
//
// const query = mdb.players.find({});
// console.log(query);
//
// query.fetch((res) => console.log(res));
//

import type { idb } from "./index";
import type { StoreNames } from "idb/src/entry";
import type { LeagueDB } from "./connectLeague";
import { compileDocumentSelector } from "minimongo/src/selector";

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
}

export default MiniDb;
