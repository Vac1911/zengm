import type { MouseEvent } from "react";
import PlayerNameLabels from "./PlayerNameLabels";
import { helpers } from "../util";
import { isSport } from "../../common";

const width100 = {
	width: "100%",
};

const BoxScoreRow = ({
	className,
	highlightCols,
	onClick,
	p,
	stats,
	seasonStats,
}: {
	className?: string;
	highlightCols?: number[];
	onClick?: (event: MouseEvent) => void;
	p: any;
	stats: string[];
	seasonStats?: string[];
}) => {
	return (
		<tr className={className} onClick={onClick}>
			<td>{isSport("baseball") && !p.gs && p.pos !== "P" ? null : p.pos}</td>
			<td style={width100}>
				<PlayerNameLabels
					injury={p.injury}
					jerseyNumber={p.jerseyNumber}
					pid={p.pid}
					skills={p.skills}
					legacyName={p.name}
				/>
				{isSport("baseball") ? (
					p.w > 0 ? (
						<span className="text-success ms-2">
							W ({p.seasonStats.w}-{p.seasonStats.l})
						</span>
					) : p.l > 0 ? (
						<span className="text-danger ms-2">
							L ({p.seasonStats.w}-{p.seasonStats.l})
						</span>
					) : p.sv > 0 ? (
						<span className="ms-2">SV ({p.seasonStats.sv + 1})</span>
					) : null
				) : null}
			</td>
			{stats.map((stat, i) => (
				<td
					key={stat}
					className={
						highlightCols?.includes(i) ? "sorting_highlight" : undefined
					}
				>
					{helpers.roundStat(p.processed[stat], stat, true)}
				</td>
			))}
			{seasonStats
				? seasonStats.map((stat, i) => (
						<td
							key={stat}
							className={
								highlightCols?.includes(i) ? "sorting_highlight" : undefined
							}
						>
							{helpers.roundStat(p.seasonStats[stat], stat, true)}
						</td>
				  ))
				: null}
		</tr>
	);
};

export default BoxScoreRow;
