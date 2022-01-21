import classNames from "classnames";
import PropTypes from "prop-types";
import type { MouseEvent, SyntheticEvent } from "react";
import { ReactNode, useCallback, useState } from "react";
import type { Col, Filter, SortBy, SuperCol } from ".";
import {
	SortableContainer,
	SortableElement,
	SortableHandle,
} from "react-sortable-hoc";

const FilterHeader = ({
	cols,
	filters,
	handleFilterUpdate,
}: {
	cols: Col[];
	filters: Filter[];
	handleFilterUpdate: (b: SyntheticEvent<HTMLInputElement>, a: string) => void;
}) => {
	return (
		<tr>
			{cols.map((col, colIndex) => {
				const filter = filters.find(f => col.key === f.col);
				return (
					<th key={colIndex}>
						{col.noSearch ? null : (
							<input
								className="datatable-filter-input"
								onChange={event => handleFilterUpdate(event, col.key ?? "")}
								type="text"
								value={filter ? filter.value : ""}
							/>
						)}
					</th>
				);
			})}
		</tr>
	);
};

FilterHeader.propTypes = {
	cols: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string.isRequired,
		}),
	).isRequired,
	filters: PropTypes.arrayOf(PropTypes.object).isRequired,
	handleFilterUpdate: PropTypes.func.isRequired,
};

const SuperCols = ({
	cols,
	superCols,
}: {
	cols: Col[];
	superCols: SuperCol[];
}) => {
	return (
		<tr>
			{superCols.map(({ colspan, desc, title }, i) => {
				return (
					<th
						key={i}
						colSpan={colspan}
						style={{
							textAlign: "center",
						}}
						title={desc}
					>
						{title}
					</th>
				);
			})}
		</tr>
	);
};
const SortableColumnHandle = SortableHandle(
	(props: { isDragged: boolean; selected: boolean; children: ReactNode }) => {
		return (
			<span
				className={classNames("d-inline-block border", {
					"user-select-none": props.isDragged,
					"table-secondary": props.selected,
				})}
				data-movable-handle
				style={{
					cursor: props.isDragged ? "grabbing" : "grab",
					padding: "0 0.2rem",
				}}
			>
				{props.children}
			</span>
		);
	},
);
SortableColumnHandle.propTypes = {
	isDragged: PropTypes.bool.isRequired,
};

const SortableColumn = SortableElement(
	(props: {
		isDragged: boolean;
		selected: boolean;
		col: Col;
		sortBy: SortBy | undefined;
		colIndex: number;
		handleColClick: (b: MouseEvent, a: string) => void;
	}) => {
		return (
			<th
				className={classNames(props.col.classNames, {
					sorted: props.sortBy,
				})}
			>
				<div
					className="d-flex user-select-none"
					style={{ marginRight: "-0.3rem" }}
				>
					<div className="flex-grow-1">{props.col.title}</div>
					<div
						onClick={event => {
							props.handleColClick(event, props.col.key);
						}}
						style={{ width: "19px" }}
						className={classNames({
							sorting: !props.sortBy && !props.isDragged,
							sorting_asc: props.sortBy && props.sortBy[1] === "asc",
							sorting_desc: props.sortBy && props.sortBy[1] === "desc",
						})}
					/>
				</div>
			</th>
		);
	},
);
const SortableColumnHeader = SortableContainer(
	(props: {
		indexSelected: number | undefined;
		isDragged: boolean;
		cols: Col[];
		sortBys: SortBy[];
		handleColClick: (b: MouseEvent, a: string) => void;
	}) => {
		return (
			<tr>
				{props.cols.map((col, index) => (
					<SortableColumn
						key={`item-${col.key}`}
						isDragged={props.isDragged}
						selected={props.indexSelected === index}
						index={index}
						colIndex={index}
						col={col}
						handleColClick={props.handleColClick}
						sortBy={props.sortBys.find((sort: SortBy) => sort[0] === col.key)}
					/>
				))}
			</tr>
		);
	},
);

const Header = ({
	cols,
	enableFilters,
	filters,
	handleColClick,
	handleReorder,
	handleFilterUpdate,
	sortBys,
	superCols,
}: {
	cols: Col[];
	enableFilters: boolean;
	filters: Filter[];
	handleColClick: (b: MouseEvent, a: string) => void;
	handleReorder: (oldIndex: number, newIndex: number) => void;
	handleFilterUpdate: (b: SyntheticEvent<HTMLInputElement>, a: string) => void;
	sortBys: SortBy[];
	superCols?: SuperCol[];
}) => {
	const [isDragged, setIsDragged] = useState(false);
	const [indexSelected, setIndexSelected] = useState<number | undefined>(
		undefined,
	);

	const onSortStart = useCallback(({ index }) => {
		setIsDragged(true);
		setIndexSelected(index);
	}, []);

	const onSortEnd = useCallback(
		({ oldIndex, newIndex }) => {
			setIsDragged(false);
			setIndexSelected(undefined);

			handleReorder(oldIndex, newIndex);
		},
		[handleReorder],
	);

	return (
		<thead>
			{superCols ? <SuperCols cols={cols} superCols={superCols} /> : null}
			<SortableColumnHeader
				cols={cols}
				sortBys={sortBys}
				isDragged={isDragged}
				indexSelected={indexSelected}
				axis={"x"}
				distance={5}
				transitionDuration={0}
				onSortStart={onSortStart}
				onSortEnd={onSortEnd}
				handleColClick={handleColClick}
			/>
			{enableFilters ? (
				<FilterHeader
					cols={cols}
					filters={filters}
					handleFilterUpdate={handleFilterUpdate}
				/>
			) : null}
		</thead>
	);
};

Header.propTypes = {
	cols: PropTypes.arrayOf(
		PropTypes.shape({
			desc: PropTypes.string,
			sortSequence: PropTypes.arrayOf(PropTypes.string),
			title: PropTypes.string.isRequired,
			width: PropTypes.string,
		}),
	).isRequired,
	enableFilters: PropTypes.bool.isRequired,
	filters: PropTypes.arrayOf(PropTypes.object).isRequired,
	handleColClick: PropTypes.func.isRequired,
	handleFilterUpdate: PropTypes.func.isRequired,
	sortBys: PropTypes.arrayOf(
		PropTypes.arrayOf(
			PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		),
	).isRequired,
	superCols: PropTypes.arrayOf(
		PropTypes.shape({
			colspan: PropTypes.number.isRequired,
			desc: PropTypes.string,
			title: PropTypes.any.isRequired,
		}),
	),
};

export default Header;
