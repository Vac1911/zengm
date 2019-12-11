import PropTypes from "prop-types";
import React, { useState } from "react";
import { RecordAndPlayoffs, RosterComposition } from "../../components";
import { helpers } from "../../util";
import InstructionsAndSortButtons from "./InstructionsAndSortButtons";

const fontSizeLarger = { fontSize: "larger" };

const TeamRating = ({ ovr, ovrCurrent }) => {
	const [showCurrent, setShowCurrent] = useState(true);

	if (ovr === ovrCurrent) {
		return `${ovr}/100`;
	}

	const title = showCurrent
		? "Current rating, including injuries"
		: "Rating when healthy";
	const rating = showCurrent ? ovrCurrent : ovr;
	const className = showCurrent ? "text-danger" : null;

	return (
		<>
			<a
				className="cursor-pointer"
				title={title}
				onClick={() => setShowCurrent(!showCurrent)}
			>
				<span className={className}>{rating}</span>/100
			</a>
		</>
	);
};

TeamRating.propTypes = {
	ovr: PropTypes.number.isRequired,
	ovrCurrent: PropTypes.number.isRequired,
};

const TopStuff = ({
	abbrev,
	budget,
	currentSeason,
	editable,
	numConfs,
	numPlayoffRounds,
	openRosterSpots,
	payroll,
	players,
	profit,
	salaryCap,
	season,
	showTradeFor,
	t,
}) => {
	const logoStyle = {};
	if (t.imgURL) {
		logoStyle.display = "inline";
		logoStyle.backgroundImage = `url('${t.imgURL}')`;
	}

	const recordAndPlayoffs =
		t.seasonAttrs !== undefined ? (
			<>
				Record:{" "}
				<RecordAndPlayoffs
					abbrev={abbrev}
					season={season}
					won={t.seasonAttrs.won}
					lost={t.seasonAttrs.lost}
					tied={t.seasonAttrs.tied}
					playoffRoundsWon={t.seasonAttrs.playoffRoundsWon}
					option="noSeason"
					numConfs={numConfs}
					numPlayoffRounds={numPlayoffRounds}
				/>
			</>
		) : (
			"Season not found"
		);

	return (
		<>
			<div className="d-flex mb-3">
				<div className="team-picture" style={logoStyle} />
				<div>
					<div style={fontSizeLarger}>
						{recordAndPlayoffs}
						<br />
						Team rating: <TeamRating ovr={t.ovr} ovrCurrent={t.ovrCurrent} />
					</div>

					{season === currentSeason || process.env.SPORT === "football" ? (
						<div className="d-flex mt-3">
							{season === currentSeason ? (
								<div>
									{openRosterSpots} open roster spots
									<br />
									Payroll: {helpers.formatCurrency(payroll, "M")}
									<br />
									Salary cap: {helpers.formatCurrency(salaryCap, "M")}
									<br />
									{budget ? (
										<>
											Profit: {helpers.formatCurrency(profit, "M")}
											<br />
										</>
									) : null}
									{showTradeFor ? `Strategy: ${t.strategy}` : null}
								</div>
							) : null}
							{process.env.SPORT === "football" ? (
								<RosterComposition className="ml-3" players={players} />
							) : null}
						</div>
					) : null}
				</div>
			</div>
			<InstructionsAndSortButtons editable={editable} tid={t.tid} />
			{season !== currentSeason ? (
				<p>
					Players in the Hall of Fame are{" "}
					<span className="text-danger">highlighted in red</span>.
				</p>
			) : null}
		</>
	);
};

TopStuff.propTypes = {
	abbrev: PropTypes.string.isRequired,
	budget: PropTypes.bool.isRequired,
	currentSeason: PropTypes.number.isRequired,
	editable: PropTypes.bool.isRequired,
	numConfs: PropTypes.number.isRequired,
	numPlayoffRounds: PropTypes.number.isRequired,
	openRosterSpots: PropTypes.number.isRequired,
	payroll: PropTypes.number,
	players: PropTypes.arrayOf(PropTypes.object).isRequired,
	profit: PropTypes.number.isRequired,
	salaryCap: PropTypes.number.isRequired,
	season: PropTypes.number.isRequired,
	showTradeFor: PropTypes.bool.isRequired,
	t: PropTypes.object.isRequired,
};

export default TopStuff;
