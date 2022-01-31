import type { IDBPDatabase } from "idb";
import Cache from "./Cache";
import connectLeague, { LeagueDB } from "./connectLeague";
import connectMeta, { MetaDB } from "./connectMeta";
import * as getCopies from "./getCopies";
import * as getCopy from "./getCopy";
import MiniDb from "./miniDb";

const idb: {
	cache: Cache;
	getCopies: typeof getCopies;
	getCopy: typeof getCopy;
	league: IDBPDatabase<LeagueDB>;
	meta: IDBPDatabase<MetaDB>;
} = {
	cache: new Cache(),
	getCopies,
	getCopy,
	// @ts-expect-error
	league: undefined,
	// @ts-expect-error
	meta: undefined,
};

const mdb = new MiniDb(idb);

export { Cache, connectLeague, connectMeta, idb, mdb };
export { default as getAll } from "./getAll";
export { default as iterate } from "./iterate";
export { default as reset } from "./reset";
