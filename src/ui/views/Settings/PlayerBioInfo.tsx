import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Dropdown, Modal } from "react-bootstrap";
import type { PlayerBioInfo, Race, ThenArg } from "../../../common/types";
import {
	confirm,
	downloadFile,
	helpers,
	logEvent,
	resetFileInput,
	toWorker,
} from "../../util";
import { godModeRequiredMessage } from "./SettingsForm";
import classNames from "classnames";
import { animation } from "./Injuries";
import type { initDefaults } from "../../../worker/util/loadNames";
import { getFrequencies, mergeCountries } from "../../../common/names";
import isEqual from "lodash-es/isEqual";
import orderBy from "lodash-es/orderBy";
import { RacesEditor } from "./PlayerBioInfoEditors";
import { CountriesEditor } from "./PlayerBioInfoCountries";

export type Defaults = ThenArg<ReturnType<typeof initDefaults>>;

export const objectToArray = <T extends string>(
	object: Record<string, number>,
	key: T,
	sortKey: string,
	order?: "asc" | "desc",
): Record<T | "frequency", string>[] =>
	orderBy(
		Object.entries(object).map(
			([name, frequency]) =>
				({
					[key]: name,
					frequency: String(frequency),
				} as Record<T | "frequency", string>),
		),
		sortKey,
		order,
	);

export const formatPlayerBioInfoState = (
	playerBioInfo: PlayerBioInfo | undefined,
	defaults: Defaults | undefined,
) => {
	if (defaults === undefined) {
		return {
			defaultRaces: [],
			defaultColleges: [],
			countries: [],
		};
	}

	const mergedCountries = mergeCountries(
		playerBioInfo,
		defaults.namesCountries,
		defaults.namesGroups,
		defaults.groups,
	);

	// also get back frequencies, in case not defined in playerBioInfo
	const frequencies = getFrequencies(playerBioInfo, defaults.countries);

	const countries = [];

	const defaultColleges2 =
		playerBioInfo?.default?.colleges ?? defaults.colleges;

	for (const [country, frequency] of Object.entries(frequencies)) {
		const mergedCountry = mergedCountries[country];
		if (!mergedCountry) {
			continue;
		}

		const names = {
			first: mergedCountry.first ?? {},
			last: mergedCountry.last ?? {},
		};
		const builtIn = !!defaults.countries[country];
		let defaultNames = false;
		if (builtIn) {
			let fromGroup;
			for (const [group, countries] of Object.entries(defaults.groups)) {
				if (countries.includes(country)) {
					fromGroup = group;
					break;
				}
			}

			let namesCountry;
			if (fromGroup) {
				namesCountry = defaults.namesGroups[fromGroup];
			} else if (defaults.namesCountries[country]) {
				namesCountry = defaults.namesCountries[country];
			}

			if (namesCountry) {
				defaultNames =
					builtIn &&
					isEqual(names.first, namesCountry.first) &&
					isEqual(names.last, namesCountry.last);
			}
		}

		const namesText: Record<
			"first" | "last",
			{
				name: string;
				frequency: string;
			}[]
		> = {
			first: [],
			last: [],
		};
		for (const key of ["first", "last"] as const) {
			namesText[key] = objectToArray(names[key], "name", "frequency", "desc");
		}

		const colleges = mergedCountry.colleges ?? defaultColleges2;
		const defaultColleges = isEqual(colleges, defaultColleges2);
		const collegesText = objectToArray(colleges, "name", "name");

		const defaultRaces2 =
			defaults.races[country] ??
			playerBioInfo?.default?.races ??
			defaults.races.USA;
		const races = mergedCountry.races ?? defaultRaces2;
		const defaultRaces = isEqual(races, defaultRaces2);
		const racesText = objectToArray(races, "race", "race");

		countries.push({
			id: Math.random(),
			country,
			frequency: String(frequency),

			builtIn,

			defaultNames,
			names: namesText,

			defaultColleges,
			colleges: collegesText,

			defaultRaces,
			races: racesText,
		});
	}

	const defaultCollegesText = objectToArray(defaultColleges2, "name", "name");
	const defaultRacesText = objectToArray(
		playerBioInfo?.default?.races ?? defaults.races.USA,
		"race",
		"race",
	);

	return {
		defaultColleges: defaultCollegesText,
		defaultRaces: defaultRacesText,
		countries: orderBy(countries, "country"),
	};
};

