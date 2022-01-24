import classNames from "classnames";
import type { CSSProperties } from "react";
import { helpers, useLocal } from "../util";

// https://github.com/lipis/flag-icons/blob/main/country.json with some duplicate names added
const countryCodes: Record<string, string> = {
	Afghanistan: "af",
	"Aland Islands": "ax",
	Albania: "al",
	Algeria: "dz",
	"American Samoa": "as",
	Andorra: "ad",
	Angola: "ao",
	Anguilla: "ai",
	Antarctica: "aq",
	"Antigua and Barbuda": "ag",
	Argentina: "ar",
	Armenia: "am",
	Aruba: "aw",
	Australia: "au",
	Austria: "at",
	Azerbaijan: "az",
	Bahamas: "bs",
	Bahrain: "bh",
	Bangladesh: "bd",
	Barbados: "bb",
	Belarus: "by",
	Belgium: "be",
	Belize: "bz",
	Benin: "bj",
	Bermuda: "bm",
	Bhutan: "bt",
	Bolivia: "bo",
	"Bonaire, Sint Eustatius and Saba": "bq",
	"Bosnia and Herzegovina": "ba",
	Botswana: "bw",
	"Bouvet Island": "bv",
	Brazil: "br",
	"British Indian Ocean Territory": "io",
	"Brunei Darussalam": "bn",
	Bulgaria: "bg",
	"Burkina Faso": "bf",
	Burundi: "bi",
	"Cabo Verde": "cv",
	"Cape Verde": "cv",
	Cambodia: "kh",
	Cameroon: "cm",
	Canada: "ca",
	Catalonia: "es-ct",
	"Cayman Islands": "ky",
	"Central African Republic": "cf",
	Chad: "td",
	Chile: "cl",
	China: "cn",
	"Christmas Island": "cx",
	"Cocos (Keeling) Islands": "cc",
	Colombia: "co",
	Comoros: "km",
	"Cook Islands": "ck",
	"Costa Rica": "cr",
	Croatia: "hr",
	Cuba: "cu",
	Curaçao: "cw",
	Cyprus: "cy",
	"Czech Republic": "cz",
	"Ivory Coast": "ci",
	"Democratic Republic of the Congo": "cd",
	Congo: "cd",
	Denmark: "dk",
	Djibouti: "dj",
	Dominica: "dm",
	"Dominican Republic": "do",
	Ecuador: "ec",
	Egypt: "eg",
	"El Salvador": "sv",
	England: "gb-eng",
	"Equatorial Guinea": "gq",
	Eritrea: "er",
	Estonia: "ee",
	Ethiopia: "et",
	"Falkland Islands": "fk",
	"Faroe Islands": "fo",
	"Federated States of Micronesia": "fm",
	Fiji: "fj",
	Finland: "fi",
	France: "fr",
	"French Guiana": "gf",
	"French Polynesia": "pf",
	"French Southern Territories": "tf",
	Gabon: "ga",
	Galicia: "es-ga",
	Gambia: "gm",
	Georgia: "ge",
	Germany: "de",
	Ghana: "gh",
	Gibraltar: "gi",
	Greece: "gr",
	Greenland: "gl",
	Grenada: "gd",
	Guadeloupe: "gp",
	Guam: "gu",
	Guatemala: "gt",
	Guernsey: "gg",
	Guinea: "gn",
	"Guinea-Bissau": "gw",
	Guyana: "gy",
	Haiti: "ht",
	"Heard Island and McDonald Islands": "hm",
	"Holy See": "va",
	Honduras: "hn",
	"Hong Kong": "hk",
	Hungary: "hu",
	Iceland: "is",
	India: "in",
	Indonesia: "id",
	Iran: "ir",
	Iraq: "iq",
	Ireland: "ie",
	"Isle of Man": "im",
	Israel: "il",
	Italy: "it",
	Jamaica: "jm",
	Japan: "jp",
	Jersey: "je",
	Jordan: "jo",
	Kazakhstan: "kz",
	Kenya: "ke",
	Kiribati: "ki",
	Kosovo: "xk",
	Kuwait: "kw",
	Kyrgyzstan: "kg",
	Laos: "la",
	Latvia: "lv",
	Lebanon: "lb",
	Lesotho: "ls",
	Liberia: "lr",
	Libya: "ly",
	Liechtenstein: "li",
	Lithuania: "lt",
	Luxembourg: "lu",
	Macau: "mo",
	Madagascar: "mg",
	Malawi: "mw",
	Malaysia: "my",
	Maldives: "mv",
	Mali: "ml",
	Malta: "mt",
	"Marshall Islands": "mh",
	Martinique: "mq",
	Mauritania: "mr",
	Mauritius: "mu",
	Mayotte: "yt",
	Mexico: "mx",
	Moldova: "md",
	Monaco: "mc",
	Mongolia: "mn",
	Montenegro: "me",
	Montserrat: "ms",
	Morocco: "ma",
	Mozambique: "mz",
	Myanmar: "mm",
	Namibia: "na",
	Nauru: "nr",
	Nepal: "np",
	Netherlands: "nl",
	"New Caledonia": "nc",
	"New Zealand": "nz",
	Nicaragua: "ni",
	Niger: "ne",
	Nigeria: "ng",
	Niue: "nu",
	"Norfolk Island": "nf",
	"North Korea": "kp",
	"North Macedonia": "mk",
	Macedonia: "mk",
	"Northern Ireland": "gb-nir",
	"Northern Mariana Islands": "mp",
	Norway: "no",
	Oman: "om",
	Pakistan: "pk",
	Palau: "pw",
	Panama: "pa",
	"Papua New Guinea": "pg",
	Paraguay: "py",
	Peru: "pe",
	Philippines: "ph",
	Pitcairn: "pn",
	Poland: "pl",
	Portugal: "pt",
	"Puerto Rico": "pr",
	Qatar: "qa",
	"Republic of the Congo": "cg",
	Romania: "ro",
	Russia: "ru",
	Rwanda: "rw",
	Réunion: "re",
	"Saint Barthélemy": "bl",
	"Saint Helena, Ascension and Tristan da Cunha": "sh",
	"Saint Kitts and Nevis": "kn",
	"Saint Lucia": "lc",
	"Saint Martin": "mf",
	"Saint Pierre and Miquelon": "pm",
	"Saint Vincent and the Grenadines": "vc",
	Samoa: "ws",
	"San Marino": "sm",
	"Sao Tome and Principe": "st",
	"Saudi Arabia": "sa",
	Scotland: "gb-sct",
	Senegal: "sn",
	Serbia: "rs",
	Seychelles: "sc",
	"Sierra Leone": "sl",
	Singapore: "sg",
	"Sint Maarten": "sx",
	Slovakia: "sk",
	Slovenia: "si",
	"Solomon Islands": "sb",
	Somalia: "so",
	"South Africa": "za",
	"South Georgia and the South Sandwich Islands": "gs",
	"South Korea": "kr",
	"South Sudan": "ss",
	Spain: "es",
	"Sri Lanka": "lk",
	"State of Palestine": "ps",
	Palestine: "ps",
	Sudan: "sd",
	Suriname: "sr",
	"Svalbard and Jan Mayen": "sj",
	Swaziland: "sz",
	Sweden: "se",
	Switzerland: "ch",
	"Syrian Arab Republic": "sy",
	Taiwan: "tw",
	Tajikistan: "tj",
	Tanzania: "tz",
	Thailand: "th",
	"Timor-Leste": "tl",
	"East Timor": "tl",
	Togo: "tg",
	Tokelau: "tk",
	Tonga: "to",
	"Trinidad and Tobago": "tt",
	Tunisia: "tn",
	Turkey: "tr",
	Turkmenistan: "tm",
	"Turks and Caicos Islands": "tc",
	Tuvalu: "tv",
	Uganda: "ug",
	Ukraine: "ua",
	"United Arab Emirates": "ae",
	"United Kingdom": "gb",
	"United States Minor Outlying Islands": "um",
	"United States of America": "us",
	USA: "us",
	Uruguay: "uy",
	Uzbekistan: "uz",
	Vanuatu: "vu",
	Venezuela: "ve",
	Vietnam: "vn",
	"British Virgin Islands": "vg",
	"U.S. Virgin Islands": "vi",
	"Virgin Islands": "vi",
	Wales: "gb-wls",
	"Wallis and Futuna": "wf",
	"Western Sahara": "eh",
	Yemen: "ye",
	Zambia: "zm",
	Zimbabwe: "zw",
};

const CountryFlag = ({
	className,
	country,
	override,
	style,
}: {
	className?: string;
	country: string;
	override?: string;
	style?: CSSProperties;
}) => {
	const flagOverrides = useLocal(state => state.flagOverrides);

	const country2 = helpers.getCountry(country);

	const actualOverride =
		override ?? flagOverrides[country] ?? flagOverrides[country2];

	if (actualOverride === "none") {
		return null;
	} else if (actualOverride) {
		return (
			<img
				src={actualOverride}
				className={classNames("flag-image", className)}
				alt={flagOverrides[country] ? country : country2}
				style={style}
			/>
		);
	}

	const code = countryCodes[country] ?? countryCodes[country2];
	if (code) {
		return (
			<span
				className={classNames(`fi fi-${code}`, className)}
				data-no-row-highlight="true"
				title={countryCodes[country] ? country : country2}
				style={style}
			></span>
		);
	}

	return null;
};

export default CountryFlag;