export type PlayerBioInfoState = ReturnType<typeof formatPlayerBioInfoState>;

export const isInvalidNumber = (number: number) =>
	Number.isNaN(number) || number <= 0;

const parseAndValidate = (
	playerBioInfoState: PlayerBioInfoState,
): PlayerBioInfo | undefined => {
	const injuries = playerBioInfoState.map(row => ({
		name: row.name,
		frequency: parseFloat(row.frequency),
		games: parseFloat(row.games),
	}));

	for (const row of injuries) {
		if (isInvalidNumber(row.frequency)) {
			throw new Error(
				`Injury "${row.name}" has an invalid frequency - must be a positive number.`,
			);
		}

		if (isInvalidNumber(row.games)) {
			throw new Error(
				`Injury "${row.name}" has an invalid number of games - must be a positive number.`,
			);
		}
	}

	if (injuries.length === 0) {
		throw new Error("You must define at least one type of injury.");
	}

	return injuries;
};

export type PageInfo =
	| {
			name: "countries";
	  }
	| {
			name: "races";
			index: number | "default";
	  };

const PlayerBioInfo2 = ({
	defaultValue,
	disabled,
	godModeRequired,
	onChange,
}: {
	defaultValue: PlayerBioInfo | undefined;
	disabled: boolean;
	godModeRequired?: "always" | "existingLeagueOnly";
	onChange: (injuries: PlayerBioInfo | undefined) => void;
}) => {
	const [show, setShow] = useState(false);
	const [infoState, setInfoStateRaw] = useState<
		PlayerBioInfoState | undefined
	>();
	const [dirty, setDirty] = useState(false);
	const lastSavedState = useRef<PlayerBioInfoState | undefined>();
	const [defaults, setDefaults] = useState<Defaults | undefined>();
	const [pageInfo, setPageInfo] = useState<PageInfo>({
		name: "countries",
	});

	const setInfoState = (
		infoState: PlayerBioInfoState | ((infoState: PlayerBioInfoState) => void),
	) => {
		setInfoStateRaw(infoState as any);
		setDirty(true);
	};

	const loadDefaults = async () => {
		const defaults = await toWorker("main", "getPlayerBioInfoDefaults");
		setDefaults(defaults);
		setInfoStateRaw(formatPlayerBioInfoState(defaultValue, defaults));
	};

	const handleShow = async () => {
		if (!defaults) {
			await loadDefaults();
		}

		setShow(true);
	};

	const handleCancel = async () => {
		if (dirty) {
			const result = await confirm(
				"Are you sure you want to discard all your changes?",
				{
					okText: "Discard",
					cancelText: "Cancel",
				},
			);
			if (!result) {
				return;
			}

			// Reset for next time
			setInfoStateRaw(
				lastSavedState.current ??
					formatPlayerBioInfoState(defaultValue, defaults),
			);
			setDirty(false);
		}

		setShow(false);
	};

	const handleSave = (event: {
		preventDefault: () => void;
		stopPropagation: () => void;
	}) => {
		event.preventDefault();

		// Don't submit parent form
		event.stopPropagation();

		let parsed;
		try {
			parsed = parseAndValidate(infoState);
		} catch (error) {
			logEvent({
				type: "error",
				text: error.message,
				saveToDb: false,
				persistent: true,
			});
			return;
		}

		// Save for next time
		lastSavedState.current = infoState;
		setDirty(false);

		setShow(false);

		onChange(parsed);
	};

	const handleChange =
		(key: "name" | "frequency" | "games", i: number) =>
		(event: ChangeEvent<HTMLInputElement>) => {
			setInfoState(data => ({
				...data,
				countries: data.countries.map((row, j) => {
					if (i !== j) {
						return row;
					}

					return {
						...row,
						[key]: event.target.value,
					};
				}),
			}));
		};

	const handleChange2 =
		(key: "colleges" | "names" | "races", i: number | "default") =>
		(rows: any[]) => {
			const defaultProp = `default${helpers.upperCaseFirstLetter(key)}`;

			if (i === "default") {
				setInfoState(data => ({
					...data,
					[defaultProp]: rows,
					countries: data.countries.map(row => {
						// Skip for races in built-in countries
						if (row.builtIn && key === "races") {
							return row;
						}

						// Apply the new default
						if ((row as any)[defaultProp]) {
							return {
								...row,
								[key]: [...rows],
							};
						}

						return row;
					}),
				}));
			} else {
				setInfoState(data => ({
					...data,
					countries: data.countries.map((row, j) => {
						if (i !== j) {
							return row;
						}

						return {
							...row,
							[key]: rows,
							[defaultProp]: false,
						};
					}),
				}));
			}

			setPageInfo({
				name: "countries",
			});
		};

	const title = disabled ? godModeRequiredMessage(godModeRequired) : undefined;

	let modal = null;
	if (infoState && defaults) {
		let title = "Player Bio Info";
		if (pageInfo.name !== "countries") {
			const countryName =
				pageInfo.index === "default"
					? "Default"
					: infoState.countries[pageInfo.index].country;
			title += ` - ${countryName} - ${helpers.upperCaseFirstLetter(
				pageInfo.name,
			)}`;
		}

		modal = (
			<Modal
				size="lg"
				show={show}
				onHide={handleCancel}
				animation={animation}
				scrollable
			>
				<Modal.Header closeButton>
					<Modal.Title>{title}</Modal.Title>
				</Modal.Header>
				{pageInfo.name === "countries" ? (
					<CountriesEditor
						defaults={defaults}
						handleCancel={handleCancel}
						handleChange={handleChange}
						handleSave={handleSave}
						onSetDefault={(type, i) => {
							const country = infoState.countries[i].country;

							let array: any[];

							if (type === "colleges") {
								console.log(
									`Somehow get default ${type} for ${infoState.countries[i].country}`,
								);
								array = [];
							} else if (type === "races") {
								if (defaults.races[country]) {
									array = objectToArray(
										defaults.races[country],
										"race",
										"race",
									);
								} else {
									array = [...infoState.defaultRaces];
								}
							} else {
								throw new Error("Invalid type");
							}

							setInfoState(data => ({
								...data,
								countries: data.countries.map((row, j) => {
									if (i !== j) {
										return row;
									}

									// Would be better to check if value actually differs from default, but annoying to do since default is an object and state is array of objects. Maybe later, after conversion functions are written for saving.
									const defaultProp = `default${helpers.upperCaseFirstLetter(
										type,
									)}`;

									return {
										...row,
										[type]: array,
										[defaultProp]: true,
									};
								}),
							}));
						}}
						infoState={infoState}
						setInfoState={setInfoState}
						setPageInfo={setPageInfo}
					/>
				) : pageInfo.name === "races" ? (
					<RacesEditor
						defaults={pageInfo.index === "default"}
						races={
							pageInfo.index === "default"
								? infoState.defaultRaces
								: infoState.countries[pageInfo.index].races
						}
						onCancel={() => {
							setPageInfo({
								name: "countries",
							});
						}}
						onSave={handleChange2("races", pageInfo.index)}
					/>
				) : null}
			</Modal>
		);
	}

	return (
		<>
			<button
				className="btn btn-secondary"
				type="button"
				disabled={disabled}
				title={title}
				onClick={handleShow}
			>
				Customize
			</button>

			{modal}
		</>
	);
};

export default PlayerBioInfo2;